import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Personality, PersonalityKey, ChatItem } from "../types";
import type { SavedConversation } from "../store";
import { META } from "../personalities";
import { ChatSidebar } from "./ChatSidebar";
import { ChatHeader } from "./ChatHeader";
import { EmptyState } from "./EmptyState";
import { ChatMessage, TypingIndicator } from "./ChatMessage";
import { Composer, type ComposerHandle } from "./Composer";

type Props = {
  personalities: Record<PersonalityKey, Personality>;
  active: PersonalityKey;
  items: ChatItem[];
  streaming: boolean;
  waitingForFirstToken: boolean;
  conversations: SavedConversation[];
  currentConversationId: string | null;
  favourites: PersonalityKey[];
  onSendMessage: (text: string) => Promise<boolean>;
  onNewChat: () => void;
  onExplore: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onSelectFavourite: (key: PersonalityKey) => void;
  onToggleFavourite: (key: PersonalityKey) => void;
  onClearChat: () => void;
  onClearHistory: () => void;
};

export function ChatView({
  personalities,
  active,
  items,
  streaming,
  waitingForFirstToken,
  conversations,
  currentConversationId,
  favourites,
  onSendMessage,
  onNewChat,
  onExplore,
  onSelectConversation,
  onDeleteConversation,
  onSelectFavourite,
  onToggleFavourite,
  onClearChat,
  onClearHistory,
}: Props) {
  const [input, setInput] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<ComposerHandle>(null);

  const meta = META[active];
  const activeName = personalities[active]?.name ?? meta.tagline;
  const isFavourite = favourites.includes(active);

  useEffect(() => {
    if (!autoScroll) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: streaming ? "auto" : "smooth",
    });
  }, [items, waitingForFirstToken, streaming, autoScroll]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAutoScroll(distanceFromBottom < 80);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    const saved = input;
    setInput("");
    setAutoScroll(true);
    const ok = await onSendMessage(text);
    if (!ok) setInput(saved);
  }

  return (
    <div className={`chat-view theme-${active}`}>
      <ChatSidebar
        personalities={personalities}
        activePersonality={active}
        conversations={conversations}
        currentConversationId={currentConversationId}
        favourites={favourites}
        isOpen={sidebarOpen}
        showSettings={showSettings}
        onNewChat={() => {
          onNewChat();
          setSidebarOpen(false);
        }}
        onExplore={() => {
          onExplore();
          setSidebarOpen(false);
        }}
        onSelectConversation={(id) => {
          onSelectConversation(id);
          setSidebarOpen(false);
        }}
        onDeleteConversation={onDeleteConversation}
        onSelectFavourite={(key) => {
          onSelectFavourite(key);
          setSidebarOpen(false);
        }}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onClearHistory={() => {
          onClearHistory();
          setShowSettings(false);
        }}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="chat-main">
        <ChatHeader
          personalities={personalities}
          active={active}
          isFavourite={isFavourite}
          canClear={items.length > 0}
          streaming={streaming}
          onMenuOpen={() => setSidebarOpen(true)}
          onToggleFavourite={() => onToggleFavourite(active)}
          onClear={onClearChat}
        />

        <div className="chat-messages" ref={scrollRef} onScroll={handleScroll}>
          <AnimatePresence mode="wait">
            {items.length === 0 && (
              <EmptyState
                key={active}
                personalities={personalities}
                active={active}
                onSuggest={(s) => {
                  setInput(s);
                  composerRef.current?.focus();
                }}
              />
            )}
          </AnimatePresence>

          {items.map((item, idx) => (
            <ChatMessage key={idx} item={item} personalities={personalities} />
          ))}

          {waitingForFirstToken && (
            <TypingIndicator active={active} activeName={activeName} />
          )}
        </div>

        <Composer
          ref={composerRef}
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={streaming}
          placeholder={`Message ${activeName}...`}
          accentColor={meta.color}
        />
      </main>
    </div>
  );
}
