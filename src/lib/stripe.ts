import Stripe from "stripe";

// Initialize Stripe with secret key
// In production, set STRIPE_SECRET_KEY in environment
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-01-28.clover",
  typescript: true,
});

// Plan configuration
export const PLANS = {
  starter: {
    name: "Starter",
    monthlyPriceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || "price_starter_monthly",
    annualPriceId: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID || "price_starter_annual",
    monthlyPrice: 29,
    annualPrice: 23,
    limits: {
      followUpsPerMonth: 200,
      locations: 1,
      teamMembers: 1,
    },
    features: [
      "Up to 200 follow-ups/month",
      "1 location",
      "3 pre-built templates",
      "Custom branding (logo + colors)",
      "SMS delivery tracking",
      "Basic analytics",
      "Email support",
    ],
  },
  growth: {
    name: "Growth",
    monthlyPriceId: process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID || "price_growth_monthly",
    annualPriceId: process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID || "price_growth_annual",
    monthlyPrice: 59,
    annualPrice: 47,
    limits: {
      followUpsPerMonth: 1000,
      locations: 3,
      teamMembers: 5,
    },
    features: [
      "Up to 1,000 follow-ups/month",
      "3 locations",
      "Unlimited custom templates",
      "Custom branding (logo + colors)",
      "Advanced analytics & charts",
      "Snippet library",
      "Team members (up to 5)",
      "Priority support",
    ],
  },
  pro: {
    name: "Pro",
    monthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "price_pro_monthly",
    annualPriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || "price_pro_annual",
    monthlyPrice: 99,
    annualPrice: 79,
    limits: {
      followUpsPerMonth: Infinity,
      locations: Infinity,
      teamMembers: Infinity,
    },
    features: [
      "Unlimited follow-ups",
      "Unlimited locations",
      "Unlimited templates",
      "Full white-label branding",
      "API access",
      "Unlimited team members",
      "Custom integrations",
      "Dedicated account manager",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): { planId: PlanId; interval: "monthly" | "annual" } | null {
  for (const [planId, plan] of Object.entries(PLANS)) {
    if (plan.monthlyPriceId === priceId) return { planId: planId as PlanId, interval: "monthly" };
    if (plan.annualPriceId === priceId) return { planId: planId as PlanId, interval: "annual" };
  }
  return null;
}

export function getPlanLimits(plan: string) {
  if (plan in PLANS) return PLANS[plan as PlanId].limits;
  // Trial gets starter limits
  return PLANS.starter.limits;
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
