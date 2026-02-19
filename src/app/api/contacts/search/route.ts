import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { mockDb } from "@/lib/mock-data";

// GET /api/contacts/search?q=... — Autocomplete search (top 5)
export async function GET(request: NextRequest) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const q = request.nextUrl.searchParams.get("q") || "";
  if (q.length < 1) {
    return NextResponse.json([]);
  }

  const results = mockDb.searchContacts(business.id, q).map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    lastFollowUpAt: c.lastFollowUpAt,
  }));

  return NextResponse.json(results);
}
