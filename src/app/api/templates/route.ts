import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// GET /api/templates — List all templates (system + custom for this business)
export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const templates = await prisma.template.findMany({
    where: {
      OR: [{ businessId: business!.id }, { isSystemTemplate: true }],
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(templates);
}

// POST /api/templates — Create custom template
export async function POST(request: Request) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const body = await request.json();
  const { name, smsMessage, pageHeading, pageSubheading, sections, showReviewCta, showBookingCta } = body;

  if (!name || !smsMessage || !pageHeading) {
    return NextResponse.json({ error: "name, smsMessage, and pageHeading are required" }, { status: 400 });
  }

  const template = await prisma.template.create({
    data: {
      name,
      smsMessage,
      pageHeading,
      pageSubheading: pageSubheading || null,
      sections: sections || [],
      showReviewCta: showReviewCta ?? true,
      showBookingCta: showBookingCta ?? true,
      isDefault: false,
      isSystemTemplate: false,
      businessId: business!.id,
    },
  });

  return NextResponse.json(template, { status: 201 });
}
