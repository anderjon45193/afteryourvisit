"use client";

import { motion } from "framer-motion";

const industries = [
  { icon: "🦷", label: "Dental" },
  { icon: "🐾", label: "Veterinary" },
  { icon: "🔧", label: "Auto" },
  { icon: "✂️", label: "Salons" },
  { icon: "🧘", label: "Chiro & PT" },
  { icon: "🏥", label: "Medical" },
];

export function SocialProof() {
  return (
    <section className="py-8 border-y border-warm-100 bg-white/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <p className="text-sm font-medium text-warm-500">
            Built for local service businesses
          </p>
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide px-2 -mx-2 sm:overflow-visible sm:px-0 sm:mx-0">
            {industries.map((ind) => (
              <div
                key={ind.label}
                className="flex items-center gap-1.5 text-warm-400 flex-shrink-0"
                title={ind.label}
              >
                <span className="text-lg" aria-hidden="true">{ind.icon}</span>
                <span className="text-xs hidden sm:inline">{ind.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
