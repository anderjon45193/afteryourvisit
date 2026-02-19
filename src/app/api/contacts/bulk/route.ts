import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

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
    const result = await prisma.contact.deleteMany({
      where: {
        id: { in: contactIds },
        businessId: business!.id,
      },
    });
    return NextResponse.json({ success: true, deleted: result.count });
  }

  if (action === "tag" && tag) {
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: contactIds },
        businessId: business!.id,
        NOT: { tags: { has: tag } },
      },
      select: { id: true, tags: true },
    });

    if (contacts.length > 0) {
      await Promise.all(
        contacts.map((contact) =>
          prisma.contact.update({
            where: { id: contact.id },
            data: { tags: [...contact.tags, tag] },
          })
        )
      );
    }

    return NextResponse.json({ success: true, tagged: contacts.length });
  }

  if (action === "untag" && tag) {
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: contactIds },
        businessId: business!.id,
        tags: { has: tag },
      },
      select: { id: true, tags: true },
    });

    if (contacts.length > 0) {
      await Promise.all(
        contacts.map((contact) =>
          prisma.contact.update({
            where: { id: contact.id },
            data: { tags: contact.tags.filter((t) => t !== tag) },
          })
        )
      );
    }

    return NextResponse.json({ success: true, untagged: contacts.length });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
