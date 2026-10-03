// page.tsx
"use client";

import { useEffect, useState } from "react";
import useChats from "@/src/lib/hooks/useChats";
import useMessages from "@/src/lib/hooks/useMessages";
import ChatInterface from "../Components/ChatInterface"; // adjust path

export default function Home() {
  const [chatId, setChatId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("astra-chat-id") || crypto.randomUUID();
    }
    return "";
  });

  const { data: chats = [] } = useChats();
  const { data: savedMessages = [] } = useMessages(chatId);

  useEffect(() => {
    if (chatId) {
      localStorage.setItem("astra-chat-id", chatId);
    }
  }, [chatId]);

  function handleNewChat() {
    const newChatId = crypto.randomUUID();
    localStorage.setItem("astra-chat-id", newChatId);
    setChatId(newChatId);
  }

  return (
    <main className="flex h-screen flex-col">
      <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-gray-600 p-4">
        <h2 className="mb-4 font-semibold">Chat History</h2>
        <div className="space-y-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setChatId(chat.id)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-700"
            >
              {chat.title || "New Chat"}
            </button>
          ))}
        </div>
      </aside>

      <header className="flex shrink-0 items-center justify-between border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Astra</h1>
        <button
          onClick={handleNewChat}
          className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-100"
        >
          New Chat
        </button>
      </header>

      <section className="flex min-h-0 flex-1 justify-center px-6 py-8">
        <div className="flex min-h-0 w-full max-w-3xl flex-col">
          <ChatInterface key={chatId} chatId={chatId} savedMessages={savedMessages} />
        </div>
      </section>
    </main>
  );
}