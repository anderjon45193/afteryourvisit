import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  validateTwilioSignature,
  normalizePhone,
  OPT_OUT_KEYWORDS,
  OPT_IN_KEYWORDS,
} from "@/lib/twilio";

const TWIML_RESPONSE = new NextResponse("<Response/>", {
  status: 200,
  headers: { "Content-Type": "text/xml" },
});

// POST /api/webhooks/twilio — Handles delivery status callbacks + inbound SMS
export async function POST(request: NextRequest) {
  const body = await request.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  // Validate Twilio signature
  const signature = request.headers.get("x-twilio-signature") || "";
  const url = request.url;

  if (!validateTwilioSignature(url, params, signature)) {
    console.warn("[Twilio Webhook] Invalid signature — rejecting request");
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const messageBody = params.Body;
  const from = params.From;
  const messageSid = params.MessageSid;
  const messageStatus = params.MessageStatus;

  if (messageBody && from) {
    // ─── Inbound SMS ──────────────────────────────────────
    const keyword = messageBody.trim().toLowerCase();
    const normalizedPhone = normalizePhone(from);

    console.log(`[Twilio Webhook] Inbound SMS from ${normalizedPhone}: "${keyword}"`);

    if (OPT_OUT_KEYWORDS.includes(keyword)) {
      const followUps = await prisma.followUp.findMany({
        where: { clientPhone: normalizedPhone },
        select: { businessId: true },
        distinct: ["businessId"],
      });

      for (const { businessId } of followUps) {
        await prisma.optOut.upsert({
          where: { phone_businessId: { phone: normalizedPhone, businessId } },
          update: {},
          create: { phone: normalizedPhone, businessId },
        });
      }

      console.log(
        `[Twilio Webhook] STOP processed — opted out of ${followUps.length} business(es)`
      );
    } else if (OPT_IN_KEYWORDS.includes(keyword)) {
      const followUps = await prisma.followUp.findMany({
        where: { clientPhone: normalizedPhone },
        select: { businessId: true },
        distinct: ["businessId"],
      });

      for (const { businessId } of followUps) {
        await prisma.optOut.deleteMany({
          where: { phone: normalizedPhone, businessId },
        });
      }

      console.log(
        `[Twilio Webhook] START processed — opted back in to ${followUps.length} business(es)`
      );
    }

    return TWIML_RESPONSE;
  }

  // ─── Delivery Status Callback ─────────────────────────
  if (messageSid && messageStatus) {
    console.log(`[Twilio Webhook] Delivery status — SID: ${messageSid}, Status: ${messageStatus}`);

    const statusMap: Record<string, string> = {
      queued: "pending",
      sent: "sent",
      delivered: "delivered",
      undelivered: "failed",
      failed: "failed",
    };

    const mappedStatus = statusMap[messageStatus];
    if (mappedStatus) {
      await prisma.followUp.updateMany({
        where: { smsSid: messageSid },
        data: { smsStatus: mappedStatus },
      });
    }
  }

  return TWIML_RESPONSE;
}
