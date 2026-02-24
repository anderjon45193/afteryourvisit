"use client";

import { motion } from "framer-motion";

const industries = [
  {
    icon: "🦷",
    name: "Dentists & Orthodontists",
    preview:
      "\"Hi Sarah! Thanks for visiting Smile Dental today. Here's your visit summary with aftercare instructions...\"",
    demoId: "fu-1",
  },
  {
    icon: "🐾",
    name: "Veterinarians",
    preview:
      "\"Hi Mike! Thanks for bringing Buddy to Paws & Claws today. Here are the visit notes from Dr. Chen...\"",
    demoId: "fu-2",
  },
  {
    icon: "🔧",
    name: "Auto Mechanics & Shops",
    preview:
      "\"Hi James! Your oil change at Precision Auto Works is complete. Here's your service summary and maintenance tips...\"",
    demoId: "fu-4",
  },
  {
    icon: "✂️",
    name: "Salons & Spas",
    preview:
      "\"Hi Emma! Thanks for visiting Glow Studio today. Here are your stylist's product recommendations...\"",
    demoId: "fu-3",
  },
  {
    icon: "🦴",
    name: "Chiropractors & PT",
    preview:
      "\"Hi Alex! Here's your visit summary from Back in Balance. Remember to do your exercises daily...\"",
    demoId: "fu-5",
  },
  {
    icon: "🏥",
    name: "Medical Practices",
    preview:
      "\"Hi David! Thanks for visiting Lakeside Family Medicine today. Here are your visit notes and next steps...\"",
    demoId: "fu-6",
  },
];

export function Industries() {
  return (
    <section id="industries" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl text-warm-900 mb-4">
            Built for every local business
          </h2>
          <p className="text-lg text-warm-500 max-w-2xl mx-auto">
            Pre-built templates tailored to your industry. Up and running in minutes.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((ind, i) => (
            <motion.a
              key={ind.name}
              href="/sign-up"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group relative bg-white rounded-xl border border-warm-100 p-6 hover:-translate-y-1 hover:shadow-lg hover:border-teal-200 transition-all duration-250 cursor-pointer block flex flex-col"
            >
              <span className="text-3xl mb-4 block" aria-hidden="true">{ind.icon}</span>
              <h3 className="text-lg font-[family-name:var(--font-display)] text-warm-900 mb-2">
                {ind.name}
              </h3>
              <p className="text-sm text-warm-500 italic leading-relaxed mb-4">
                {ind.preview}
              </p>
              <span className="inline-block text-sm font-semibold text-teal-600 group-hover:text-teal-700 transition-colors">
                Try Free →
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
