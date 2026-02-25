import { Resend } from "resend";
import { getBaseUrl } from "@/lib/stripe";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

const isDevMode =
  !process.env.RESEND_API_KEY ||
  process.env.RESEND_API_KEY === "re_placeholder";

const FROM_EMAIL = process.env.EMAIL_FROM || "AfterYourVisit <noreply@afteryourvisit.com>";

/**
 * Send a password reset email.
 * In dev mode, logs to console instead of sending.
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  if (isDevMode) {
    console.log(`[Email] DEV MODE — Password reset email not sent`);
    console.log(`  To: ${email}`);
    console.log(`  Reset URL: ${resetUrl}`);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your AfterYourVisit password",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; color: #0D9488; margin: 0;">AfterYourVisit</h1>
        </div>
        <h2 style="font-size: 20px; color: #1C1917; margin-bottom: 16px;">Reset your password</h2>
        <p style="font-size: 16px; color: #57534E; line-height: 1.5; margin-bottom: 24px;">
          We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #0D9488; color: white; font-size: 16px; font-weight: 600; padding: 12px 32px; border-radius: 8px; text-decoration: none;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; color: #A8A29E; line-height: 1.5;">
          If you didn't request this, you can safely ignore this email. Your password won't change.
        </p>
        <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 32px 0 16px;" />
        <p style="font-size: 12px; color: #A8A29E; text-align: center;">
          AfterYourVisit &mdash; Smart follow-up texts for local businesses
        </p>
      </div>
    `,
  });
}
