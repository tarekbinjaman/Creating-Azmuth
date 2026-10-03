import { useQuery } from "@tanstack/react-query";

export default function useChats() {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const response = await fetch("/api/chat");

      if (!response.ok) {
        throw new Error("Failed to load chats");
      }

      const data = await response.json();

      return data.chats;
    },
  });
}