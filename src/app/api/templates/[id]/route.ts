import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { mockDb } from "@/lib/mock-data";

// PUT /api/templates/:id — Update template
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;
  const template = mockDb.getTemplate(id);

  if (!template || (template.businessId !== business.id && !template.isSystemTemplate)) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const updates = await request.json();
  const allowed = ["name", "smsMessage", "pageHeading", "pageSubheading", "sections", "showReviewCta", "showBookingCta", "isDefault"];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tpl = template as any;
  for (const key of allowed) {
    if (key in updates) {
      tpl[key] = updates[key];
    }
  }
  template.updatedAt = new Date().toISOString();

  return NextResponse.json(template);
}

// DELETE /api/templates/:id — Delete template
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;
  const idx = mockDb.templates.findIndex(
    (t) => t.id === id && t.businessId === business.id && !t.isSystemTemplate
  );

  if (idx === -1) {
    return NextResponse.json({ error: "Template not found or cannot be deleted" }, { status: 404 });
  }

  mockDb.templates.splice(idx, 1);
  return NextResponse.json({ success: true });
}
