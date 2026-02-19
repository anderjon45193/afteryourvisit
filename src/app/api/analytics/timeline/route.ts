import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { mockDb } from "@/lib/mock-data";

// GET /api/analytics/timeline — Time-series data for charts
export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const followUps = mockDb.getFollowUps(business.id);

  // Group by day for the last 7 days
  const days: Record<string, { sent: number; opened: number; reviewed: number }> = {};
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const dayName = dayNames[d.getDay()];
    days[key] = { sent: 0, opened: 0, reviewed: 0 };
    // Store day name as a property for the response
    (days[key] as Record<string, unknown>).day = dayName;
  }

  for (const fu of followUps) {
    const key = fu.createdAt.split("T")[0];
    if (days[key]) {
      days[key].sent++;
      if (fu.pageViewedAt) days[key].opened++;
      if (fu.reviewClickedAt) days[key].reviewed++;
    }
  }

  const timeline = Object.entries(days).map(([date, data]) => ({
    date,
    day: (data as Record<string, unknown>).day,
    ...data,
  }));

  return NextResponse.json(timeline);
}
