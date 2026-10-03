import { useQuery } from "@tanstack/react-query";

export default function useMessages(chatId: string) {
  return useQuery({
    queryKey: ["messages", chatId],
    queryFn: async () => {
      const response = await fetch(`/api/chat?chatId=${chatId}`);

      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      const data = await response.json();

      return data.messages;
    },
    enabled: !!chatId,
  });
}