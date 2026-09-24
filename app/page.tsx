"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: message.trim(),
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex h-screen flex-col">
<header className="flex shrink-0 items-center justify-between border-b px-6 py-4">
  <h1 className="text-xl font-semibold">Astra</h1>

  <button
    onClick={() => setMessages([])}
    className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-100"
  >
    New Chat
  </button>
</header>

      <section className="flex min-h-0 flex-1 justify-center px-6 py-8">
        <div className="flex min-h-0 w-full max-w-3xl flex-col">
          {messages.length === 0 && (
            <div className="text-center">
              <h2 className="text-3xl font-semibold">How can I help you?</h2>

              <p className="mt-2 text-sm text-gray-500">
                Ask me anything about coding, learning, projects, or everyday
                tasks.
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
        </div>
      </section>
    </main>
  );
}
