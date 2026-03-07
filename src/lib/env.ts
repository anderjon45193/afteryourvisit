const isProduction = process.env.NODE_ENV === "production";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (isProduction) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return "";
  }
  return value;
}

// ─── Stripe ─────────────────────────────────────────────
export const STRIPE_SECRET_KEY = requireEnv("STRIPE_SECRET_KEY");
export const STRIPE_WEBHOOK_SECRET = requireEnv("STRIPE_WEBHOOK_SECRET");

// ─── Twilio ─────────────────────────────────────────────
export const TWILIO_ACCOUNT_SID = requireEnv("TWILIO_ACCOUNT_SID");
export const TWILIO_AUTH_TOKEN = requireEnv("TWILIO_AUTH_TOKEN");
export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "";
export const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID || "";

// ─── Resend ─────────────────────────────────────────────
export const RESEND_API_KEY = requireEnv("RESEND_API_KEY");

// ─── Dev mode ───────────────────────────────────────────
// True when running locally without real credentials
export const IS_DEV_MODE = !isProduction;
