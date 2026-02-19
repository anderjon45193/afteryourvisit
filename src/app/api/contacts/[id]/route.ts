import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { mockDb } from "@/lib/mock-data";

// GET /api/contacts/:id — Get single contact + follow-up history
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;
  const contact = mockDb.getContact(id);
  if (!contact || contact.businessId !== business.id) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const followUps = mockDb.getContactFollowUps(contact.id).map((f) => {
    const template = mockDb.getTemplate(f.templateId);
    return {
      ...f,
      templateName: template?.name || "Unknown",
      status: f.reviewClickedAt ? "reviewed" : f.pageViewedAt ? "opened" : "sent",
    };
  });

  return NextResponse.json({ ...contact, followUps });
}

// PUT /api/contacts/:id — Update a contact
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;
  const contact = mockDb.getContact(id);
  if (!contact || contact.businessId !== business.id) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const body = await request.json();
  const allowedFields = ["firstName", "lastName", "phone", "email", "tags", "notes", "optedOut"] as const;

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (contact as any)[field] = body[field];
    }
  }
  contact.updatedAt = new Date().toISOString();

  return NextResponse.json(contact);
}

// DELETE /api/contacts/:id — Delete a contact
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;
  const idx = mockDb.contacts.findIndex(
    (c) => c.id === id && c.businessId === business.id
  );
  if (idx === -1) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  mockDb.contacts.splice(idx, 1);
  return NextResponse.json({ success: true });
}
