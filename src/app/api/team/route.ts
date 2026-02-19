import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/stripe";
import bcrypt from "bcryptjs";

// GET /api/team — List team members for business
export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const members = await prisma.user.findMany({
    where: { businessId: business!.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(members);
}

// POST /api/team — Create (invite) a new team member
export async function POST(request: Request) {
  const { error, business, session } = await getAuthenticatedBusiness();
  if (error) return error;

  const callerRole = (session!.user as Record<string, unknown>).role as string;

  // Only owner/admin can add members
  if (callerRole !== "owner" && callerRole !== "admin") {
    return NextResponse.json({ error: "Only owners and admins can add team members" }, { status: 403 });
  }

  const body = await request.json();
  const { name, email, password, role } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email || !email.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (!role || !["admin", "staff"].includes(role)) {
    return NextResponse.json({ error: "Role must be 'admin' or 'staff'" }, { status: 400 });
  }

  // Admin cannot create another admin
  if (callerRole === "admin" && role === "admin") {
    return NextResponse.json({ error: "Admins cannot add other admins" }, { status: 403 });
  }

  // Check plan limit
  const limits = getPlanLimits(business!.plan);
  const currentCount = await prisma.user.count({
    where: { businessId: business!.id },
  });

  if (currentCount >= limits.teamMembers) {
    return NextResponse.json(
      { error: "Team member limit reached. Upgrade your plan for more team members." },
      { status: 403 }
    );
  }

  // Check email uniqueness
  const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const member = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role,
      businessId: business!.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json(member, { status: 201 });
}
