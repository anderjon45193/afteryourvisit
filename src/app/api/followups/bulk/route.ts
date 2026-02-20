import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { prisma } from "@/lib/db";
import { sendFollowUpSMS, normalizePhone } from "@/lib/twilio";
import { checkCanSendFollowUp } from "@/lib/plan-limits";

export async function POST(request: Request) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const body = await request.json();
  const { contactIds, templateId, customNotes } = body as {
    contactIds: string[];
    templateId: string;
    customNotes?: string;
  };

  if (!contactIds?.length || !templateId) {
    return NextResponse.json(
      { error: "contactIds and templateId are required" },
      { status: 400 }
    );
  }

  // Validate template
  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 400 });
  }

  const limitError = await checkCanSendFollowUp(business!, contactIds.length);
  if (limitError) return limitError;

  // Load contacts (filter by businessId for security)
  const contacts = await prisma.contact.findMany({
    where: {
      id: { in: contactIds },
      businessId: business!.id,
    },
  });

  // Get opted-out phones for this business
  const optOuts = await prisma.optOut.findMany({
    where: { businessId: business!.id },
    select: { phone: true },
  });
  const optOutPhones = new Set(optOuts.map((o) => o.phone));

  let sent = 0;
  let failed = 0;
  let skippedOptOut = 0;
  const results: { contactId: string; status: string; followUpId?: string }[] = [];

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    const normalized = normalizePhone(contact.phone);

    // Skip opted-out contacts
    if (optOutPhones.has(normalized)) {
      skippedOptOut++;
      results.push({ contactId: contact.id, status: "opted_out" });
      continue;
    }

    try {
      // Create follow-up record
      const followUp = await prisma.followUp.create({
        data: {
          clientFirstName: contact.firstName,
          clientPhone: normalized,
          customNotes: customNotes || null,
          smsStatus: "pending",
          templateId,
          businessId: business!.id,
          contactId: contact.id,
        },
      });

      // Send SMS
      let smsStatus = "pending";
      let smsSid: string | null = null;
      try {
        const sid = await sendFollowUpSMS({
          to: contact.phone,
          firstName: contact.firstName,
          businessName: business!.name,
          followUpId: followUp.id,
          smsTemplate: template.smsMessage,
        });
        smsSid = sid;
        smsStatus = "sent";
      } catch (err) {
        console.error(`[Bulk SMS] Failed for contact ${contact.id}:`, err);
        smsStatus = "failed";
      }

      // Update follow-up with SMS result
      await prisma.followUp.update({
        where: { id: followUp.id },
        data: { smsStatus, smsSid },
      });

      // Update contact stats
      await prisma.contact.update({
        where: { id: contact.id },
        data: {
          totalFollowUps: { increment: 1 },
          lastFollowUpAt: new Date(),
        },
      });

      if (smsStatus === "sent") {
        sent++;
        results.push({ contactId: contact.id, status: "sent", followUpId: followUp.id });
      } else {
        failed++;
        results.push({ contactId: contact.id, status: "failed", followUpId: followUp.id });
      }
    } catch (err) {
      console.error(`[Bulk] Error processing contact ${contact.id}:`, err);
      failed++;
      results.push({ contactId: contact.id, status: "error" });
    }

    // 2-second delay between sends (except after the last one)
    if (i < contacts.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  return NextResponse.json({ sent, failed, skippedOptOut, results });
}
