"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  Send,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Upload,
  FileText,
  Palette,
  Phone,
} from "lucide-react";
import { PhoneFrame } from "@/components/dashboard/phone-frame";
import { FollowUpPreview } from "@/components/dashboard/follow-up-preview";
import type { Section } from "@/lib/types";

interface Template {
  id: string;
  name: string;
  isDefault?: boolean;
  pageHeading: string;
  pageSubheading: string;
  sections: Section[];
  showReviewCta: boolean;
  showBookingCta: boolean;
}

interface BusinessData {
  name: string;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  phone: string | null;
  logoUrl: string | null;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const TOTAL_STEPS = 3;

const steps = [
  { number: 1, label: "Preview", icon: Sparkles },
  { number: 2, label: "Send Test", icon: Phone },
  { number: 3, label: "All Set", icon: Check },
];

export default function WelcomePage() {
  const [step, setStep] = useState(1);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch business + templates on mount (with retry for fresh sessions)
  useEffect(() => {
    let retryCount = 0;

    function loadData() {
      Promise.all([
        fetch("/api/business").then((r) => {
          if (!r.ok) throw new Error("Failed");
          return r.json();
        }),
        fetch("/api/templates").then((r) => {
          if (!r.ok) throw new Error("Failed");
          return r.json();
        }),
      ])
        .then(([bizData, tplData]) => {
          // Retry if session not ready yet (empty placeholder)
          if (bizData?._empty && retryCount < 3) {
            retryCount++;
            setTimeout(loadData, 1000);
            return;
          }
          if (bizData?.name) setBusiness(bizData);
          if (Array.isArray(tplData)) setTemplates(tplData);
          if (bizData.phone) setPhone(bizData.phone);
          const defaultTpl = tplData.find((t: Template) => t.isDefault);
          if (defaultTpl) setSelectedTemplateId(defaultTpl.id);
          else if (tplData.length > 0) setSelectedTemplateId(tplData[0].id);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }

    loadData();
  }, []);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const canSend = phone.replace(/\D/g, "").length === 10 && selectedTemplateId;

  const handleSendTest = async () => {
    if (!canSend) return;
    setSending(true);
    setSendError("");

    try {
      const res = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientFirstName: "Test",
          clientPhone: phone,
          templateId: selectedTemplateId,
          customNotes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }

      setStep(3);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white rounded-2xl border border-warm-100 shadow-card p-8 animate-pulse">
          <div className="h-8 bg-warm-100 rounded w-64 mb-4" />
          <div className="h-4 bg-warm-50 rounded w-96 mb-8" />
          <div className="h-[400px] bg-warm-50 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                step === s.number
                  ? "bg-teal-600 text-white"
                  : step > s.number
                  ? "bg-teal-100 text-teal-700"
                  : "bg-warm-100 text-warm-400"
              }`}
            >
              {step > s.number ? (
                <Check className="w-3 h-3" />
              ) : (
                <s.icon className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-px mx-1 ${
                  step > s.number ? "bg-teal-300" : "bg-warm-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Welcome + Preview */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-2xl border border-warm-100 shadow-card p-8">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4"
                >
                  <Sparkles className="w-8 h-8 text-teal-600" />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl text-warm-900 mb-2">
                  Your follow-up page is ready!
                </h1>
                <p className="text-warm-400 max-w-md mx-auto">
                  Here&apos;s what your clients will see after their visit. A branded page with visit
                  notes, next steps, and a review prompt.
                </p>
              </div>

              {/* Phone preview */}
              <div className="flex justify-center mb-8">
                <PhoneFrame>
                  {selectedTemplate ? (
                    <FollowUpPreview
                      pageHeading={selectedTemplate.pageHeading}
                      pageSubheading={selectedTemplate.pageSubheading}
                      sections={selectedTemplate.sections}
                      showReviewCta={selectedTemplate.showReviewCta}
                      showBookingCta={selectedTemplate.showBookingCta}
                      businessName={business?.name || "Your Business"}
                      brandPrimaryColor={business?.brandPrimaryColor || "#14B8A6"}
                    />
                  ) : (
                    <FollowUpPreview
                      pageHeading="Thanks for visiting, {{firstName}}!"
                      pageSubheading="Here's your visit summary"
                      sections={[
                        { type: "notes", title: "Visit Notes" },
                        {
                          type: "checklist",
                          title: "Next Steps",
                          items: ["Follow up in 2 weeks", "Continue prescribed treatment"],
                        },
                      ]}
                      showReviewCta={true}
                      showBookingCta={true}
                      businessName={business?.name || "Your Business"}
                      brandPrimaryColor={business?.brandPrimaryColor || "#14B8A6"}
                    />
                  )}
                </PhoneFrame>
              </div>

              <div className="text-center">
                <Button
                  onClick={() => setStep(2)}
                  className="h-12 px-8 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base"
                >
                  Send yourself a test
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Send Test */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-2xl border border-warm-100 shadow-card p-8">
              <div className="mb-6">
                <h1 className="text-2xl text-warm-900 mb-1">
                  Try it out — send yourself a test
                </h1>
                <p className="text-sm text-warm-400">
                  Enter your phone number and we&apos;ll send you a real follow-up text so you can
                  see the full experience.
                </p>
              </div>

              {sendError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                  {sendError}
                </div>
              )}

              <div className="space-y-5">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Your phone number
                  </label>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="h-12 text-base"
                    autoFocus
                  />
                </div>

                {/* Template */}
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Template
                  </label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Notes{" "}
                    <span className="text-warm-300 font-normal">(optional)</span>
                  </label>
                  <Textarea
                    placeholder="Add any test notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[80px] text-sm resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="h-12"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSendTest}
                    disabled={!canSend || sending}
                    className="flex-1 h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base"
                  >
                    {sending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Send className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Test
                      </>
                    )}
                  </Button>
                </div>

                {/* Skip link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-sm text-warm-400 hover:text-warm-600 transition-colors underline underline-offset-2"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: All Set */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="bg-white rounded-2xl border border-warm-100 shadow-card p-8 sm:p-10 text-center">
              {/* Success checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1,
                }}
                className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                >
                  <Check className="w-10 h-10 text-green-500" />
                </motion.div>
              </motion.div>

              <h2 className="text-2xl sm:text-3xl text-warm-900 mb-2">
                You&apos;re all set!
              </h2>
              <p className="text-warm-400 mb-8 max-w-md mx-auto">
                Your account is ready to go. Here are a few things you can do next to get the most
                out of AfterYourVisit.
              </p>

              {/* Next step cards */}
              <div className="grid gap-4 sm:grid-cols-3 text-left mb-8">
                <Link href="/dashboard/send">
                  <div className="group p-5 rounded-xl border border-warm-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-3 group-hover:bg-teal-100 transition-colors">
                      <Send className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-warm-800 mb-1">
                      Send your first follow-up
                    </h3>
                    <p className="text-xs text-warm-400">
                      Send a real follow-up to a client after their visit.
                    </p>
                    <ArrowRight className="w-4 h-4 text-teal-500 mt-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link href="/dashboard/contacts?import=true">
                  <div className="group p-5 rounded-xl border border-warm-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                      <Upload className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-warm-800 mb-1">
                      Import your contacts
                    </h3>
                    <p className="text-xs text-warm-400">
                      Upload a CSV to quickly add your client list.
                    </p>
                    <ArrowRight className="w-4 h-4 text-teal-500 mt-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link href="/dashboard/templates">
                  <div className="group p-5 rounded-xl border border-warm-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                      <Palette className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-warm-800 mb-1">
                      Customize your templates
                    </h3>
                    <p className="text-xs text-warm-400">
                      Tailor the follow-up page to match your brand.
                    </p>
                    <ArrowRight className="w-4 h-4 text-teal-500 mt-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              <Link href="/dashboard">
                <Button variant="outline" className="px-8">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
