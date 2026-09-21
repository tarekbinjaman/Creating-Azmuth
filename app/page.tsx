"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
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
    <main className="flex min-h-screen flex-col">
      <header className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Astra</h1>
      </header>

      <section className="flex flex-1 justify-center px-6 py-8">
        <div className="flex w-full max-w-3xl flex-col">
          {messages.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <h2 className="text-center text-3xl font-semibold">
                How can I help you?
              </h2>
            </div>
          )}

          <div className="flex-1 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "ml-auto bg-gray-100"
                    : "mr-auto border"
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
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex items-center gap-3 rounded-2xl border p-3 shadow-sm"
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
              Send
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}