"use client";

import { motion } from "framer-motion";
import { PhoneMockup } from "./phone-mockup";

export function ClientPreview() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-warm-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl text-warm-900 mb-4">
            What your clients see
          </h2>
          <p className="text-lg text-warm-500 max-w-2xl mx-auto">
            A beautiful, mobile-first follow-up page branded to your business.
            No app download, no login, no friction.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex justify-center"
        >
          <PhoneMockup />
        </motion.div>
      </div>
    </section>
  );
}
