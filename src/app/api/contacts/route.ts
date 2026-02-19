import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { mockDb } from "@/lib/mock-data";

// GET /api/contacts — List contacts (paginated, filterable)
export async function GET(request: NextRequest) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "";
  const sort = searchParams.get("sort") || "createdAt";
  const sortDir = searchParams.get("sortDir") || "desc";

  let contactsList = mockDb.getContacts(business.id);

  // Search
  if (search) {
    const q = search.toLowerCase();
    contactsList = contactsList.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        (c.lastName || "").toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email || "").toLowerCase().includes(q)
    );
  }

  // Filter
  if (filter === "has_review") {
    contactsList = contactsList.filter((c) => c.hasLeftReview);
  } else if (filter === "no_review") {
    contactsList = contactsList.filter((c) => !c.hasLeftReview);
  } else if (filter === "opted_out") {
    contactsList = contactsList.filter((c) => c.optedOut);
  }

  // Sort
  contactsList.sort((a, b) => {
    const aVal = a[sort as keyof typeof a];
    const bVal = b[sort as keyof typeof b];
    const aStr = String(aVal || "");
    const bStr = String(bVal || "");
    return sortDir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const total = contactsList.length;
  const offset = (page - 1) * limit;
  const paginated = contactsList.slice(offset, offset + limit);

  return NextResponse.json({
    data: paginated,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/contacts — Create a contact
export async function POST(request: Request) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const body = await request.json();
  const { firstName, lastName, phone, email, notes, tags } = body;

  if (!firstName || !phone) {
    return NextResponse.json(
      { error: "firstName and phone are required" },
      { status: 400 }
    );
  }

  // Check duplicate
  const existing = mockDb.findContactByPhone(phone, business.id);
  if (existing) {
    return NextResponse.json(
      { error: "A contact with this phone number already exists" },
      { status: 409 }
    );
  }

  const contact = {
    id: `ct-${mockDb.generateId()}`,
    firstName,
    lastName: lastName || null,
    phone,
    email: email || null,
    tags: tags || [],
    source: "manual" as const,
    totalFollowUps: 0,
    lastFollowUpAt: null,
    hasLeftReview: false,
    notes: notes || null,
    optedOut: false,
    businessId: business.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockDb.contacts.push(contact);

  return NextResponse.json(contact, { status: 201 });
}
