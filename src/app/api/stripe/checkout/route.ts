import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { stripe, PLANS, getBaseUrl } from "@/lib/stripe";
import type { PlanId } from "@/lib/stripe";

// POST /api/stripe/checkout — Create a Stripe Checkout Session
export async function POST(request: Request) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { planId, interval } = await request.json();

  // Validate plan
  if (!planId || !(planId in PLANS)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (interval !== "monthly" && interval !== "annual") {
    return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
  }

  const plan = PLANS[planId as PlanId];
  const priceId = interval === "monthly" ? plan.monthlyPriceId : plan.annualPriceId;
  const baseUrl = getBaseUrl();

  try {
    // If business already has a Stripe customer, reuse it
    const sessionParams: Record<string, unknown> = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard/settings?tab=billing&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/settings?tab=billing`,
      metadata: {
        businessId: business.id,
        planId,
        interval,
      },
      subscription_data: {
        metadata: {
          businessId: business.id,
          planId,
          interval,
        },
      },
    };

    if (business.stripeCustomerId) {
      sessionParams.customer = business.stripeCustomerId;
    } else {
      sessionParams.customer_email = business.email;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await stripe.checkout.sessions.create(sessionParams as any);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Stripe Checkout] Error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
