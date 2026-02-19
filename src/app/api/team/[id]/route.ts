import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

// PUT /api/team/:id — Update team member (name, role)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business, session } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;
  const callerRole = (session!.user as Record<string, unknown>).role as string;

  // Only owner/admin can update members
  if (callerRole !== "owner" && callerRole !== "admin") {
    return NextResponse.json({ error: "Only owners and admins can update team members" }, { status: 403 });
  }

  const member = await prisma.user.findFirst({
    where: { id, businessId: business!.id },
  });

  if (!member) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  }

  // Cannot modify the owner
  if (member.role === "owner") {
    return NextResponse.json({ error: "Cannot modify the owner" }, { status: 403 });
  }

  const updates = await request.json();
  const allowed = ["name", "role"];
  const data: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in updates) {
      data[key] = updates[key];
    }
  }

  // Validate role if being changed
  if (data.role !== undefined) {
    if (!["admin", "staff"].includes(data.role as string)) {
      return NextResponse.json({ error: "Role must be 'admin' or 'staff'" }, { status: 400 });
    }
    // Admin cannot promote to admin
    if (callerRole === "admin" && data.role === "admin") {
      return NextResponse.json({ error: "Admins cannot promote to admin" }, { status: 403 });
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });

  return NextResponse.json(updated);
}

// DELETE /api/team/:id — Remove team member
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business, session } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;
  const callerId = session!.user!.id;
  const callerRole = (session!.user as Record<string, unknown>).role as string;

  // Only owner/admin can delete members
  if (callerRole !== "owner" && callerRole !== "admin") {
    return NextResponse.json({ error: "Only owners and admins can remove team members" }, { status: 403 });
  }

  const member = await prisma.user.findFirst({
    where: { id, businessId: business!.id },
  });

  if (!member) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  }

  // Cannot delete the owner
  if (member.role === "owner") {
    return NextResponse.json({ error: "Cannot remove the owner" }, { status: 403 });
  }

  // Cannot delete yourself
  if (member.id === callerId) {
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 403 });
  }

  // Admin cannot delete another admin
  if (callerRole === "admin" && member.role === "admin") {
    return NextResponse.json({ error: "Admins cannot remove other admins" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
