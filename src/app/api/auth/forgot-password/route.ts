import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// POST /api/auth/forgot-password — Request a password reset email
export async function POST(request: Request) {
  const rateLimited = rateLimit(request, RATE_LIMITS.passwordReset, "pwd-reset");
  if (rateLimited) return rateLimited;

  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Always return success to prevent email enumeration
  const successResponse = NextResponse.json({
    message: "If an account exists with that email, we've sent a password reset link.",
  });

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return successResponse;
    }

    // Invalidate any existing unused tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: { email: normalizedEmail, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        email: normalizedEmail,
        expiresAt,
      },
    });

    // Send the reset email
    await sendPasswordResetEmail(normalizedEmail, token);
  } catch (err) {
    console.error("[Forgot Password] Error:", err);
    // Still return success to prevent enumeration
  }

  return successResponse;
}
