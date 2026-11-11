import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { Personality, PersonalityKey } from "../types";
import { META } from "../personalities";

type Props = {
  personalityKey: PersonalityKey;
  personality: Personality;
  isFavourite: boolean;
  onSelect: () => void;
  onToggleFavourite: () => void;
  delay?: number;
};

export function PersonalityCard({
  personalityKey,
  personality,
  isFavourite,
  onSelect,
  onToggleFavourite,
  delay = 0,
}: Props) {
  const meta = META[personalityKey];
  const Icon = meta.icon;

  return (
    <motion.div
      className={`personality-card card-${personalityKey}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onSelect}
      style={{ "--card-color": meta.color, "--card-gradient": meta.gradient } as React.CSSProperties}
    >
      <button
        className={`card-star ${isFavourite ? "starred" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavourite();
        }}
        aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
      >
        <Star size={16} fill={isFavourite ? "currentColor" : "none"} />
      </button>

      <div className="card-avatar">
        <Icon size={24} />
      </div>

      <div className="card-content">
        <h3 className="card-name">{personality.name}</h3>
        <p className="card-tagline">{meta.tagline}</p>
        <p className="card-description">{meta.description}</p>
      </div>

      <div className="card-glow" />
    </motion.div>
  );
}
