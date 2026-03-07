import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// PUT /api/snippets/:id — Update snippet
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;

  const snippet = await prisma.snippet.findFirst({
    where: { id, businessId: business!.id },
  });

  if (!snippet) {
    return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
  }

  const body = await request.json();
  const { label, text, category } = body;

  if (label !== undefined && !label) {
    return NextResponse.json({ error: "label cannot be empty" }, { status: 400 });
  }

  const data: Record<string, string> = {};
  if (label !== undefined) data.label = label;
  if (text !== undefined) data.text = text;
  if (category !== undefined) data.category = category;

  const updated = await prisma.snippet.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

// DELETE /api/snippets/:id — Delete snippet
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;

  const snippet = await prisma.snippet.findFirst({
    where: {
      id,
      businessId: business!.id,
    },
  });

  if (!snippet) {
    return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
  }

  await prisma.snippet.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
