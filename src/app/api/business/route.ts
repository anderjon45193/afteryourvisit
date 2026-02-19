import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// GET /api/business — Get current business profile
export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;
  return NextResponse.json(business);
}

// PUT /api/business — Update business profile
export async function PUT(request: Request) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const updates = await request.json();
  const allowed = ["name", "type", "email", "phone", "websiteUrl", "bookingUrl", "googleReviewUrl"];

  const data: Record<string, string> = {};
  for (const key of allowed) {
    if (key in updates) {
      data[key] = updates[key];
    }
  }

  const updated = await prisma.business.update({
    where: { id: business!.id },
    data,
  });

  return NextResponse.json(updated);
}
