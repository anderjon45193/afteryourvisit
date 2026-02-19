import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { mockDb } from "@/lib/mock-data";

// POST /api/contacts/bulk — Bulk delete or tag contacts
export async function POST(request: Request) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const body = await request.json();
  const { action, contactIds, tag } = body;

  if (!action || !contactIds || !Array.isArray(contactIds)) {
    return NextResponse.json(
      { error: "action and contactIds are required" },
      { status: 400 }
    );
  }

  if (action === "delete") {
    mockDb.contacts = mockDb.contacts.filter(
      (c) => !(contactIds.includes(c.id) && c.businessId === business.id)
    );
    return NextResponse.json({ success: true, deleted: contactIds.length });
  }

  if (action === "tag" && tag) {
    for (const contact of mockDb.contacts) {
      if (contactIds.includes(contact.id) && contact.businessId === business.id) {
        if (!contact.tags.includes(tag)) {
          contact.tags.push(tag);
        }
      }
    }
    return NextResponse.json({ success: true, tagged: contactIds.length });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
