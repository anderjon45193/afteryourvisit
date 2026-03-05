import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

type Range = "7d" | "30d" | "90d";

// GET /api/analytics/timeline — Time-series data for charts
export async function GET(request: NextRequest) {
  const { error, business } = await getAuthenticatedBusiness();

  const range = (request.nextUrl.searchParams.get("range") || "7d") as Range;
  const days = range === "90d" ? 90 : range === "30d" ? 30 : 7;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (error) {
    const timeline = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      timeline.push({
        date: d.toISOString().split("T")[0],
        day: dayNames[d.getDay()],
        sent: 0,
        opened: 0,
        reviewed: 0,
      });
    }
    return NextResponse.json(timeline);
  }

  const now = new Date();
  const rangeStart = new Date();
  rangeStart.setDate(now.getDate() - (days - 1));
  rangeStart.setHours(0, 0, 0, 0);

  // Initialize day buckets
  const buckets: Record<
    string,
    { day: string; sent: number; opened: number; reviewed: number }
  > = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    buckets[key] = { day: dayNames[d.getDay()], sent: 0, opened: 0, reviewed: 0 };
  }

  const followUps = await prisma.followUp.findMany({
    where: {
      businessId: business!.id,
      createdAt: { gte: rangeStart },
    },
    select: {
      createdAt: true,
      pageViewedAt: true,
      reviewClickedAt: true,
    },
  });

  for (const fu of followUps) {
    const key = fu.createdAt.toISOString().split("T")[0];
    if (buckets[key]) {
      buckets[key].sent++;
      if (fu.pageViewedAt) buckets[key].opened++;
      if (fu.reviewClickedAt) buckets[key].reviewed++;
    }
  }

  const timeline = Object.entries(buckets).map(([date, data]) => ({
    date,
    ...data,
  }));

  return NextResponse.json(timeline);
}
