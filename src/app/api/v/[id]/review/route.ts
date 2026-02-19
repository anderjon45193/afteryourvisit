import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-data";

// POST /api/v/:id/review — Track review click (public, no auth)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const followUp = mockDb.getFollowUp(id);

  if (!followUp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!followUp.reviewClickedAt) {
    followUp.reviewClickedAt = new Date().toISOString();
    console.log(`[Track] Review clicked: ${id} by ${followUp.clientFirstName}`);
  }

  return NextResponse.json({ success: true });
}
