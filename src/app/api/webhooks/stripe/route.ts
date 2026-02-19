import { NextResponse } from "next/server";
import { stripe, getPlanByPriceId } from "@/lib/stripe";
import { mockDb } from "@/lib/mock-data";

// POST /api/webhooks/stripe — Handle Stripe subscription events
export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;

  // In production, verify webhook signature
  if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("[Stripe Webhook] Signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    // Dev mode: parse without verification
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
  }

  console.log(`[Stripe Webhook] ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const businessId = session.metadata?.businessId;
        if (businessId) {
          const business = mockDb.getBusiness(businessId);
          if (business) {
            business.stripeCustomerId = session.customer;
            business.stripeSubId = session.subscription;
            // Plan will be set by subscription.created event
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const businessId = subscription.metadata?.businessId;
        const priceId = subscription.items?.data?.[0]?.price?.id;

        if (businessId && priceId) {
          const business = mockDb.getBusiness(businessId);
          const planInfo = getPlanByPriceId(priceId);

          if (business && planInfo) {
            business.plan = planInfo.planId;
            business.stripeSubId = subscription.id;
            business.trialEndsAt = null; // No longer on trial
            console.log(`[Stripe] Business ${businessId} → ${planInfo.planId} (${planInfo.interval})`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const businessId = subscription.metadata?.businessId;

        if (businessId) {
          const business = mockDb.getBusiness(businessId);
          if (business) {
            business.plan = "starter"; // Downgrade to starter
            business.stripeSubId = null;
            console.log(`[Stripe] Business ${businessId} subscription cancelled, downgraded to starter`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log(`[Stripe] Payment failed for customer ${invoice.customer}`);
        // In production: send email notification to business owner
        break;
      }

      default:
        console.log(`[Stripe] Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error("[Stripe Webhook] Error processing event:", err);
  }

  return NextResponse.json({ received: true });
}
