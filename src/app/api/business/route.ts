import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// GET /api/business — Get current business profile
export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) {
    // Return a minimal placeholder with _empty flag so the frontend
    // knows this is a fallback (not real data), and can retry.
    return NextResponse.json({
      _empty: true,
      id: "",
      name: "",
      type: "",
      email: "",
      phone: "",
      logoUrl: null,
      brandPrimaryColor: "#14B8A6",
      brandSecondaryColor: "#0D9488",
      googlePlaceId: null,
      googleReviewUrl: null,
      websiteUrl: null,
      bookingUrl: null,
      plan: "starter",
    });
  }
  return NextResponse.json(business);
}

// PUT /api/business — Update business profile
export async function PUT(request: Request) {
  try {
    const { error, business } = await getAuthenticatedBusiness();
    if (error) return error;

    const updates = await request.json();
    const allowed = ["name", "type", "email", "phone", "websiteUrl", "bookingUrl", "googleReviewUrl", "brandPrimaryColor", "brandSecondaryColor", "logoUrl"];

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
  } catch (err) {
    console.error("[PUT /api/business] Error:", err);
    return NextResponse.json({ error: "Failed to update business" }, { status: 500 });
  }
}
