import { motion, AnimatePresence } from "framer-motion";
import { Menu, Star, Trash2 } from "lucide-react";
import type { Personality, PersonalityKey } from "../types";
import { META } from "../personalities";

type Props = {
  personalities: Record<PersonalityKey, Personality>;
  active: PersonalityKey;
  isFavourite: boolean;
  canClear: boolean;
  streaming: boolean;
  onMenuOpen: () => void;
  onToggleFavourite: () => void;
  onClear: () => void;
};

export function ChatHeader({
  personalities,
  active,
  isFavourite,
  canClear,
  streaming,
  onMenuOpen,
  onToggleFavourite,
  onClear,
}: Props) {
  const meta = META[active];
  const Icon = meta.icon;
  const name = personalities[active]?.name ?? meta.tagline;

  return (
    <header className="chat-header" style={{ "--header-color": meta.color } as React.CSSProperties}>
      <button className="header-menu-btn" onClick={onMenuOpen}>
        <Menu size={20} />
      </button>

      <div className="header-personality">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="header-avatar"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Icon size={18} />
          </motion.div>
        </AnimatePresence>
        <div className="header-info">
          <AnimatePresence mode="wait">
            <motion.span
              key={active}
              className="header-name"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
            >
              {name}
            </motion.span>
          </AnimatePresence>
          <span className="header-tagline">{meta.tagline}</span>
        </div>
      </div>

      <div className="header-actions">
        <button
          className={`header-action-btn ${isFavourite ? "starred" : ""}`}
          onClick={onToggleFavourite}
          disabled={streaming}
          aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
        >
          <Star size={18} fill={isFavourite ? "currentColor" : "none"} />
        </button>
        <button
          className="header-action-btn"
          onClick={onClear}
          disabled={streaming || !canClear}
          aria-label="Clear conversation"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </header>
  );
}
