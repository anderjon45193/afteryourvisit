import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// GET /api/contacts/search?q=... — Autocomplete search (top 5)
export async function GET(request: NextRequest) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return NextResponse.json([]);

  const q = request.nextUrl.searchParams.get("q") || "";
  if (q.length < 1) {
    return NextResponse.json([]);
  }

  const results = await prisma.contact.findMany({
    where: {
      businessId: business!.id,
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      lastFollowUpAt: true,
    },
    take: 5,
    orderBy: { firstName: "asc" },
  });

  return NextResponse.json(results);
}
