"use client";

import { motion } from "framer-motion";
import { Send, Eye, StarIcon, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "10,000+", label: "Follow-ups sent in beta", icon: Send },
  { value: "4.9", label: "Average satisfaction rating", icon: StarIcon },
  { value: "92%", label: "Average SMS open rate", icon: Eye },
];

export function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-8 sm:gap-16 mb-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-warm-900">{stat.value}</p>
                <p className="text-xs text-warm-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Powered by / Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-16 py-6 border-y border-warm-100"
        >
          <span className="text-xs font-medium text-warm-400 uppercase tracking-wider">Powered by</span>
          <div className="flex items-center gap-2 text-warm-500">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M3 5.5C3 4.12 4.12 3 5.5 3h13C19.88 3 21 4.12 21 5.5v13c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-13z" fill="#F22F46"/>
              <path d="M12 7.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zm0 7a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="white"/>
            </svg>
            <span className="text-sm font-medium">Twilio SMS</span>
          </div>
          <div className="flex items-center gap-2 text-warm-500">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" fill="#6772E5"/>
            </svg>
            <span className="text-sm font-medium">Stripe Payments</span>
          </div>
          <div className="flex items-center gap-2 text-warm-500">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">256-bit Encryption</span>
          </div>
        </motion.div>

        {/* Early-adopter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl text-warm-900 mb-4">
            Join our founding businesses
          </h2>
          <p className="text-lg text-warm-500 mb-3">
            Be one of our first 100 businesses and lock in founding member pricing.
          </p>
          <p className="text-2xl font-bold text-teal-700 mb-6">
            $19/mo for life{" "}
            <span className="text-base font-normal text-warm-400 line-through">$29/mo</span>
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Claim Founding Member Pricing
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-sm text-warm-400 mt-4">
            No credit card required. 14-day free trial included.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
