"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Memory = {
  id: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [content, setContent] = useState("");
const [category, setCategory] = useState("personal_fact");
const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function saveMemory(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const trimmedContent = content.trim();

  if (!trimmedContent) {
    setError("Please enter a memory.");
    return;
  }

  try {
    setSaving(true);
    setError("");

    const response = await fetch("/api/memories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: trimmedContent,
        category,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to save memory.");
    }

    setMemories((current) => [data.memory, ...current]);
    setContent("");
    setCategory("personal_fact");
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Could not save memory. Please try again.",
    );
  } finally {
    setSaving(false);
  }
}

useEffect(() => {
  let cancelled = false;

  async function fetchMemories() {
    try {
      const response = await fetch("/api/memories");

      if (!response.ok) {
        throw new Error("Failed to load memories.");
      }

      const data = await response.json();

      if (!cancelled) {
        setMemories(data.memories);
      }
    } catch {
      if (!cancelled) {
        setError("Could not load memories. Please try again.");
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  fetchMemories();

  return () => {
    cancelled = true;
  };
}, []);

  async function deleteMemory(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this memory?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(`/api/memories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete memory.");
      }

      setMemories((current) => current.filter((memory) => memory.id !== id));
    } catch {
      setError("Could not delete this memory. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Astra Memories</h1>
            <p className="mt-2 text-sm text-gray-600">
              View and manage what Astra remembers about you.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-100"
          >
            Back to Chat
          </Link>
        </div>
          <form
  onSubmit={saveMemory}
  className="mb-8 space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
>
  <h2 className="text-lg font-semibold">Add a Memory</h2>

  <div>
    <label
      htmlFor="memory-content"
      className="mb-2 block text-sm font-medium"
    >
      What should Astra remember?
    </label>

    <textarea
      id="memory-content"
      value={content}
      onChange={(event) => setContent(event.target.value)}
      placeholder="For example: I prefer beginner-friendly coding explanations."
      rows={3}
      required
      className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500"
    />
  </div>

  <div>
    <label
      htmlFor="memory-category"
      className="mb-2 block text-sm font-medium"
    >
      Category
    </label>

    <select
      id="memory-category"
      value={category}
      onChange={(event) => setCategory(event.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm"
    >
      <option value="personal_fact">Personal Fact</option>
      <option value="preference">Preference</option>
      <option value="goal">Goal</option>
      <option value="instruction">Instruction</option>
    </select>
  </div>

  <button
    type="submit"
    disabled={saving}
    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
  >
    {saving ? "Saving..." : "Save Memory"}
  </button>
</form>

        {error && (
          <p className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-gray-600">Loading memories...</p>
        ) : memories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <h2 className="font-semibold">No memories yet</h2>
            <p className="mt-2 text-sm text-gray-600">
              Memories Astra saves will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {memories.map((memory) => (
              <article
                key={memory.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {memory.category.replaceAll("_", " ")}
                    </span>

                    <p className="mt-3 whitespace-pre-wrap break-words">
                      {memory.content}
                    </p>

                    <p className="mt-3 text-xs text-gray-500">
                      Updated: {new Date(memory.updatedAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteMemory(memory.id)}
                    disabled={deletingId !== null}
                    className="self-start rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === memory.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}