import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

// PUT /api/locations/:id — Update location
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;

  const location = await prisma.location.findFirst({
    where: { id, businessId: business!.id },
  });

  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const updates = await request.json();
  const allowed = ["name", "address", "phone"];
  const data: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in updates) {
      data[key] = updates[key];
    }
  }

  if (data.name !== undefined && !(data.name as string).trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const updated = await prisma.location.update({
    where: { id },
    data,
    include: { _count: { select: { followUps: true } } },
  });

  return NextResponse.json(updated);
}

// DELETE /api/locations/:id — Delete location
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { id } = await params;

  const location = await prisma.location.findFirst({
    where: { id, businessId: business!.id },
    include: { _count: { select: { followUps: true } } },
  });

  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  if (location._count.followUps > 0) {
    return NextResponse.json(
      { error: `Cannot delete location with ${location._count.followUps} linked follow-up(s). Reassign them first.` },
      { status: 409 }
    );
  }

  await prisma.location.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
