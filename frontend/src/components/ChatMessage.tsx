import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import type { ChatItem, Personality, PersonalityKey } from "../types";
import { META } from "../personalities";

type Props = {
  item: ChatItem;
  personalities: Record<PersonalityKey, Personality>;
};

export function ChatMessage({ item, personalities }: Props) {
  const [copied, setCopied] = useState(false);

  if (item.role === "system") {
    return (
      <motion.div
        className="system-note"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <span className="system-dot" />
        {item.content}
      </motion.div>
    );
  }

  if (item.role === "user") {
    return (
      <motion.div
        className="row row-user"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="bubble bubble-user">{item.content}</div>
      </motion.div>
    );
  }

  const personality = item.personality ?? "friend";
  const meta = META[personality];
  const Icon = meta.icon;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <motion.div
      className={`row row-assistant`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ "--msg-color": meta.color } as React.CSSProperties}
    >
      <div className="avatar">
        <Icon size={18} />
      </div>
      <div className="msg-body">
        <div className="msg-header">
          <div className="msg-name">{personalities[personality]?.name ?? personality}</div>
          <button className="copy-btn" onClick={handleCopy} aria-label="Copy message">
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="bubble bubble-assistant">
          <ReactMarkdown>{item.content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}

type TypingProps = {
  active: PersonalityKey;
  activeName: string;
};

export function TypingIndicator({ active, activeName }: TypingProps) {
  const meta = META[active];
  const Icon = meta.icon;
  
  return (
    <motion.div
      className="row row-assistant"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{ "--msg-color": meta.color } as React.CSSProperties}
    >
      <div className="avatar">
        <Icon size={18} />
      </div>
      <div className="msg-body">
        <div className="msg-name">{activeName}</div>
        <div className="bubble bubble-assistant typing">
          <span /><span /><span />
        </div>
      </div>
    </motion.div>
  );
}
