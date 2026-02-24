"use client";

import { motion } from "framer-motion";
import { Star, Send, Eye, StarIcon } from "lucide-react";

const stats = [
  { value: "10,000+", label: "Follow-ups sent", icon: Send },
  { value: "4.9", label: "Average rating", icon: StarIcon },
  { value: "92%", label: "Open rate", icon: Eye },
];

const testimonials = [
  {
    quote:
      "We went from 2-3 Google reviews a month to over 20. Our patients actually thank us for the follow-up texts. It's a win-win.",
    name: "Dr. Sarah Chen",
    title: "Owner",
    business: "Bright Smiles Dental",
    type: "Dentist",
    initials: "SC",
    rating: 5,
  },
  {
    quote:
      "Setup took 5 minutes. Now my front desk sends follow-ups after every appointment. Our Google rating went from 4.2 to 4.8 in two months.",
    name: "Mike Reynolds",
    title: "Manager",
    business: "QuickFix Auto Care",
    type: "Auto Shop",
    initials: "MR",
    rating: 5,
  },
  {
    quote:
      "Pet parents love getting a summary of their visit. And the review link is so natural — it doesn't feel pushy at all. Brilliant product.",
    name: "Dr. Emily Tran",
    title: "Veterinarian",
    business: "Happy Paws Vet Clinic",
    type: "Veterinarian",
    initials: "ET",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl text-warm-900 mb-4">
            Loved by local businesses
          </h2>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-warm-50 rounded-2xl p-8 border border-warm-100"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <blockquote className="text-warm-700 leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center" aria-label={t.name} role="img">
                  <span className="text-teal-700 font-semibold text-sm" aria-hidden="true">
                    {t.initials}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-warm-900">{t.name}</p>
                  <p className="text-xs text-warm-500">
                    {t.title}, {t.business}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
