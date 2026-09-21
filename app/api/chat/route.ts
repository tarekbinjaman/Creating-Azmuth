import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  const { messages } = await request.json();

  const completion = await groq.chat.completions.create({
    messages,
    model: "openai/gpt-oss-20b",
  });

  return Response.json({
    reply: completion.choices[0]?.message?.content ?? "",
  });
}