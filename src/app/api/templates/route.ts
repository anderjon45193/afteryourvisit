import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { mockDb } from "@/lib/mock-data";

// GET /api/templates — List all templates (system + custom)
export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const templates = mockDb.getTemplates(business.id);
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

  const template = {
    id: `tpl-${mockDb.generateId()}`,
    name,
    smsMessage,
    pageHeading,
    pageSubheading: pageSubheading || null,
    sections: sections || [],
    showReviewCta: showReviewCta ?? true,
    showBookingCta: showBookingCta ?? true,
    isDefault: false,
    isSystemTemplate: false,
    businessId: business.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockDb.templates.push(template);
  return NextResponse.json(template, { status: 201 });
}
