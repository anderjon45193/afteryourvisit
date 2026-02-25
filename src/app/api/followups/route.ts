import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";
import { sendFollowUpSMS, normalizePhone } from "@/lib/twilio";
import { checkCanSendFollowUp } from "@/lib/plan-limits";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";

// GET /api/followups — List follow-ups (paginated, filterable)
export async function GET(request: NextRequest) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) {
    return NextResponse.json({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const skip = (page - 1) * limit;

  const where: Prisma.FollowUpWhereInput = {
    businessId: business!.id,
  };

  if (search) {
    where.OR = [
      { clientFirstName: { contains: search, mode: "insensitive" } },
      { clientPhone: { contains: search } },
    ];
  }

  if (status) {
    where.smsStatus = status;
  }

  const [followUps, total] = await Promise.all([
    prisma.followUp.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { template: { select: { name: true } } },
    }),
    prisma.followUp.count({ where }),
  ]);

  const enriched = followUps.map((f) => ({
    ...f,
    templateName: f.template.name,
    status: f.reviewClickedAt ? "reviewed" : f.pageViewedAt ? "opened" : "sent",
  }));

  return NextResponse.json({
    data: enriched,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/followups — Create & send a follow-up
export async function POST(request: Request) {
  const rateLimited = rateLimit(request, RATE_LIMITS.smsSend, "sms");
  if (rateLimited) return rateLimited;

  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const limitError = await checkCanSendFollowUp(business!);
  if (limitError) return limitError;

  const body = await request.json();
  const { clientFirstName, clientPhone, templateId, customNotes, locationId } = body;

  if (!clientFirstName || !clientPhone || !templateId) {
    return NextResponse.json(
      { error: "clientFirstName, clientPhone, and templateId are required" },
      { status: 400 }
    );
  }

  // Validate template exists
  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 400 });
  }

  // Validate phone (basic US format check)
  const digits = clientPhone.replace(/\D/g, "");
  if (digits.length !== 10) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  // Check opt-out status
  const normalized = normalizePhone(clientPhone);
  const optOut = await prisma.optOut.findUnique({
    where: { phone_businessId: { phone: normalized, businessId: business!.id } },
  });
  if (optOut) {
    return NextResponse.json(
      { error: "This phone number has opted out of messages from your business." },
      { status: 422 }
    );
  }

  // Auto-save/link contact
  const contact = await prisma.contact.upsert({
    where: {
      phone_businessId: { phone: normalized, businessId: business!.id },
    },
    create: {
      firstName: clientFirstName,
      phone: normalized,
      source: "auto_saved",
      totalFollowUps: 1,
      lastFollowUpAt: new Date(),
      businessId: business!.id,
    },
    update: {
      totalFollowUps: { increment: 1 },
      lastFollowUpAt: new Date(),
    },
  });

  // Create follow-up record
  const followUp = await prisma.followUp.create({
    data: {
      clientFirstName,
      clientPhone: normalized,
      customNotes: customNotes || null,
      smsStatus: "pending",
      templateId,
      businessId: business!.id,
      locationId: locationId || null,
      contactId: contact.id,
    },
  });

  // Send SMS via Twilio (or dev mode mock)
  let smsStatus = "pending";
  let smsSid: string | null = null;
  try {
    const sid = await sendFollowUpSMS({
      to: clientPhone,
      firstName: clientFirstName,
      businessName: business!.name,
      followUpId: followUp.id,
      smsTemplate: template.smsMessage,
    });
    smsSid = sid;
    smsStatus = "sent";
  } catch (err) {
    console.error(`[SMS] Failed to send follow-up ${followUp.id}:`, err);
    smsStatus = "failed";
  }

  // Update the follow-up with SMS result
  const updatedFollowUp = await prisma.followUp.update({
    where: { id: followUp.id },
    data: { smsStatus, smsSid },
  });

  return NextResponse.json(
    {
      ...updatedFollowUp,
      templateName: template.name,
      followUpUrl: `/v/${updatedFollowUp.id}`,
    },
    { status: 201 }
  );
}
