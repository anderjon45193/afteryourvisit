import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// POST /api/auth/reset-password — Reset password using a token
export async function POST(request: Request) {
  const { token, password } = await request.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Reset token is required" }, { status: 400 });
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  try {
    // Find the token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if already used
    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: "This reset link has already been used. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 400 }
      );
    }

    // Hash the new password and update user
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      message: "Password reset successfully. You can now sign in.",
    });
  } catch (err) {
    console.error("[Reset Password] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
