import { NextResponse } from "next/server";
import { stripe, getPlanByPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/db";

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
        const planId = session.metadata?.planId;
        const stripeCustomerId = session.customer as string;
        const stripeSubId = session.subscription as string;

        if (businessId) {
          await prisma.business.update({
            where: { id: businessId },
            data: {
              stripeCustomerId,
              stripeSubId,
              ...(planId ? { plan: planId } : {}),
            },
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const businessId = subscription.metadata?.businessId;
        const priceId = subscription.items?.data?.[0]?.price?.id;

        if (businessId && priceId) {
          const planInfo = getPlanByPriceId(priceId);

          if (planInfo) {
            await prisma.business.update({
              where: { id: businessId },
              data: {
                plan: planInfo.planId,
                stripeSubId: subscription.id,
                trialEndsAt: null,
              },
            });
            console.log(`[Stripe] Business ${businessId} → ${planInfo.planId} (${planInfo.interval})`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const businessId = subscription.metadata?.businessId;

        if (businessId) {
          await prisma.business.update({
            where: { id: businessId },
            data: {
              plan: "starter",
              stripeSubId: null,
            },
          });
          console.log(`[Stripe] Business ${businessId} subscription cancelled, downgraded to starter`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log(`[Stripe] Payment failed for customer ${invoice.customer}`);
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
