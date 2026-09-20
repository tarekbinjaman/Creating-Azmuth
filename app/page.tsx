"use client";

import { FormEvent, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim()) return;

    setMessages((prev) => [...prev, message]);
    setMessage("");
    console.log("Messages", messages)
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Azmuth</h1>
      </header>

      {/* Chat Area */}
      <section className="flex flex-1 justify-center px-6 py-8">
        <div className="flex w-full max-w-3xl flex-col">
          {/* Messages */}
          <div className="flex-1 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className="ml-auto w-fit max-w-[80%] rounded-2xl bg-gray-700 px-4 py-3"
              >
                {msg}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {messages.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <h2 className="text-center text-3xl font-semibold">
                How can I help you?
              </h2>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex items-center gap-3 rounded-2xl border p-3 shadow-sm"
          >
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Message Azmuth..."
              className="flex-1 bg-transparent px-3 py-2 outline-none"
            />

            <button
              type="submit"
              className="rounded-xl px-4 py-2 font-medium hover:bg-gray-100"
            >
              Send
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}