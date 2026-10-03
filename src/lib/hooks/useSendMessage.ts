import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

type SendMessageInput = {
  chatId: string;
  messages: {
    role: "user" | "assistant";
    content: string;
  }[];
};

export default function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, messages }: SendMessageInput) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          messages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      return response.json();
    },

onSuccess: (data, variables) => {
  queryClient.invalidateQueries({
    queryKey: ["chats"],
  });

  queryClient.invalidateQueries({
    queryKey: ["messages", variables.chatId],
  });
},
  });
}