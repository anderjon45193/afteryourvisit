"use client";

import { motion } from "framer-motion";
import { Building2, Send, Star } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Building2,
    title: "Client visits",
    description:
      "Your client comes in for their appointment — dental cleaning, oil change, vet check-up, whatever you do best.",
  },
  {
    number: "02",
    icon: Send,
    title: "You tap 'Send'",
    description:
      "In under 30 seconds, enter their name and phone number. We send a beautiful, branded follow-up text instantly.",
  },
  {
    number: "03",
    icon: Star,
    title: "They review",
    description:
      "Your client gets a personalized follow-up page with their visit notes and a gentle nudge to leave a Google review.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl text-warm-900 mb-4">
            How it works
          </h2>
          <p className="text-lg text-warm-500 max-w-2xl mx-auto">
            Three simple steps to turn every appointment into a 5-star review.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-gradient-to-r from-teal-200 via-teal-300 to-teal-200" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center"
            >
              {/* Step number */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 text-teal-700 font-bold text-sm mb-6 relative z-10">
                {step.number}
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-teal-600" />
                </div>
              </div>

              <h3 className="text-xl text-warm-900 mb-3">{step.title}</h3>
              <p className="text-warm-500 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
