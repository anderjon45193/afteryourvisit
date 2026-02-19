import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, businessName, businessType, businessPhone, googleReviewUrl, bookingUrl } = body;

    // Validation
    if (!name || !email || !password || !businessName || !businessType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create business with owner user in a single transaction
    const business = await prisma.business.create({
      data: {
        name: businessName,
        type: businessType,
        email,
        phone: businessPhone || null,
        googleReviewUrl: googleReviewUrl || null,
        bookingUrl: bookingUrl || null,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        users: {
          create: {
            name,
            email,
            passwordHash,
            role: "owner",
          },
        },
      },
    });

    return NextResponse.json({ success: true, businessId: business.id });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
