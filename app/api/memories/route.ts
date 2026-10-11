
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const memories = await prisma.memory.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    return Response.json({ memories });
  } catch (error) {
    console.error("Failed to fetch memories:", error);

    return Response.json(
      { error: "Failed to fetch memories." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const content =
      typeof body.content === "string" ? body.content.trim() : "";

    const allowedCategories = [
      "personal_fact",
      "preference",
      "goal",
      "instruction",
    ];

    const category =
      typeof body.category === "string" ? body.category : "";

    if (!content || !allowedCategories.includes(category)) {
      return Response.json(
        {
          error:
            "A non-empty content and a valid category are required.",
        },
        { status: 400 },
      );
    }


const existingMemory = await prisma.memory.findFirst({
  where: {
    content: {
      equals: content.trim(),
      mode: "insensitive",
    },
    category,
  },
});

if (existingMemory) {
  return Response.json(
    {
      error: "This memory already exists.",
      memory: existingMemory,
    },
    { status: 409 },
  );
}

const memory = await prisma.memory.create({
  data: {
    content: content.trim(),
    category,
  },
});

return Response.json({ memory }, { status: 201 });

  } catch (error) {
    console.error("Failed to save memory:", error);

    return Response.json(
      { error: "Failed to save memory." },
      { status: 500 },
    );
  }
}


export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Memory ID is required." },
        { status: 400 },
      );
    }

    const existingMemory = await prisma.memory.findUnique({
      where: { id },
    });

    if (!existingMemory) {
      return Response.json(
        { error: "Memory not found." },
        { status: 404 },
      );
    }

    await prisma.memory.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete memory:", error);

    return Response.json(
      { error: "Failed to delete memory." },
      { status: 500 },
    );
  }
}