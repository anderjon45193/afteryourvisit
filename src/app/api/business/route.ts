import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";

// GET /api/business — Get current business profile
export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;
  return NextResponse.json(business);
}

// PUT /api/business — Update business profile
export async function PUT(request: Request) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const updates = await request.json();
  const allowed = ["name", "type", "email", "phone", "websiteUrl", "bookingUrl", "googleReviewUrl"];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const biz = business as any;
  for (const key of allowed) {
    if (key in updates) {
      biz[key] = updates[key];
    }
  }

  return NextResponse.json(business);
}
