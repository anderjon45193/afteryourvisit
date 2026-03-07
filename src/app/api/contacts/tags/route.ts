import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// GET /api/contacts/tags — Get all unique tags for the business
export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return NextResponse.json({ tags: [] });

  const result = await prisma.$queryRaw<{ tag: string }[]>`
    SELECT DISTINCT UNNEST(tags) AS tag
    FROM "Contact"
    WHERE "businessId" = ${business!.id}
    ORDER BY tag
  `;

  const tags = result.map((r: { tag: string }) => r.tag);
  return NextResponse.json({ tags });
}
