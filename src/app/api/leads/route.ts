import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-data";

// POST /api/leads — Capture email from landing page CTA
export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  mockDb.addLead(email);

  return NextResponse.json({ success: true }, { status: 201 });
}
