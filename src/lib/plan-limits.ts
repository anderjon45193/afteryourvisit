import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/stripe";
import type { Business } from "@prisma/client";

/**
 * Synchronous check: returns a 403 NextResponse if the business is on a trial
 * that has expired, otherwise null.
 */
export function checkTrialExpired(business: Business): NextResponse | null {
  if (business.plan !== "trial" || !business.trialEndsAt) return null;
  if (new Date(business.trialEndsAt) > new Date()) return null;

  return NextResponse.json(
    {
      error: "Your free trial has expired. Please upgrade to continue sending follow-ups.",
      code: "TRIAL_EXPIRED",
    },
    { status: 403 }
  );
}

/**
 * Async check: counts this month's follow-ups and compares against the plan limit.
 * Returns an object with error (NextResponse | null), used, and limit.
 */
export async function checkFollowUpQuota(
  business: Business,
  requestedCount = 1
): Promise<{ error: NextResponse | null; used: number; limit: number }> {
  const limits = getPlanLimits(business.plan);

  // Pro plan has Infinity — skip the DB query
  if (limits.followUpsPerMonth === Infinity) {
    return { error: null, used: 0, limit: Infinity };
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const used = await prisma.followUp.count({
    where: {
      businessId: business.id,
      createdAt: { gte: monthStart },
    },
  });

  const remaining = limits.followUpsPerMonth - used;

  if (requestedCount > remaining) {
    return {
      error: NextResponse.json(
        {
          error: `Monthly follow-up limit reached. You've used ${used} of ${limits.followUpsPerMonth} follow-ups this month.`,
          code: "QUOTA_EXCEEDED",
          used,
          limit: limits.followUpsPerMonth,
        },
        { status: 403 }
      ),
      used,
      limit: limits.followUpsPerMonth,
    };
  }

  return { error: null, used, limit: limits.followUpsPerMonth };
}

/**
 * Combined check: trial expiration first, then quota.
 * Returns a 403 NextResponse or null.
 */
export async function checkCanSendFollowUp(
  business: Business,
  count = 1
): Promise<NextResponse | null> {
  const trialError = checkTrialExpired(business);
  if (trialError) return trialError;

  const { error } = await checkFollowUpQuota(business, count);
  return error;
}
