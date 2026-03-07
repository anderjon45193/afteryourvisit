import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// GET /api/contacts/export — Export contacts as CSV download
export async function GET(request: NextRequest) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "";
  const tag = searchParams.get("tag") || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {
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

  if (tag) {
    where.tags = { has: tag };
  }

  const contacts = await prisma.contact.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "First Name",
    "Last Name",
    "Phone",
    "Email",
    "Tags",
    "Source",
    "Total Follow-Ups",
    "Last Follow-Up",
    "Has Left Review",
    "Opted Out",
    "Notes",
    "Created At",
  ];

  function escapeCsv(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = contacts.map((c: any) =>
    [
      escapeCsv(c.firstName),
      escapeCsv(c.lastName || ""),
      escapeCsv(c.phone),
      escapeCsv(c.email || ""),
      escapeCsv(c.tags.join("; ")),
      escapeCsv(c.source),
      String(c.totalFollowUps),
      c.lastFollowUpAt ? c.lastFollowUpAt.toISOString() : "",
      c.hasLeftReview ? "Yes" : "No",
      c.optedOut ? "Yes" : "No",
      escapeCsv(c.notes || ""),
      c.createdAt.toISOString(),
    ].join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contacts-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
