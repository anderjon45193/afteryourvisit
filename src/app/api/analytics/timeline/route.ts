import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// GET /api/analytics/timeline — Time-series data for charts
export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Initialize day buckets
  const days: Record<string, { day: string; sent: number; opened: number; reviewed: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const dayName = dayNames[d.getDay()];
    days[key] = { day: dayName, sent: 0, opened: 0, reviewed: 0 };
  }

  const followUps = await prisma.followUp.findMany({
    where: {
      businessId: business!.id,
      createdAt: { gte: sevenDaysAgo },
    },
    select: {
      createdAt: true,
      pageViewedAt: true,
      reviewClickedAt: true,
    },
  });

  for (const fu of followUps) {
    const key = fu.createdAt.toISOString().split("T")[0];
    if (days[key]) {
      days[key].sent++;
      if (fu.pageViewedAt) days[key].opened++;
      if (fu.reviewClickedAt) days[key].reviewed++;
    }
  }

  const timeline = Object.entries(days).map(([date, data]) => ({
    date,
    ...data,
  }));

  return NextResponse.json(timeline);
}
