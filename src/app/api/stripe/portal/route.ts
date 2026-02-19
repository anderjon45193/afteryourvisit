import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { stripe, getBaseUrl } from "@/lib/stripe";

// POST /api/stripe/portal — Create a Stripe Customer Portal session
export async function POST() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  if (!business.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account found. Please subscribe to a plan first." },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: business.stripeCustomerId,
      return_url: `${getBaseUrl()}/dashboard/settings?tab=billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Stripe Portal] Error:", err);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
