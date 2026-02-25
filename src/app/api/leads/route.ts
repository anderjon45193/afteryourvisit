import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// POST /api/leads — Capture email from landing page CTA
export async function POST(request: Request) {
  const rateLimited = rateLimit(request, RATE_LIMITS.leads, "leads");
  if (rateLimited) return rateLimited;

  const body = await request.json();
  const { email } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  // Upsert to handle duplicate emails gracefully
  await prisma.lead.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
