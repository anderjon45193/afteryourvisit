"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 29,
    annualPrice: 23,
    description: "Perfect for solo practitioners",
    features: [
      "Up to 200 follow-ups/month",
      "1 location",
      "3 pre-built templates",
      "Custom branding (logo + colors)",
      "SMS delivery tracking",
      "Basic analytics",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 59,
    annualPrice: 47,
    description: "For growing practices",
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
    cta: "Start Free Trial",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 99,
    annualPrice: 79,
    description: "For multi-location businesses",
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
    cta: "Start Free Trial",
    popular: false,
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { data: session } = useSession();

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval: annual ? "annual" : "monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Checkout failed
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-warm-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl text-warm-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-warm-500 mb-8">
            Start free for 14 days. No credit card required.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-white rounded-full p-1 border border-warm-200">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !annual
                  ? "bg-teal-600 text-white"
                  : "text-warm-500 hover:text-warm-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                annual
                  ? "bg-teal-600 text-white"
                  : "text-warm-500 hover:text-warm-700"
              }`}
            >
              Annual
              <span className="ml-1.5 text-xs opacity-80">Save 20%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative bg-white rounded-2xl p-8 ${
                plan.popular
                  ? "border-2 border-teal-500 shadow-xl scale-[1.02]"
                  : "border border-warm-200 shadow-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-teal-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-xl font-[family-name:var(--font-display)] text-warm-900">
                {plan.name}
              </h3>
              <p className="text-sm text-warm-500 mt-1">{plan.description}</p>

              <div className="mt-6 mb-6">
                <span className="text-4xl font-bold text-warm-900">
                  ${annual ? plan.annualPrice : plan.monthlyPrice}
                </span>
                <span className="text-warm-400 ml-1">/month</span>
              </div>

              {session ? (
                <Button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={checkoutLoading === plan.id}
                  className={`w-full py-5 text-base font-semibold ${
                    plan.popular
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : "bg-warm-100 hover:bg-warm-200 text-warm-700"
                  }`}
                >
                  {checkoutLoading === plan.id && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {plan.cta}
                </Button>
              ) : (
                <Link href="/sign-up">
                  <Button
                    className={`w-full py-5 text-base font-semibold ${
                      plan.popular
                        ? "bg-teal-600 hover:bg-teal-700 text-white"
                        : "bg-warm-100 hover:bg-warm-200 text-warm-700"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              )}

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-warm-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
