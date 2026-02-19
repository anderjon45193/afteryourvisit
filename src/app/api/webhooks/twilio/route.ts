import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-data";
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

  // Determine if this is an inbound SMS (has Body + From) or a delivery status callback
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
      // Opt out from ALL businesses that have sent to this phone
      const bizIds = mockDb.getBusinessIdsForPhone(normalizedPhone);
      for (const bizId of bizIds) {
        mockDb.addOptOut(normalizedPhone, bizId);
      }
      console.log(
        `[Twilio Webhook] STOP processed — opted out of ${bizIds.length} business(es)`
      );
    } else if (OPT_IN_KEYWORDS.includes(keyword)) {
      // Opt back in to ALL businesses
      const bizIds = mockDb.getBusinessIdsForPhone(normalizedPhone);
      for (const bizId of bizIds) {
        mockDb.removeOptOut(normalizedPhone, bizId);
      }
      console.log(
        `[Twilio Webhook] START processed — opted back in to ${bizIds.length} business(es)`
      );
    }

    return TWIML_RESPONSE;
  }

  // ─── Delivery Status Callback ─────────────────────────
  if (messageSid && messageStatus) {
    console.log(`[Twilio Webhook] Delivery status — SID: ${messageSid}, Status: ${messageStatus}`);

    const followUp = mockDb.followUps.find((f) => f.smsSid === messageSid);
    if (followUp) {
      const statusMap: Record<string, string> = {
        queued: "pending",
        sent: "sent",
        delivered: "delivered",
        undelivered: "failed",
        failed: "failed",
      };
      followUp.smsStatus = statusMap[messageStatus] || followUp.smsStatus;
    }
  }

  return TWIML_RESPONSE;
}
