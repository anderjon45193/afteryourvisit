import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// GET /api/snippets — List snippets for this business
export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return NextResponse.json([]);

  const snippets = await prisma.snippet.findMany({
    where: { businessId: business!.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(snippets);
}

// POST /api/snippets — Create snippet
export async function POST(request: Request) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { label, text, category } = await request.json();

  if (!label) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }

  const snippet = await prisma.snippet.create({
    data: {
      label,
      text: text || label,
      category: category || "general",
      businessId: business!.id,
    },
  });

  return NextResponse.json(snippet, { status: 201 });
}
