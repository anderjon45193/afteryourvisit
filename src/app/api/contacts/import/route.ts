import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";

// POST /api/contacts/import — Import contacts from CSV
export async function POST(request: Request) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const body = await request.json();
  const { rows, fileName } = body;

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: "rows array is required" },
      { status: 400 }
    );
  }

  let importedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const errorDetails: string[] = [];

  // Pre-fetch existing phones for this business
  const existingContacts = await prisma.contact.findMany({
    where: { businessId: business!.id },
    select: { phone: true },
  });
  const existingPhones = new Set(existingContacts.map((c) => c.phone));
  const batchPhones = new Set<string>();

  const contactsToCreate: {
    firstName: string;
    lastName: string | null;
    phone: string;
    email: string | null;
    tags: string[];
    source: string;
    businessId: string;
  }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const { firstName, lastName, phone, email, tags } = row;

    if (!firstName || !phone) {
      errorCount++;
      errorDetails.push(`Row ${i + 1}: Missing firstName or phone`);
      continue;
    }

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      errorCount++;
      errorDetails.push(`Row ${i + 1}: Invalid phone number`);
      continue;
    }

    const normalized = normalizePhone(phone);

    if (existingPhones.has(normalized)) {
      skippedCount++;
      continue;
    }

    if (batchPhones.has(normalized)) {
      skippedCount++;
      continue;
    }

    batchPhones.add(normalized);

    const parsedTags = tags
      ? Array.isArray(tags) ? tags : [tags]
      : [];

    contactsToCreate.push({
      firstName,
      lastName: lastName || null,
      phone: normalized,
      email: email || null,
      tags: parsedTags,
      source: "csv_import",
      businessId: business!.id,
    });
  }

  if (contactsToCreate.length > 0) {
    const result = await prisma.contact.createMany({
      data: contactsToCreate,
      skipDuplicates: true,
    });
    importedCount = result.count;
  }

  // Record the import job
  await prisma.importJob.create({
    data: {
      source: "csv",
      status: "completed",
      fileName: fileName || "import.csv",
      totalRows: rows.length,
      importedCount,
      skippedCount,
      errorCount,
      errorDetails: errorDetails,
      businessId: business!.id,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({
    importedCount,
    skippedCount,
    errorCount,
    errorDetails,
  });
}
