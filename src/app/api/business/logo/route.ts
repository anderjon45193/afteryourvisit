import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// POST /api/business/logo — Upload logo
export async function POST(request: Request) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  // In production: upload to S3/R2, get URL back
  // For now, accept a URL directly
  const { logoUrl } = await request.json();

  if (!logoUrl) {
    return NextResponse.json({ error: "logoUrl is required" }, { status: 400 });
  }

  const updated = await prisma.business.update({
    where: { id: business!.id },
    data: { logoUrl },
  });

  return NextResponse.json({ logoUrl: updated.logoUrl });
}
