import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

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

  const where: Prisma.ContactWhereInput = {
    businessId: business!.id,
  };

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (filter === "has_review") {
    where.hasLeftReview = true;
  } else if (filter === "no_review") {
    where.hasLeftReview = false;
  } else if (filter === "opted_out") {
    where.optedOut = true;
  }

  const allowedSortFields = [
    "firstName", "lastName", "phone", "email", "createdAt", "updatedAt",
    "totalFollowUps", "lastFollowUpAt", "hasLeftReview",
  ];
  const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";
  const sortDirection = sortDir === "asc" ? "asc" : "desc";

  const [contactsList, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { [sortField]: sortDirection },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contact.count({ where }),
  ]);

  return NextResponse.json({
    data: contactsList,
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

  // Check duplicate by phone + businessId (unique constraint)
  const existing = await prisma.contact.findUnique({
    where: {
      phone_businessId: { phone, businessId: business!.id },
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A contact with this phone number already exists" },
      { status: 409 }
    );
  }

  const contact = await prisma.contact.create({
    data: {
      firstName,
      lastName: lastName || null,
      phone,
      email: email || null,
      tags: tags || [],
      source: "manual",
      notes: notes || null,
      businessId: business!.id,
    },
  });

  return NextResponse.json(contact, { status: 201 });
}
