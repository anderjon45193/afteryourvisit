import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { mockDb } from "@/lib/mock-data";

// GET /api/analytics/overview — Dashboard stats
export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const followUps = mockDb.getFollowUps(business.id);

  // This month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = followUps.filter(
    (f) => new Date(f.createdAt) >= monthStart
  );

  const totalSent = thisMonth.length;
  const totalOpened = thisMonth.filter((f) => f.pageViewedAt).length;
  const totalReviewClicked = thisMonth.filter((f) => f.reviewClickedAt).length;
  const totalBookingClicked = thisMonth.filter((f) => f.bookingClickedAt).length;

  return NextResponse.json({
    totalSent,
    openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
    reviewClicks: totalReviewClicked,
    reviewRate: totalSent > 0 ? Math.round((totalReviewClicked / totalSent) * 100) : 0,
    bookingClicks: totalBookingClicked,
    // Trends (mock — in production, compare to previous month)
    trends: {
      sent: "+12%",
      openRate: "+5%",
      reviewClicks: "+18%",
      reviews: "-3%",
    },
  });
}
