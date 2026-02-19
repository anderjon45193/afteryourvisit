import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// GET /api/contacts/:id — Get single contact + follow-up history
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;
  const contact = await prisma.contact.findUnique({ where: { id } });

  if (!contact || contact.businessId !== business!.id) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const followUps = await prisma.followUp.findMany({
    where: { contactId: contact.id },
    include: { template: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const enrichedFollowUps = followUps.map((f) => ({
    ...f,
    templateName: f.template.name,
    status: f.reviewClickedAt ? "reviewed" : f.pageViewedAt ? "opened" : "sent",
  }));

  return NextResponse.json({ ...contact, followUps: enrichedFollowUps });
}

// PUT /api/contacts/:id — Update a contact
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;
  const contact = await prisma.contact.findUnique({ where: { id } });

  if (!contact || contact.businessId !== business!.id) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const body = await request.json();
  const allowedFields = ["firstName", "lastName", "phone", "email", "tags", "notes", "optedOut"];

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  const updated = await prisma.contact.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

// DELETE /api/contacts/:id — Delete a contact
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;
  const contact = await prisma.contact.findFirst({
    where: { id, businessId: business!.id },
  });

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  await prisma.contact.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
