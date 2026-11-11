import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Plus,
  Compass,
  MessageSquare,
  Star,
  Settings,
  User,
  Trash2,
  ChevronRight,
  X,
} from "lucide-react";
import type { Personality, PersonalityKey } from "../types";
import type { SavedConversation } from "../store";
import { META, PERSONALITY_ORDER } from "../personalities";

type Props = {
  personalities: Record<PersonalityKey, Personality>;
  activePersonality: PersonalityKey;
  conversations: SavedConversation[];
  currentConversationId: string | null;
  favourites: PersonalityKey[];
  isOpen: boolean;
  showSettings: boolean;
  onNewChat: () => void;
  onExplore: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onSelectFavourite: (key: PersonalityKey) => void;
  onToggleSettings: () => void;
  onClearHistory: () => void;
  onClose: () => void;
};

export function ChatSidebar({
  personalities,
  conversations,
  currentConversationId,
  favourites,
  isOpen,
  showSettings,
  onNewChat,
  onExplore,
  onSelectConversation,
  onDeleteConversation,
  onSelectFavourite,
  onToggleSettings,
  onClearHistory,
  onClose,
}: Props) {
  const recentConversations = conversations.slice(0, 10);
  const favouritePersonalities = PERSONALITY_ORDER.filter((k) => favourites.includes(k) && k in personalities);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`chat-sidebar ${isOpen ? "open" : ""}`}
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Sparkles size={22} />
          </div>
          <span className="sidebar-title">PERSONA AI</span>
          <button className="sidebar-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Actions */}
        <div className="sidebar-actions">
          <button className="sidebar-btn primary" onClick={onNewChat}>
            <Plus size={18} />
            <span>New Chat</span>
          </button>
          <button className="sidebar-btn" onClick={onExplore}>
            <Compass size={18} />
            <span>Explore Personalities</span>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="sidebar-scroll">
          {/* Recent Chats */}
          {recentConversations.length > 0 && (
            <div className="sidebar-section">
              <div className="sidebar-section-header">
                <MessageSquare size={14} />
                <span>Recent Chats</span>
              </div>
              <div className="sidebar-list">
                {recentConversations.map((conv) => {
                  const meta = META[conv.personality];
                  const Icon = meta.icon;
                  const isActive = conv.id === currentConversationId;

                  return (
                    <motion.button
                      key={conv.id}
                      className={`sidebar-item ${isActive ? "active" : ""}`}
                      onClick={() => onSelectConversation(conv.id)}
                      whileTap={{ scale: 0.98 }}
                      style={{ "--item-color": meta.color } as React.CSSProperties}
                    >
                      <div className="sidebar-item-icon">
                        <Icon size={16} />
                      </div>
                      <div className="sidebar-item-content">
                        <span className="sidebar-item-title">{conv.title}</span>
                        <span className="sidebar-item-meta">{personalities[conv.personality]?.name}</span>
                      </div>
                      <button
                        className="sidebar-item-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Favourite Personalities */}
          {favouritePersonalities.length > 0 && (
            <div className="sidebar-section">
              <div className="sidebar-section-header">
                <Star size={14} />
                <span>Favourites</span>
              </div>
              <div className="sidebar-list">
                {favouritePersonalities.map((key) => {
                  const meta = META[key];
                  const Icon = meta.icon;

                  return (
                    <motion.button
                      key={key}
                      className="sidebar-item"
                      onClick={() => onSelectFavourite(key)}
                      whileTap={{ scale: 0.98 }}
                      style={{ "--item-color": meta.color } as React.CSSProperties}
                    >
                      <div className="sidebar-item-icon">
                        <Icon size={16} />
                      </div>
                      <div className="sidebar-item-content">
                        <span className="sidebar-item-title">{personalities[key]?.name}</span>
                        <span className="sidebar-item-meta">{meta.tagline}</span>
                      </div>
                      <ChevronRight size={14} className="sidebar-item-arrow" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className={`sidebar-footer-btn ${showSettings ? "active" : ""}`}
            onClick={onToggleSettings}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              <User size={16} />
            </div>
            <span>Guest</span>
          </div>
        </div>

        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="settings-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="settings-header">
                <h3>Settings</h3>
                <button onClick={onToggleSettings}>
                  <X size={18} />
                </button>
              </div>
              <div className="settings-content">
                <button className="settings-danger-btn" onClick={onClearHistory}>
                  <Trash2 size={16} />
                  <span>Clear All History</span>
                </button>
                <p className="settings-note">
                  This will delete all saved conversations and cannot be undone.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
}
