import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";
import { getPlanLimits, PLANS } from "@/lib/stripe";

export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) {
    // Return default usage so the sidebar/dashboard isn't broken
    return NextResponse.json({
      plan: "starter",
      planName: "Starter",
      followUps: { used: 0, limit: 200, remaining: 200 },
      isTrialExpired: false,
      trialDaysLeft: null,
    });
  }

  const biz = business!;
  const limits = getPlanLimits(biz.plan);

  // Count this month's follow-ups
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const used = limits.followUpsPerMonth === Infinity
    ? 0
    : await prisma.followUp.count({
        where: {
          businessId: biz.id,
          createdAt: { gte: monthStart },
        },
      });

  const limit = limits.followUpsPerMonth;
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used);

  // Plan display name
  const planName =
    biz.plan === "trial"
      ? "Trial"
      : (PLANS as Record<string, { name: string }>)[biz.plan]?.name ?? "Starter";

  // Trial status
  const isTrialExpired =
    biz.plan === "trial" && biz.trialEndsAt
      ? new Date(biz.trialEndsAt) <= new Date()
      : false;

  const trialDaysLeft =
    biz.plan === "trial" && biz.trialEndsAt
      ? Math.max(
          0,
          Math.ceil(
            (new Date(biz.trialEndsAt).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;

  return NextResponse.json({
    plan: biz.plan,
    planName,
    followUps: { used, limit, remaining },
    isTrialExpired,
    trialDaysLeft,
  });
}
