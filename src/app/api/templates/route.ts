import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// GET /api/templates — List all templates (system + custom for this business)
export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();

  if (error) {
    // Fall back to system templates so the send flow is never fully broken
    const systemTemplates = await prisma.template.findMany({
      where: { isSystemTemplate: true },
      orderBy: { createdAt: "desc" },
    });
    if (systemTemplates.length > 0) {
      return NextResponse.json(systemTemplates);
    }
    return error;
  }

  const templates = await prisma.template.findMany({
    where: {
      OR: [
        { businessId: business!.id, isSystemTemplate: false },
        { isSystemTemplate: true },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(templates);
}

// POST /api/templates — Create custom template
export async function POST(request: Request) {
  try {
    const { error, business } = await getAuthenticatedBusiness();
    if (error) return error;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

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
  } catch (err) {
    console.error("[POST /api/templates] Error:", err);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
