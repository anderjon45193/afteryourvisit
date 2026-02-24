"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is AfterYourVisit HIPAA compliant?",
    answer:
      "AfterYourVisit is designed for general aftercare follow-ups, not for transmitting protected health information (PHI). We recommend keeping visit notes limited to general aftercare instructions like \"avoid hard foods for 24 hours\" rather than specific diagnoses or medical records. For healthcare providers on our Pro plan, we offer a Business Associate Agreement (BAA) upon request.",
  },
  {
    question: "How does SMS delivery work?",
    answer:
      "We use Twilio, the industry-leading SMS delivery platform, to send messages. When you click \"Send,\" your client receives a text within seconds containing a personalized link to their follow-up page. All messages are sent from a dedicated business number registered with carriers for reliable delivery.",
  },
  {
    question: "What happens after the 14-day free trial?",
    answer:
      "After your free trial, you can choose a plan that fits your needs starting at $29/month. No credit card is required to start your trial, and you won't be charged unless you choose to subscribe. All your data and templates are preserved if you upgrade.",
  },
  {
    question: "Can I integrate with my existing practice management software?",
    answer:
      "Currently, AfterYourVisit supports CSV import for bulk contact uploads and works with any contact management workflow. We're actively building integrations for popular systems including Dentrix, Open Dental, Square Appointments, and more. You can also use our Zapier integration to connect with 5,000+ apps.",
  },
  {
    question: "How do clients leave a Google review?",
    answer:
      "Each follow-up page includes a prominent \"Leave Us a Review\" button that links directly to your Google Business Profile review page. It's a natural, non-pushy prompt that clients see after reading their helpful visit summary — which is why it works so well.",
  },
  {
    question: "Can clients opt out of receiving messages?",
    answer:
      "Absolutely. Every SMS includes a \"Reply STOP to opt out\" message, and we automatically maintain an opt-out list per business. We're fully compliant with TCPA and 10DLC messaging regulations. Once a client opts out, they won't receive any further messages from your business through our platform.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

function FaqItem({
  faq,
  index,
}: {
  faq: { question: string; answer: string };
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border border-warm-200 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-warm-50 transition-colors"
        aria-expanded={open}
      >
        <span className="font-semibold text-warm-900 pr-4">{faq.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-warm-400 flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <p className="px-6 pb-5 text-warm-600 leading-relaxed">{faq.answer}</p>
      </div>
    </motion.div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="py-20 lg:py-28 bg-warm-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl text-warm-900 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-warm-500">
            Everything you need to know about AfterYourVisit.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem key={faq.question} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
