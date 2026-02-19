import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/v/:id/booking — Track booking click (public, no auth)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const followUp = await prisma.followUp.findUnique({ where: { id } });

  if (!followUp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!followUp.bookingClickedAt) {
    await prisma.followUp.update({
      where: { id },
      data: { bookingClickedAt: new Date() },
    });
    console.log(`[Track] Booking clicked: ${id} by ${followUp.clientFirstName}`);
  }

  return NextResponse.json({ success: true });
}
