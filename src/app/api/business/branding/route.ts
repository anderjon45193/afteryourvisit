import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";

// PUT /api/business/branding — Update brand colors
export async function PUT(request: Request) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { brandPrimaryColor, brandSecondaryColor } = await request.json();

  if (brandPrimaryColor) business.brandPrimaryColor = brandPrimaryColor;
  if (brandSecondaryColor) business.brandSecondaryColor = brandSecondaryColor;

  return NextResponse.json({
    brandPrimaryColor: business.brandPrimaryColor,
    brandSecondaryColor: business.brandSecondaryColor,
  });
}
