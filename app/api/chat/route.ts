import Groq from "groq-sdk";
import { prisma } from "../../../src/lib/prisma";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { chatId, messages } = await request.json();
    console.log("Chat ID:", chatId);
    // creating record=======================================================================
const firstUserMessage = messages.find(
  (message: { role: string; content: string }) =>
    message.role === "user",
);

const existingChat = await prisma.chat.findUnique({
  where: {
    id: chatId,
  },
});

await prisma.chat.upsert({
  where: {
    id: chatId,
  },
  update: existingChat?.title
    ? {}
    : {
        title: firstUserMessage?.content.slice(0, 50),
      },
  create: {
    id: chatId,
    title: firstUserMessage?.content.slice(0, 50),
  },
});
    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Messages are required" }, { status: 400 });
    }

    // save chat==================================================================
    const latestMessage = messages[messages.length - 1];

    await prisma.message.create({
      data: {
        role: latestMessage.role,
        content: latestMessage.content,
        chatId,
      },
    });

const completion = await groq.chat.completions.create({
  messages: [
    {
      role: "system",
      content:
        "You are Astra, a helpful personal AI assistant. Be clear, friendly, and concise. Help the user with coding, learning, projects, and everyday tasks.",
    },
    ...messages.map(
      (message: { role: string; content: string }) => ({
        role: message.role as "user" | "assistant",
        content: message.content,
      }),
    ),
  ],
  model: "openai/gpt-oss-20b",
});

    const reply = completion.choices[0]?.message?.content;
    if (reply) {
      await prisma.message.create({
        data: {
          role: "assistant",
          content: reply,
          chatId,
        },
      });
    }
    return Response.json({
      reply: reply || "I couldn't generate a response.",
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { error: "Something went wrong while talking to Astra." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (chatId) {
      const messages = await prisma.message.findMany({
        where: {
          chatId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return Response.json({ messages });
    }

    const chats = await prisma.chat.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    return Response.json({ chats });
  } catch (error) {
    console.error("Get chat data error:", error);

    return Response.json(
      { error: "Failed to load chat data." },
      { status: 500 },
    );
  }
}
