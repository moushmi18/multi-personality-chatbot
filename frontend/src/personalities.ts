import type { PersonalityKey } from "./types";
import type { LucideIcon } from "lucide-react";
import {
  Target,
  Smile,
  Code2,
  Mic2,
  Heart,
  Swords,
  Lightbulb,
  BookOpen,
  PartyPopper,
  Flame,
} from "lucide-react";

export const PERSONALITY_ORDER: PersonalityKey[] = [
  "mentor", "friend", "expert", "interviewer",
  "therapist", "debater", "philosopher", "storyteller", "cheerleader", "roaster",
];

export const META: Record<PersonalityKey, {
  tagline: string;
  description: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
}> = {
  mentor: {
    tagline: "Tough love",
    description: "Direct, demanding, and pushes you to do better.",
    icon: Target,
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  },
  friend: {
    tagline: "Just vibes",
    description: "Casual, witty, and ready with a joke.",
    icon: Smile,
    color: "#eab308",
    gradient: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
  },
  expert: {
    tagline: "Deep technical",
    description: "Precise answers with concrete examples.",
    icon: Code2,
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
  },
  interviewer: {
    tagline: "Probing questions",
    description: "One question at a time, follow-ups included.",
    icon: Mic2,
    color: "#a855f7",
    gradient: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
  },
  therapist: {
    tagline: "Holds space",
    description: "Empathetic listener. No judgment, no rush.",
    icon: Heart,
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  debater: {
    tagline: "Counter-argues",
    description: "Challenges every claim. Stress-tests your thinking.",
    icon: Swords,
    color: "#f97316",
    gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
  },
  philosopher: {
    tagline: "Asks why",
    description: "First principles. Examines what you take for granted.",
    icon: Lightbulb,
    color: "#6366f1",
    gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
  },
  storyteller: {
    tagline: "Spins yarns",
    description: "Answers in vivid narrative. Show, don't tell.",
    icon: BookOpen,
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
  },
  cheerleader: {
    tagline: "Pure hype",
    description: "Relentlessly positive. Celebrates every win.",
    icon: PartyPopper,
    color: "#f472b6",
    gradient: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
  },
  roaster: {
    tagline: "Savage wit",
    description: "Helpful and brutal. Laughs at you, with you.",
    icon: Flame,
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  },
};

export const SUGGESTIONS: Record<PersonalityKey, string[]> = {
  mentor: ["Critique my project plan", "Why am I procrastinating?", "What should I focus on this week?"],
  friend: ["I had a rough day", "Tell me a fun fact", "What should I do this weekend?"],
  expert: ["Explain TCP congestion control", "When should I use a hash map vs a tree?", "Async/await vs threading"],
  interviewer: ["Interview me for a backend role", "Behavioral interview practice", "Mock system design round"],
  therapist: ["I'm overwhelmed at work", "I'm not sure what I want", "Help me untangle a feeling"],
  debater: ["Remote work is better than in-office", "Tabs over spaces", "AI will replace junior developers"],
  philosopher: ["What does success mean?", "Is free will real?", "Why do we work?"],
  storyteller: ["Tell me about a fork in the road", "How does recursion work — as a story", "A myth about ambition"],
  cheerleader: ["I learned a new framework today", "I shipped my first PR", "I worked out 3 days in a row"],
  roaster: ["Roast my codebase", "Critique my Tinder bio", "Roast my New Year resolutions"],
};
