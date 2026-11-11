import { useEffect, useState } from "react";
import type { ChatItem, Message, Personality, PersonalityKey } from "./types";
import { PERSONALITY_ORDER } from "./personalities";

type ChatState = {
  personalities: Record<PersonalityKey, Personality> | null;
  active: PersonalityKey;
  items: ChatItem[];
  streaming: boolean;
  waitingForFirstToken: boolean;
};

type SsePayload =
  | { type: "mode"; mode: PersonalityKey; name: string }
  | { type: "text"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

export function useChat() {
  const [state, setState] = useState<ChatState>({
    personalities: null,
    active: "friend",
    items: [],
    streaming: false,
    waitingForFirstToken: false,
  });

  useEffect(() => {
    fetch("/api/personalities", { signal: AbortSignal.timeout(5000) })
      .then((r) => r.json())
      .then((data: Record<string, Personality>) => {
        setState((s) => ({
          ...s,
          personalities: data as Record<PersonalityKey, Personality>,
          active: s.active in data
            ? s.active
            : (PERSONALITY_ORDER.find((k) => k in data) ?? s.active),
        }));
      })
      .catch((err) => {
        const msg = err?.name === "TimeoutError"
          ? "Backend timed out (5s). Is server.py running on port 8000?"
          : "Can't reach the backend. Is server.py running on port 8000?";
        setState((s) => ({
          ...s,
          items: [{ role: "system", content: msg }],
        }));
      });
  }, []);

  function setActive(active: PersonalityKey) {
    setState((s) => (s.active === active ? s : { ...s, active, items: [] }));
  }

  function clearChat() {
    setState((s) => ({ ...s, items: [] }));
  }

  function appendItem(item: ChatItem) {
    setState((s) => ({ ...s, items: [...s.items, item] }));
  }

  function updateLastAssistant(append: string) {
    setState((s) => {
      const last = s.items[s.items.length - 1];
      if (!last || last.role !== "assistant") return s;
      const next = [...s.items];
      next[next.length - 1] = { ...last, content: last.content + append };
      return { ...s, items: next };
    });
  }

  async function sendMessage(text: string): Promise<boolean> {
    if (!text.trim() || state.streaming) return false;

    const userMessage: Message = { role: "user", content: text.trim() };
    const apiMessages = [
      ...state.items.filter((i): i is Message => i.role !== "system"),
      userMessage,
    ];

    setState((s) => ({
      ...s,
      items: [...s.items, userMessage],
      streaming: true,
      waitingForFirstToken: true,
    }));

    let assistantPersonality: PersonalityKey = state.active;
    let assistantStarted = false;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages.map((m) => ({ role: m.role, content: m.content })),
          personality: state.active,
        }),
      });

      if (!response.ok || !response.body) throw new Error(`Backend error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const line = event.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          let payload: SsePayload;
          try {
            payload = JSON.parse(line.slice(6)) as SsePayload;
          } catch {
            continue;
          }

          if (payload.type === "mode") {
            assistantPersonality = payload.mode as PersonalityKey;
            setState((s) => ({
              ...s,
              active: assistantPersonality,
              items: [...s.items, { role: "system", content: `Switched to ${payload.name}` }],
            }));
          } else if (payload.type === "text") {
            if (!assistantStarted) {
              assistantStarted = true;
              setState((s) => ({
                ...s,
                waitingForFirstToken: false,
                items: [...s.items, {
                  role: "assistant",
                  content: payload.text,
                  personality: assistantPersonality,
                }],
              }));
            } else {
              updateLastAssistant(payload.text);
            }
          } else if (payload.type === "error") {
            setState((s) => ({ ...s, waitingForFirstToken: false }));
            appendItem({ role: "system", content: `Error: ${payload.message}` });
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      appendItem({ role: "system", content: `Error: ${msg}` });
    } finally {
      setState((s) => ({ ...s, streaming: false, waitingForFirstToken: false }));
    }
    return true;
  }

  function loadConversation(personality: PersonalityKey, items: ChatItem[]) {
    setState((s) => ({
      ...s,
      active: personality,
      items,
      streaming: false,
      waitingForFirstToken: false,
    }));
  }

  return {
    ...state,
    setActive,
    clearChat,
    sendMessage,
    loadConversation,
  };
}
