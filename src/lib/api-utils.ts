import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getAuthenticatedBusiness() {
  let session;
  try {
    session = await auth();
  } catch {
    return { error: NextResponse.json({ error: "Session error — try signing out and back in" }, { status: 401 }), business: null, session: null };
  }

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), business: null, session: null };
  }

  const businessId = (session.user as Record<string, unknown>).businessId as string;
  const userId = session.user.id;
  const email = session.user.email;

  // Strategy 1: look up business by JWT businessId
  if (businessId) {
    try {
      const business = await prisma.business.findUnique({ where: { id: businessId } });
      if (business) {
        return { error: null, business, session };
      }
    } catch {
      // businessId might be in an invalid format — continue to fallbacks
    }
  }

  // Strategy 2: look up user by JWT userId, then get their business
  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { business: true },
      });
      if (user?.business) {
        return { error: null, business: user.business, session };
      }
    } catch {
      // userId might be stale or invalid — continue to fallbacks
    }
  }

  // Strategy 3: look up user by email (most resilient — email is stable across re-seeds)
  if (email) {
    try {
      const userByEmail = await prisma.user.findUnique({
        where: { email },
        include: { business: true },
      });
      if (userByEmail?.business) {
        return { error: null, business: userByEmail.business, session };
      }
    } catch {
      // email lookup failed
    }
  }

  return {
    error: NextResponse.json(
      { error: "Business not found. Please sign out and sign back in." },
      { status: 403 }
    ),
    business: null,
    session,
  };
}
