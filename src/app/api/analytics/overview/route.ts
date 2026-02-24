import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// GET /api/analytics/overview — Dashboard stats
export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) {
    return NextResponse.json({
      totalSent: 0,
      openRate: 0,
      reviewClicks: 0,
      reviewRate: 0,
      bookingClicks: 0,
      trends: { sent: "0%", openRate: "0%", reviewClicks: "0%", reviews: "0%" },
    });
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const whereThisMonth = {
    businessId: business!.id,
    createdAt: { gte: monthStart },
  };

  const wherePrevMonth = {
    businessId: business!.id,
    createdAt: { gte: prevMonthStart, lt: monthStart },
  };

  const [totalSent, totalOpened, totalReviewClicked, totalBookingClicked] =
    await Promise.all([
      prisma.followUp.count({ where: whereThisMonth }),
      prisma.followUp.count({
        where: { ...whereThisMonth, pageViewedAt: { not: null } },
      }),
      prisma.followUp.count({
        where: { ...whereThisMonth, reviewClickedAt: { not: null } },
      }),
      prisma.followUp.count({
        where: { ...whereThisMonth, bookingClickedAt: { not: null } },
      }),
    ]);

  const [prevSent, prevOpened, prevReviewClicked] = await Promise.all([
    prisma.followUp.count({ where: wherePrevMonth }),
    prisma.followUp.count({
      where: { ...wherePrevMonth, pageViewedAt: { not: null } },
    }),
    prisma.followUp.count({
      where: { ...wherePrevMonth, reviewClickedAt: { not: null } },
    }),
  ]);

  const calcTrend = (current: number, previous: number): string => {
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
    openRate,
    reviewClicks: totalReviewClicked,
    reviewRate:
      totalSent > 0 ? Math.round((totalReviewClicked / totalSent) * 100) : 0,
    bookingClicks: totalBookingClicked,
    trends: {
      sent: calcTrend(totalSent, prevSent),
      openRate: calcTrend(openRate, prevOpenRate),
      reviewClicks: calcTrend(totalReviewClicked, prevReviewClicked),
      reviews: calcTrend(totalReviewClicked, prevReviewClicked),
    },
  });
}
