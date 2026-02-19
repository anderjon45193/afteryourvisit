import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// PUT /api/templates/:id — Update template
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;

  const template = await prisma.template.findFirst({
    where: {
      id,
      OR: [{ businessId: business!.id }, { isSystemTemplate: true }],
    },
  });

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const updates = await request.json();
  const allowed = ["name", "smsMessage", "pageHeading", "pageSubheading", "sections", "showReviewCta", "showBookingCta", "isDefault"];

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) {
      data[key] = updates[key];
    }
  }

  const updated = await prisma.template.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

// DELETE /api/templates/:id — Delete template
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;

  const template = await prisma.template.findFirst({
    where: {
      id,
      businessId: business!.id,
      isSystemTemplate: false,
    },
  });

  if (!template) {
    return NextResponse.json({ error: "Template not found or cannot be deleted" }, { status: 404 });
  }

  await prisma.template.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
