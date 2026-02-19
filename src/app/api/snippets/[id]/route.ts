import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

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
