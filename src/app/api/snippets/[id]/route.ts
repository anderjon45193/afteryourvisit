import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { mockDb } from "@/lib/mock-data";

// DELETE /api/snippets/:id — Delete snippet
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;
  const idx = mockDb.snippets.findIndex(
    (s) => s.id === id && s.businessId === business.id
  );

  if (idx === -1) {
    return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
  }

  mockDb.snippets.splice(idx, 1);
  return NextResponse.json({ success: true });
}
