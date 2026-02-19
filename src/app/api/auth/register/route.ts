import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // In production, this would create the user and business in the database:
    // const business = await prisma.business.create({
    //   data: {
    //     name: businessName,
    //     type: businessType,
    //     email,
    //     phone: businessPhone || null,
    //     googleReviewUrl: googleReviewUrl || null,
    //     bookingUrl: bookingUrl || null,
    //     trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    //     users: {
    //       create: {
    //         name,
    //         email,
    //         passwordHash,
    //         role: "owner",
    //       },
    //     },
    //   },
    // });

    // For now, log the registration data
    console.log("New registration:", {
      name,
      email,
      passwordHash,
      businessName,
      businessType,
      businessPhone,
      googleReviewUrl,
      bookingUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
