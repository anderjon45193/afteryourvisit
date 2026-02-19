import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mockDb } from "@/lib/mock-data";

export async function getAuthenticatedBusiness() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), business: null, session: null };
  }

  const businessId = (session.user as Record<string, unknown>).businessId as string || "demo-biz-1";
  const business = mockDb.getBusiness(businessId);

  if (!business) {
    return { error: NextResponse.json({ error: "Business not found" }, { status: 404 }), business: null, session };
  }

  return { error: null, business, session };
}
