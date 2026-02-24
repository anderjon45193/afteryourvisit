"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  const [email, setEmail] = useState("");

  return (
    <section className="py-20 lg:py-28 bg-teal-800 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-teal-700/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-900/50 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white mb-6">
            Start turning visits into 5-star reviews.
          </h2>
          <p className="text-teal-200 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of local businesses using AfterYourVisit to delight
            clients and grow their reputation.
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!email) return;
              try {
                await fetch("/api/leads", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });
              } catch {
                // Don't block redirect if lead capture fails
              }
              window.location.href = `/sign-up?email=${encodeURIComponent(email)}`;
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <label htmlFor="cta-email" className="sr-only">
              Email address
            </label>
            <Input
              id="cta-email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-teal-300 h-12 flex-1"
              required
            />
            <Button
              type="submit"
              size="lg"
              className="bg-white hover:bg-warm-50 text-teal-800 font-semibold h-12 px-6 shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="mt-4 text-sm text-teal-300">
            No credit card required. Set up in under 5 minutes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
