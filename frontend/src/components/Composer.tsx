import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  placeholder: string;
  accentColor?: string;
};

export type ComposerHandle = { focus: () => void };

export const Composer = forwardRef<ComposerHandle, Props>(function Composer(
  { value, onChange, onSend, disabled, placeholder, accentColor },
  handleRef,
) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(handleRef, () => ({
    focus: () => ref.current?.focus(),
  }));

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${Math.min(ref.current.scrollHeight, 160)}px`;
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="composer" style={{ "--composer-color": accentColor } as React.CSSProperties}>
      <div className="composer-inner">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
        />
        <motion.button
          className="send-btn"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
        >
          <Send size={18} />
        </motion.button>
      </div>
      <p className="composer-hint">
        Enter to send · Shift+Enter for newline
      </p>
    </div>
  );
});
