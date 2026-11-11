import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "./useChat";
import { Dashboard } from "./components/Dashboard";
import { ChatView } from "./components/ChatView";
import type { PersonalityKey } from "./types";
import {
  getConversations,
  saveConversation,
  deleteConversation,
  clearAllConversations,
  getFavourites,
  toggleFavourite,
  generateId,
  type SavedConversation,
} from "./store";
import "./App.css";

type View = "dashboard" | "chat";

export default function App() {
  const chat = useChat();
  const [view, setView] = useState<View>("dashboard");
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [favourites, setFavourites] = useState<PersonalityKey[]>([]);

  // Load persisted data on mount
  useEffect(() => {
    setConversations(getConversations());
    setFavourites(getFavourites());
  }, []);

  // Save conversation when items change
  useEffect(() => {
    if (!chat.personalities || chat.items.length === 0 || !currentConversationId) return;

    const firstUserMessage = chat.items.find((i) => i.role === "user");
    const title = firstUserMessage
      ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "")
      : "New conversation";

    const conv: SavedConversation = {
      id: currentConversationId,
      personality: chat.active,
      title,
      items: chat.items,
      createdAt: conversations.find((c) => c.id === currentConversationId)?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };

    saveConversation(conv);
    setConversations(getConversations());
  }, [chat.items, chat.active, currentConversationId, chat.personalities]);

  const handleSelectPersonality = useCallback((key: PersonalityKey) => {
    const id = generateId();
    setCurrentConversationId(id);
    chat.setActive(key);
    setView("chat");
  }, [chat]);

  const handleToggleFavourite = useCallback((key: PersonalityKey) => {
    const updated = toggleFavourite(key);
    setFavourites(updated);
  }, []);

  const handleNewChat = useCallback(() => {
    const id = generateId();
    setCurrentConversationId(id);
    chat.clearChat();
    setView("chat");
  }, [chat]);

  const handleExplore = useCallback(() => {
    setView("dashboard");
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;

    setCurrentConversationId(id);
    chat.loadConversation(conv.personality, conv.items);
    setView("chat");
  }, [conversations, chat]);

  const handleDeleteConversation = useCallback((id: string) => {
    deleteConversation(id);
    setConversations(getConversations());
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      chat.clearChat();
    }
  }, [currentConversationId, chat]);

  const handleSelectFavourite = useCallback((key: PersonalityKey) => {
    handleSelectPersonality(key);
  }, [handleSelectPersonality]);

  const handleClearChat = useCallback(() => {
    chat.clearChat();
    if (currentConversationId) {
      deleteConversation(currentConversationId);
      setConversations(getConversations());
      setCurrentConversationId(generateId());
    }
  }, [chat, currentConversationId]);

  const handleClearHistory = useCallback(() => {
    clearAllConversations();
    setConversations([]);
    setCurrentConversationId(null);
    chat.clearChat();
  }, [chat]);

  // Loading state
  if (!chat.personalities) {
    const errorNote = chat.items.find((i) => i.role === "system");
    if (errorNote) {
      return (
        <div className="loading">
          <div className="loading-error">
            <div className="loading-error-icon">!</div>
            <h2>Backend unreachable</h2>
            <p>{errorNote.content}</p>
            <button onClick={() => location.reload()}>Reload</button>
          </div>
        </div>
      );
    }
    return (
      <div className="loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {view === "dashboard" ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ height: "100%" }}
          >
            <Dashboard
              personalities={chat.personalities}
              favourites={favourites}
              onSelect={handleSelectPersonality}
              onToggleFavourite={handleToggleFavourite}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ height: "100%" }}
          >
            <ChatView
              personalities={chat.personalities}
              active={chat.active}
              items={chat.items}
              streaming={chat.streaming}
              waitingForFirstToken={chat.waitingForFirstToken}
              conversations={conversations}
              currentConversationId={currentConversationId}
              favourites={favourites}
              onSendMessage={chat.sendMessage}
              onNewChat={handleNewChat}
              onExplore={handleExplore}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onSelectFavourite={handleSelectFavourite}
              onToggleFavourite={handleToggleFavourite}
              onClearChat={handleClearChat}
              onClearHistory={handleClearHistory}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
