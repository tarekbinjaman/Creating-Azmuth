import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

const completion = await groq.chat.completions.create({
  messages: [
    {
      role: "system",
      content:
        "You are Astra, a helpful personal AI assistant. Be clear, friendly, and concise. Help the user with coding, learning, projects, and everyday tasks.",
    },
    ...messages,
  ],
  model: "openai/gpt-oss-20b",
});
    const reply = completion.choices[0]?.message?.content;

    return Response.json({
      reply: reply || "I couldn't generate a response.",
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { error: "Something went wrong while talking to Astra." },
      { status: 500 }
    );
  }
}