"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Send,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Sparkles,
  ArrowLeft,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
}

interface Snippet {
  id: string;
  label: string;
}

interface ContactSuggestion {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string;
  lastFollowUpAt: string | null;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function relativeDate(dateStr: string | null) {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function SendFollowUpPageWrapper() {
  return (
    <Suspense fallback={<div className="p-6 text-warm-400">Loading...</div>}>
      <SendFollowUpPage />
    </Suspense>
  );
}

function SendFollowUpPage() {
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [notes, setNotes] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);

  // Autocomplete state
  const [contactSuggestions, setContactSuggestions] = useState<ContactSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch templates and snippets on mount + pre-fill from contactId
  useEffect(() => {
    nameRef.current?.focus();

    fetch("/api/templates")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) return;
        setTemplates(data);
        const defaultTpl = data.find((t: Record<string, unknown>) => t.isDefault);
        if (defaultTpl) setTemplateId(defaultTpl.id);
        else if (data.length > 0) setTemplateId(data[0].id);
      })
      .catch(() => {});

    fetch("/api/snippets")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setSnippets(data);
      })
      .catch(() => {});

    // Pre-fill from contactId query param
    const contactId = searchParams.get("contactId");
    if (contactId) {
      fetch(`/api/contacts/${contactId}`)
        .then((r) => {
          if (!r.ok) throw new Error("Failed");
          return r.json();
        })
        .then((data) => {
          if (data.firstName) {
            setFirstName(data.firstName);
            setPhone(data.phone || "");
            setSelectedContact(data.id);
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const searchContacts = useCallback((query: string) => {
    if (query.length < 2) {
      setContactSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    fetch(`/api/contacts/search?q=${encodeURIComponent(query)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => {
        setContactSuggestions(data);
        setShowSuggestions(data.length > 0);
      })
      .catch(() => {});
  }, []);

  const handleNameChange = (value: string) => {
    setFirstName(value);
    setSelectedContact(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchContacts(value), 300);
  };

  const selectSuggestion = (suggestion: ContactSuggestion) => {
    setFirstName(suggestion.firstName);
    setPhone(suggestion.phone);
    setSelectedContact(suggestion.id);
    setShowSuggestions(false);
    setContactSuggestions([]);
  };

  const canSend = firstName.trim() && phone.replace(/\D/g, "").length === 10 && templateId;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientFirstName: firstName.trim(),
          clientPhone: phone,
          templateId,
          customNotes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setFirstName("");
    setPhone("");
    setNotes("");
    setError("");
    setSent(false);
    setShowPreview(false);
    setSelectedContact(null);
    setContactSuggestions([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaultTpl = templates.find((t: any) => t.isDefault);
    if (defaultTpl) setTemplateId(defaultTpl.id);
    setTimeout(() => nameRef.current?.focus(), 100);
  };

  const insertSnippet = (snippet: string) => {
    setNotes((prev) => (prev ? `${prev}\n${snippet}` : snippet));
  };

  return (
    <div className="max-w-[560px] mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-warm-400 hover:text-warm-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-2xl border border-warm-100 shadow-card p-6 sm:p-8">
              <div className="mb-6">
                <h1 className="text-2xl text-warm-900">
                  Send Follow-Up
                </h1>
                <p className="text-sm text-warm-400 mt-1">
                  Your client will receive a text in seconds.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                {/* Client name with autocomplete */}
                <div className="relative">
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Client First Name
                  </label>
                  <Input
                    ref={nameRef}
                    type="text"
                    placeholder="Sarah"
                    value={firstName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setShowSuggestions(false);
                    }}
                    className="h-12 text-base"
                  />
                  {/* Autocomplete dropdown */}
                  {showSuggestions && contactSuggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-xl border border-warm-200 shadow-lg overflow-hidden"
                    >
                      {contactSuggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectSuggestion(s)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-warm-50 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-teal-700">
                              {s.firstName[0]}
                              {s.lastName?.[0] || ""}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-warm-800 truncate">
                              {s.firstName} {s.lastName || ""}
                            </p>
                            <p className="text-xs text-warm-400">{s.phone}</p>
                          </div>
                          <span className="text-[10px] text-warm-300">
                            {relativeDate(s.lastFollowUpAt)}
                          </span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowSuggestions(false)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-teal-600 hover:bg-teal-50 border-t border-warm-100 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Add as new contact
                      </button>
                    </div>
                  )}
                </div>

                {/* Phone number */}
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="h-12 text-base"
                  />
                </div>

                {/* Template */}
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Template
                  </label>
                  <Select value={templateId} onValueChange={setTemplateId}>
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

                {/* Quick notes */}
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Quick Notes{" "}
                    <span className="text-warm-300 font-normal">(optional)</span>
                  </label>
                  <Textarea
                    placeholder="Add any specific notes for this visit..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[80px] text-sm resize-none"
                  />

                  {/* Snippet pills */}
                  {snippets.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {snippets.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => insertSnippet(s.label)}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-warm-50 text-xs text-warm-600 hover:bg-teal-50 hover:text-teal-700 transition-all hover:scale-105 border border-warm-100 hover:border-teal-200"
                        >
                          <Sparkles className="w-3 h-3 mr-1.5 text-warm-300" />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preview toggle */}
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? "Hide" : "Show"} Preview
                  {showPreview ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>

                <AnimatePresence>
                  {showPreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-warm-50 rounded-xl p-4 border border-warm-100">
                        <p className="text-xs font-medium text-warm-400 mb-2 uppercase tracking-wider">
                          SMS Preview
                        </p>
                        <div className="bg-teal-600 text-white rounded-2xl rounded-bl-md p-3 text-sm max-w-[280px]">
                          Hi {firstName || "Sarah"}! Thanks for visiting Smile
                          Dental Care today. Here&apos;s your visit summary:
                          afteryourvisit.com/v/abc123
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Send button */}
                <Button
                  onClick={handleSend}
                  disabled={!canSend || sending}
                  className="w-full h-14 text-base font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
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
                      Send Follow-Up{firstName ? ` to ${firstName}` : ""}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
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

              <h2 className="text-2xl text-warm-900 mb-2">
                Follow-up sent to {firstName}!
              </h2>
              <p className="text-warm-500 mb-8">
                They&apos;ll receive it in seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleReset}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Another
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full sm:w-auto px-8">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
