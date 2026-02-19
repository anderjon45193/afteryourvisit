import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// GET /api/contacts/tags — Get all unique tags for the business
export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const contacts = await prisma.contact.findMany({
    where: { businessId: business!.id },
    select: { tags: true },
  });

  const tagSet = new Set<string>();
  for (const contact of contacts) {
    for (const tag of contact.tags) {
      tagSet.add(tag);
    }
  }

  const tags = Array.from(tagSet).sort();
  return NextResponse.json({ tags });
}
