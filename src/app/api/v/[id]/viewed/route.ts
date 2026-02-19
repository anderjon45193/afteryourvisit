import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/v/:id/viewed — Track page view (public, no auth)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const followUp = await prisma.followUp.findUnique({ where: { id } });

  if (!followUp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only record first view
  if (!followUp.pageViewedAt) {
    await prisma.followUp.update({
      where: { id },
      data: { pageViewedAt: new Date() },
    });
    console.log(`[Track] Page viewed: ${id} by ${followUp.clientFirstName}`);
  }

  return NextResponse.json({ success: true });
}
