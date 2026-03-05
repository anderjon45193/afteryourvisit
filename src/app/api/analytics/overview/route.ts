import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

type Range = "7d" | "30d" | "90d" | "all";

function getRangeStart(range: Range): Date | null {
  if (range === "all") return null;
  const now = new Date();
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  now.setDate(now.getDate() - days);
  now.setHours(0, 0, 0, 0);
  return now;
}

function getPreviousPeriodRange(
  range: Range,
  rangeStart: Date | null
): { gte: Date; lt: Date } | null {
  if (range === "all" || !rangeStart) return null;
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const prevStart = new Date(rangeStart);
  prevStart.setDate(prevStart.getDate() - days);
  return { gte: prevStart, lt: rangeStart };
}

// GET /api/analytics/overview — Dashboard stats
export async function GET(request: NextRequest) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) {
    return NextResponse.json({
      totalSent: 0,
      totalSentAllTime: 0,
      openRate: 0,
      reviewClicks: 0,
      reviewRate: 0,
      trends: {
        sent: "0%",
        openRate: "0%",
        reviewClicks: "0%",
        reviews: "0%",
      },
    });
  }

  const range = (request.nextUrl.searchParams.get("range") || "30d") as Range;
  if (!["7d", "30d", "90d", "all"].includes(range)) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  const rangeStart = getRangeStart(range);
  const prevPeriod = getPreviousPeriodRange(range, rangeStart);

  const whereCurrent: Record<string, unknown> = {
    businessId: business!.id,
  };
  if (rangeStart) whereCurrent.createdAt = { gte: rangeStart };

  const wherePrev: Record<string, unknown> | null = prevPeriod
    ? { businessId: business!.id, createdAt: prevPeriod }
    : null;

  const [
    totalSent,
    totalOpened,
    totalReviewClicked,
    totalBookingClicked,
    totalSentAllTime,
  ] = await Promise.all([
    prisma.followUp.count({ where: whereCurrent }),
    prisma.followUp.count({
      where: { ...whereCurrent, pageViewedAt: { not: null } },
    }),
    prisma.followUp.count({
      where: { ...whereCurrent, reviewClickedAt: { not: null } },
    }),
    prisma.followUp.count({
      where: { ...whereCurrent, bookingClickedAt: { not: null } },
    }),
    prisma.followUp.count({ where: { businessId: business!.id } }),
  ]);

  const [prevSent, prevOpened, prevReviewClicked] = wherePrev
    ? await Promise.all([
        prisma.followUp.count({ where: wherePrev }),
        prisma.followUp.count({
          where: { ...wherePrev, pageViewedAt: { not: null } },
        }),
        prisma.followUp.count({
          where: { ...wherePrev, reviewClickedAt: { not: null } },
        }),
      ])
    : [0, 0, 0];

  const calcTrend = (current: number, previous: number): string => {
    if (range === "all") return "0%";
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const pct = Math.round(((current - previous) / previous) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  };

  const openRate =
    totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const prevOpenRate =
    prevSent > 0 ? Math.round((prevOpened / prevSent) * 100) : 0;

  return NextResponse.json({
    totalSent,
    totalSentAllTime,
    openRate,
    reviewClicks: totalReviewClicked,
    reviewRate:
      totalSent > 0 ? Math.round((totalReviewClicked / totalSent) * 100) : 0,
    bookingClicks: totalBookingClicked,
    plan: business!.plan,
    trialEndsAt: business!.trialEndsAt,
    trends: {
      sent: calcTrend(totalSent, prevSent),
      openRate: calcTrend(openRate, prevOpenRate),
      reviewClicks: calcTrend(totalReviewClicked, prevReviewClicked),
      reviews: calcTrend(totalReviewClicked, prevReviewClicked),
    },
  });
}
