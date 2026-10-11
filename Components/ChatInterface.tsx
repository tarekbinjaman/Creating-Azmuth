// ChatInterface.tsx
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import useSendMessage from "@/src/lib/hooks/useSendMessage";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type MemorySuggestion = {
  content: string;
  category: "personal_fact" | "preference" | "goal" | "instruction";
};

export default function ChatInterface({
  chatId,
  savedMessages,
}: {
  chatId: string;
  savedMessages: Message[];
}) {
  const [memorySuggestions, setMemorySuggestions] = useState<MemorySuggestion[]>([]);
const [savingMemory, setSavingMemory] = useState<string | null>(null);
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

setMemorySuggestions(data.memories ?? []);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    }
  }

  async function saveMemory(suggestion: MemorySuggestion) {
  const key = `${suggestion.category}:${suggestion.content}`;

  try {
    setSavingMemory(key);

    const response = await fetch("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(suggestion),
    });

    if (!response.ok) {
      throw new Error("Failed to save memory.");
    }

    setMemorySuggestions((current) =>
      current.filter((item) => item !== suggestion),
    );
  } catch (error) {
    console.error("Failed to save suggested memory:", error);
    alert("Could not save this memory. Please try again.");
  } finally {
    setSavingMemory(null);
  }
}

function dismissMemory(suggestion: MemorySuggestion) {
  setMemorySuggestions((current) =>
    current.filter((item) => item !== suggestion),
  );
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
        {memorySuggestions.length > 0 && (
  <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-gray-900">
    <h3 className="font-semibold">Possible memories</h3>
    <p className="text-sm text-gray-600">
      Would you like Astra to remember any of these?
    </p>

    {memorySuggestions.map((suggestion, index) => {
      const key = `${suggestion.category}:${suggestion.content}`;

      return (
        <div
          key={`${key}-${index}`}
          className="rounded-lg border bg-white p-3"
        >
          <span className="text-xs font-medium uppercase text-blue-700">
            {suggestion.category.replaceAll("_", " ")}
          </span>

          <p className="my-2 text-sm">{suggestion.content}</p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => saveMemory(suggestion)}
              disabled={savingMemory !== null}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              {savingMemory === key ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={() => dismissMemory(suggestion)}
              disabled={savingMemory !== null}
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      );
    })}
  </div>
)}

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
