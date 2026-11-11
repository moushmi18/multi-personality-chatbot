import { motion } from "framer-motion";
import type { Personality, PersonalityKey } from "../types";
import { META, SUGGESTIONS } from "../personalities";

type Props = {
  personalities: Record<PersonalityKey, Personality>;
  active: PersonalityKey;
  onSuggest: (text: string) => void;
};

export function EmptyState({ personalities, active, onSuggest }: Props) {
  const name = personalities[active]?.name ?? active;
  const meta = META[active];
  const suggestions = SUGGESTIONS[active];
  const Icon = meta.icon;

  return (
    <motion.div
      className="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      key={active}
    >
      <motion.div 
        className="empty-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          className="empty-icon"
          initial={{ scale: 0.5, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          style={{ "--icon-color": meta.color, "--icon-gradient": meta.gradient } as React.CSSProperties}
        >
          <Icon size={32} />
        </motion.div>
        <h2>
          Start chatting with <span className="empty-name" style={{ color: meta.color }}>{name}</span>
        </h2>
        <p className="empty-sub">{meta.description}</p>
      </motion.div>

      <motion.div 
        className="empty-suggestions"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="empty-suggestions-label">Try one of these</div>
        <div className="empty-suggestions-grid">
          {suggestions.map((s, i) => (
            <motion.button
              key={s}
              className="suggestion"
              onClick={() => onSuggest(s)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              style={{ "--suggestion-color": meta.color } as React.CSSProperties}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
