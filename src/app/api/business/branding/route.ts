import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// PUT /api/business/branding — Update brand colors
export async function PUT(request: Request) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { brandPrimaryColor, brandSecondaryColor } = await request.json();

  const data: Record<string, string> = {};
  if (brandPrimaryColor) data.brandPrimaryColor = brandPrimaryColor;
  if (brandSecondaryColor) data.brandSecondaryColor = brandSecondaryColor;

  const updated = await prisma.business.update({
    where: { id: business!.id },
    data,
  });

  return NextResponse.json({
    brandPrimaryColor: updated.brandPrimaryColor,
    brandSecondaryColor: updated.brandSecondaryColor,
  });
}
