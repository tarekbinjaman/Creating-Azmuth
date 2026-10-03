// ChatInterface.tsx
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import useSendMessage from "@/src/lib/hooks/useSendMessage";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatInterface({
  chatId,
  savedMessages,
}: {
  chatId: string;
  savedMessages: Message[];
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(savedMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendMessage = useSendMessage();
  const loading = sendMessage.isPending;

  // No more setMessages effect – state is initialized from savedMessages

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage: Message = { role: "user", content: message.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setMessage("");

    try {
      const data = await sendMessage.mutateAsync({
        chatId,
        messages: updatedMessages,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    }
  }

  return (
    <>
      {messages.length === 0 && (
        <div className="text-center">
          <h2 className="text-3xl font-semibold">How can I help you?</h2>
          <p className="mt-2 text-sm text-gray-500">
            Ask me anything about coding, learning, projects, or everyday tasks.
          </p>
        </div>
      )}

      <div className="space-y-4 pb-28">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[80%] rounded-2xl px-4 py-3 pb-4 ${
              msg.role === "user" ? "ml-auto bg-gray-700" : "mr-auto border"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="mr-auto rounded-2xl border px-4 py-3">
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-4 left-1/2 flex w-[calc(100%-3rem)] max-w-3xl -translate-x-1/2 items-center gap-3 rounded-2xl border bg-gray-500 p-3 shadow-sm"
      >
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Message Astra..."
          disabled={loading}
          className="flex-1 bg-transparent px-3 py-2 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl px-4 py-2 font-medium hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>
    </>
  );
}
