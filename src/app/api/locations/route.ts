import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/stripe";

// GET /api/locations — List locations for business
export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const locations = await prisma.location.findMany({
    where: { businessId: business!.id },
    include: { _count: { select: { followUps: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(locations);
}

// POST /api/locations — Create a new location
export async function POST(request: Request) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const body = await request.json();
  const { name, address, phone } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Check plan limit
  const limits = getPlanLimits(business!.plan);
  const currentCount = await prisma.location.count({
    where: { businessId: business!.id },
  });

  if (currentCount >= limits.locations) {
    return NextResponse.json(
      { error: "Location limit reached. Upgrade your plan for more locations." },
      { status: 403 }
    );
  }

  const location = await prisma.location.create({
    data: {
      name: name.trim(),
      address: address || null,
      phone: phone || null,
      businessId: business!.id,
    },
    include: { _count: { select: { followUps: true } } },
  });

  return NextResponse.json(location, { status: 201 });
}
