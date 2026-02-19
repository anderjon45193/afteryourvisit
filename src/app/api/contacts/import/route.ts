import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { mockDb } from "@/lib/mock-data";

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

  const importJob: {
    id: string;
    source: string;
    status: "processing" | "completed" | "failed";
    fileName: string;
    totalRows: number;
    importedCount: number;
    skippedCount: number;
    errorCount: number;
    errorDetails: string[];
    businessId: string;
    createdAt: string;
    completedAt: string | null;
  } = {
    id: `imp-${mockDb.generateId()}`,
    source: "csv",
    status: "processing",
    fileName: fileName || "import.csv",
    totalRows: rows.length,
    importedCount: 0,
    skippedCount: 0,
    errorCount: 0,
    errorDetails: [],
    businessId: business.id,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const { firstName, lastName, phone, email, tags } = row;

    if (!firstName || !phone) {
      importJob.errorCount++;
      importJob.errorDetails.push(`Row ${i + 1}: Missing firstName or phone`);
      continue;
    }

    // Normalize phone - strip non-digits
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      importJob.errorCount++;
      importJob.errorDetails.push(`Row ${i + 1}: Invalid phone number`);
      continue;
    }

    // Check duplicate
    const existing = mockDb.findContactByPhone(phone, business.id);
    if (existing) {
      importJob.skippedCount++;
      continue;
    }

    const formattedPhone =
      digits.length >= 10
        ? `(${digits.slice(-10, -7)}) ${digits.slice(-7, -4)}-${digits.slice(-4)}`
        : phone;

    const contact = {
      id: `ct-${mockDb.generateId()}`,
      firstName,
      lastName: lastName || null,
      phone: formattedPhone,
      email: email || null,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      source: "csv_import" as const,
      totalFollowUps: 0,
      lastFollowUpAt: null,
      hasLeftReview: false,
      notes: null,
      optedOut: false,
      businessId: business.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDb.contacts.push(contact);
    importJob.importedCount++;
  }

  importJob.status = "completed";
  importJob.completedAt = new Date().toISOString();
  mockDb.importJobs.push(importJob);

  return NextResponse.json({
    importedCount: importJob.importedCount,
    skippedCount: importJob.skippedCount,
    errorCount: importJob.errorCount,
    errorDetails: importJob.errorDetails,
  });
}
