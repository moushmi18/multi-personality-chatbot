import type { PersonalityKey, ChatItem } from "./types";

export type SavedConversation = {
  id: string;
  personality: PersonalityKey;
  title: string;
  items: ChatItem[];
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEYS = {
  conversations: "persona-ai-conversations",
  favourites: "persona-ai-favourites",
  currentConversation: "persona-ai-current",
};

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getConversations(): SavedConversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.conversations);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveConversation(conv: SavedConversation): void {
  const conversations = getConversations();
  const idx = conversations.findIndex((c) => c.id === conv.id);
  if (idx >= 0) {
    conversations[idx] = conv;
  } else {
    conversations.unshift(conv);
  }
  localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(conversations.slice(0, 50)));
}

export function deleteConversation(id: string): void {
  const conversations = getConversations().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(conversations));
}

export function clearAllConversations(): void {
  localStorage.removeItem(STORAGE_KEYS.conversations);
  localStorage.removeItem(STORAGE_KEYS.currentConversation);
}

export function getFavourites(): PersonalityKey[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.favourites);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleFavourite(key: PersonalityKey): PersonalityKey[] {
  const favourites = getFavourites();
  const idx = favourites.indexOf(key);
  if (idx >= 0) {
    favourites.splice(idx, 1);
  } else {
    favourites.push(key);
  }
  localStorage.setItem(STORAGE_KEYS.favourites, JSON.stringify(favourites));
  return favourites;
}

export function getCurrentConversationId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.currentConversation);
}

export function setCurrentConversationId(id: string | null): void {
  if (id) {
    localStorage.setItem(STORAGE_KEYS.currentConversation, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.currentConversation);
  }
}
