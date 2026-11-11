import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Personality, PersonalityKey } from "../types";
import { PERSONALITY_ORDER } from "../personalities";
import { PersonalityCard } from "./PersonalityCard";

type Props = {
  personalities: Record<PersonalityKey, Personality>;
  favourites: PersonalityKey[];
  onSelect: (key: PersonalityKey) => void;
  onToggleFavourite: (key: PersonalityKey) => void;
};

export function Dashboard({ personalities, favourites, onSelect, onToggleFavourite }: Props) {
  const availableOrder = PERSONALITY_ORDER.filter((k) => k in personalities);

  return (
    <div className="dashboard">
      <div className="dashboard-bg" />
      
      <motion.div 
        className="dashboard-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="dashboard-header">
          <motion.div 
            className="dashboard-logo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <Sparkles size={28} />
          </motion.div>
          <motion.span 
            className="dashboard-brand"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            PERSONA AI
          </motion.span>
        </header>

        <motion.div 
          className="dashboard-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1>Who do you want to talk to today?</h1>
          <p>Your AI. Your mood. Your personality. Choose your companion and start a conversation.</p>
        </motion.div>

        <motion.div 
          className="dashboard-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {availableOrder.map((key, idx) => (
            <PersonalityCard
              key={key}
              personalityKey={key}
              personality={personalities[key]}
              isFavourite={favourites.includes(key)}
              onSelect={() => onSelect(key)}
              onToggleFavourite={() => onToggleFavourite(key)}
              delay={0.05 * idx}
            />
          ))}
        </motion.div>

        <motion.p 
          className="dashboard-tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          One AI. Ten Personalities. Endless Perspectives.
        </motion.p>
      </motion.div>
    </div>
  );
}
