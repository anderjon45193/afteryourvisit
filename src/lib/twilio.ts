import Twilio from "twilio";
import { getBaseUrl } from "@/lib/stripe";

// ─── Configuration ──────────────────────────────────────

const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "";
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID || "";

const isDevMode =
  !accountSid ||
  !authToken ||
  accountSid === "your_twilio_account_sid" ||
  authToken === "your_twilio_auth_token";

// Singleton Twilio client (null in dev mode)
const twilioClient = isDevMode ? null : Twilio(accountSid, authToken);

// ─── Keywords ───────────────────────────────────────────

export const OPT_OUT_KEYWORDS = ["stop", "unsubscribe", "cancel", "end", "quit"];
export const OPT_IN_KEYWORDS = ["start", "yes", "unstop"];

// ─── Helpers ────────────────────────────────────────────

/**
 * Normalize a phone number to E.164 format (+1XXXXXXXXXX).
 * Strips all non-digit characters, prepends +1 for 10-digit US numbers.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

/**
 * Validate a Twilio webhook signature.
 * Returns true in dev mode (no credentials to validate against).
 */
export function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  if (isDevMode) return true;
  return Twilio.validateRequest(authToken, signature, url, params);
}

// ─── Send SMS ───────────────────────────────────────────

interface SendFollowUpSMSParams {
  to: string;
  firstName: string;
  businessName: string;
  followUpId: string;
  smsTemplate: string;
}

/**
 * Send a follow-up SMS via Twilio.
 * In dev mode, logs to console and returns a mock SID.
 */
export async function sendFollowUpSMS({
  to,
  firstName,
  businessName,
  followUpId,
  smsTemplate,
}: SendFollowUpSMSParams): Promise<string> {
  const followUpUrl = `${getBaseUrl()}/v/${followUpId}`;

  const smsBody =
    smsTemplate
      .replace("{{firstName}}", firstName)
      .replace("{{businessName}}", businessName)
      .replace("{{link}}", followUpUrl) +
    "\n\nReply STOP to opt out";

  const normalizedTo = normalizePhone(to);

  if (!twilioClient) {
    console.log(`[Twilio] DEV MODE — SMS not sent`);
    console.log(`  To: ${normalizedTo}`);
    console.log(`  Body: ${smsBody}`);
    return `SM_mock_${Date.now()}`;
  }

  const message = await twilioClient.messages.create({
    body: smsBody,
    ...(messagingServiceSid
      ? { messagingServiceSid }
      : { from: twilioPhoneNumber }),
    to: normalizedTo,
    statusCallback: `${getBaseUrl()}/api/webhooks/twilio`,
  });

  console.log(`[Twilio] SMS sent — SID: ${message.sid}`);
  return message.sid;
}
