import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/v/:id/review — Track review click (public, no auth)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const followUp = await prisma.followUp.findUnique({ where: { id } });

  if (!followUp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!followUp.reviewClickedAt) {
    await prisma.followUp.update({
      where: { id },
      data: { reviewClickedAt: new Date() },
    });
    console.log(`[Track] Review clicked: ${id} by ${followUp.clientFirstName}`);

    // Also update the linked Contact's hasLeftReview
    if (followUp.contactId) {
      await prisma.contact.update({
        where: { id: followUp.contactId },
        data: { hasLeftReview: true, reviewLeftAt: new Date() },
      });
    }
  }

  return NextResponse.json({ success: true });
}
