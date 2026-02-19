import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { mockDb } from "@/lib/mock-data";
import { sendFollowUpSMS, normalizePhone } from "@/lib/twilio";

// GET /api/followups — List follow-ups (paginated, filterable)
export async function GET(request: NextRequest) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  let followUps = mockDb.getFollowUps(business.id);

  // Filter by search
  if (search) {
    const q = search.toLowerCase();
    followUps = followUps.filter(
      (f) =>
        f.clientFirstName.toLowerCase().includes(q) ||
        f.clientPhone.includes(q)
    );
  }

  // Filter by status
  if (status) {
    followUps = followUps.filter((f) => f.smsStatus === status);
  }

  const total = followUps.length;
  const offset = (page - 1) * limit;
  const paginated = followUps.slice(offset, offset + limit);

  // Enrich with template name
  const enriched = paginated.map((f) => {
    const template = mockDb.getTemplate(f.templateId);
    return {
      ...f,
      templateName: template?.name || "Unknown",
      status: f.reviewClickedAt ? "reviewed" : f.pageViewedAt ? "opened" : "sent",
    };
  });

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
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const body = await request.json();
  const { clientFirstName, clientPhone, templateId, customNotes, locationId } = body;

  if (!clientFirstName || !clientPhone || !templateId) {
    return NextResponse.json(
      { error: "clientFirstName, clientPhone, and templateId are required" },
      { status: 400 }
    );
  }

  // Validate template exists
  const template = mockDb.getTemplate(templateId);
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
  if (mockDb.isOptedOut(normalized, business.id)) {
    return NextResponse.json(
      { error: "This phone number has opted out of messages from your business." },
      { status: 422 }
    );
  }

  // Create follow-up record
  const followUp = {
    id: `fu-${mockDb.generateId()}`,
    clientFirstName,
    clientPhone,
    customNotes: customNotes || null,
    smsStatus: "pending",
    smsSid: null as string | null,
    pageViewedAt: null,
    reviewClickedAt: null,
    bookingClickedAt: null,
    templateId,
    businessId: business.id,
    locationId: locationId || null,
    contactId: null as string | null,
    createdAt: new Date().toISOString(),
  };

  mockDb.followUps.unshift(followUp);

  // Auto-save/link contact
  let contact = mockDb.findContactByPhone(clientPhone, business.id);
  if (!contact) {
    contact = {
      id: `ct-${mockDb.generateId()}`,
      firstName: clientFirstName,
      lastName: null,
      phone: clientPhone,
      email: null,
      tags: [],
      source: "auto_saved",
      totalFollowUps: 1,
      lastFollowUpAt: followUp.createdAt,
      hasLeftReview: false,
      notes: null,
      optedOut: false,
      businessId: business.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockDb.contacts.push(contact);
  } else {
    contact.totalFollowUps++;
    contact.lastFollowUpAt = followUp.createdAt;
    contact.updatedAt = new Date().toISOString();
  }
  followUp.contactId = contact.id;

  // Send SMS via Twilio (or dev mode mock)
  try {
    const sid = await sendFollowUpSMS({
      to: clientPhone,
      firstName: clientFirstName,
      businessName: business.name,
      followUpId: followUp.id,
      smsTemplate: template.smsMessage,
    });
    followUp.smsSid = sid;
    followUp.smsStatus = "sent";
  } catch (err) {
    console.error(`[SMS] Failed to send follow-up ${followUp.id}:`, err);
    followUp.smsStatus = "failed";
  }

  return NextResponse.json(
    {
      ...followUp,
      templateName: template.name,
      followUpUrl: `/v/${followUp.id}`,
    },
    { status: 201 }
  );
}
