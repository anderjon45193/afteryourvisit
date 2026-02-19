import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-data";

// POST /api/v/:id/viewed — Track page view (public, no auth)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const followUp = mockDb.getFollowUp(id);

  if (!followUp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only record first view
  if (!followUp.pageViewedAt) {
    followUp.pageViewedAt = new Date().toISOString();
    console.log(`[Track] Page viewed: ${id} by ${followUp.clientFirstName}`);
  }

  return NextResponse.json({ success: true });
}
