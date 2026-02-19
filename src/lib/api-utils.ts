import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getAuthenticatedBusiness() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), business: null, session: null };
  }

  const businessId = (session.user as Record<string, unknown>).businessId as string;
  if (!businessId) {
    return { error: NextResponse.json({ error: "No business associated" }, { status: 403 }), business: null, session };
  }

  const business = await prisma.business.findUnique({ where: { id: businessId } });

  if (!business) {
    return { error: NextResponse.json({ error: "Business not found" }, { status: 404 }), business: null, session };
  }

  return { error: null, business, session };
}
