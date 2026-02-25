import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";

// POST /api/business/logo — Upload logo file
export async function POST(request: Request) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const contentType = request.headers.get("content-type") || "";

  // Handle JSON body (URL-only mode, used by auto-brand)
  if (contentType.includes("application/json")) {
    const { logoUrl } = await request.json();
    if (!logoUrl) {
      return NextResponse.json({ error: "logoUrl is required" }, { status: 400 });
    }
    const updated = await prisma.business.update({
      where: { id: business!.id },
      data: { logoUrl },
    });
    return NextResponse.json({ logoUrl: updated.logoUrl });
  }

  // Handle file upload (multipart form data)
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: PNG, JPG, WebP, SVG" },
      { status: 400 }
    );
  }

  // Validate file size (2MB max)
  const MAX_SIZE = 2 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 2MB." },
      { status: 400 }
    );
  }

  try {
    // Upload to Vercel Blob (or fall back to data URL in dev)
    let logoUrl: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Production: upload to Vercel Blob
      const ext = file.name.split(".").pop() || "png";
      const blob = await put(`logos/${business!.id}.${ext}`, file, {
        access: "public",
        addRandomSuffix: true,
      });
      logoUrl = blob.url;
    } else {
      // Dev mode: convert to base64 data URL
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      logoUrl = `data:${file.type};base64,${base64}`;
    }

    const updated = await prisma.business.update({
      where: { id: business!.id },
      data: { logoUrl },
    });

    return NextResponse.json({ logoUrl: updated.logoUrl });
  } catch (err) {
    console.error("[Logo Upload] Error:", err);
    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 }
    );
  }
}
