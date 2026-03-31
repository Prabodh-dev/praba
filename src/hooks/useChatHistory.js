import { useState, useCallback } from "react";

const STORAGE_KEY = "praba_chats";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(chats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch {
    // Ignore storage errors to keep chat UI responsive when storage is unavailable.
  }
}

function generateTitle(messages) {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New Chat";
  return first.content.slice(0, 40) + (first.content.length > 40 ? "…" : "");
}

export function useChatHistory() {
  const [chats, setChats] = useState(loadFromStorage);
  const [activeChatId, setActiveChatId] = useState(null);

  const saveChat = useCallback(
    (messages) => {
      if (!messages.length) return;

      setChats((prev) => {
        const existing = prev.find((c) => c.id === activeChatId);
        let updated;

        if (existing) {
          updated = prev.map((c) =>
            c.id === activeChatId
              ? { ...c, messages, updatedAt: Date.now() }
              : c,
          );
        } else {
          const newChat = {
            id: Date.now().toString(),
            title: generateTitle(messages),
            messages,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setActiveChatId(newChat.id);
          updated = [newChat, ...prev];
        }

        saveToStorage(updated);
        return updated;
      });
    },
    [activeChatId],
  );

  const loadChat = useCallback(
    (id) => {
      const chat = chats.find((c) => c.id === id);
      if (!chat) return null;
      setActiveChatId(id);
      return chat.messages;
    },
    [chats],
  );

  const deleteChat = useCallback(
    (id) => {
      setChats((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        saveToStorage(updated);
        return updated;
      });
      if (activeChatId === id) setActiveChatId(null);
    },
    [activeChatId],
  );

  const newChat = useCallback(() => {
    setActiveChatId(null);
  }, []);

  return { chats, activeChatId, saveChat, loadChat, deleteChat, newChat };
}
