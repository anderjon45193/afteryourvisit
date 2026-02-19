"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  User,
  Palette,
  Sparkles,
  AlertCircle,
  Globe,
} from "lucide-react";
import type { AutoBrandResult } from "@/lib/auto-brand-types";

const businessTypes = [
  { value: "dentist", label: "Dentist / Orthodontist" },
  { value: "vet", label: "Veterinarian" },
  { value: "mechanic", label: "Auto Mechanic / Shop" },
  { value: "salon", label: "Salon / Spa" },
  { value: "chiro", label: "Chiropractor / PT" },
  { value: "medical", label: "Medical Practice" },
  { value: "other", label: "Other" },
];

const TOTAL_STEPS = 4;

const steps = [
  { number: 1, label: "Your Account", icon: User },
  { number: 2, label: "Your Business", icon: Building2 },
  { number: 3, label: "Your Brand", icon: Sparkles },
  { number: 4, label: "Personalize", icon: Palette },
];

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") || "";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Account
  const [name, setName] = useState("");
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");

  // Step 2: Business
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Step 3: Brand (auto-detected)
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandResult, setBrandResult] = useState<AutoBrandResult | null>(null);
  const [brandError, setBrandError] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [brandPrimaryColor, setBrandPrimaryColor] = useState("#0D9488");
  const [brandSecondaryColor, setBrandSecondaryColor] = useState("#0F766E");
  const [detectedPhone, setDetectedPhone] = useState("");
  const [detectedGoogleReview, setDetectedGoogleReview] = useState("");

  // Step 4: Personalize
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");

  const canProceedStep1 = name.trim() && email.trim() && password.length >= 8;
  const canProceedStep2 = businessName.trim() && businessType;

  // Visible steps (skip step 3 if no website URL)
  const hasWebsite = websiteUrl.trim().length > 0;

  const getVisibleStep = (logicalStep: number): number => {
    if (!hasWebsite && logicalStep >= 3) return logicalStep + 1;
    return logicalStep;
  };

  const getLogicalStep = (visibleStep: number): number => {
    if (!hasWebsite && visibleStep >= 3) return visibleStep - 1;
    return visibleStep;
  };

  const visibleSteps = hasWebsite
    ? steps
    : steps.filter((s) => s.number !== 3);

  const handleNext = () => {
    setError("");
    if (step === 2 && !hasWebsite) {
      // Skip brand step
      setStep(4);
    } else if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError("");
    if (step === 4 && !hasWebsite) {
      setStep(2);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const fetchBranding = useCallback(async () => {
    if (!websiteUrl.trim()) return;
    setBrandLoading(true);
    setBrandError(false);
    setBrandResult(null);
    try {
      const res = await fetch("/api/business/auto-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });
      if (!res.ok) throw new Error("Failed");
      const data: AutoBrandResult = await res.json();
      setBrandResult(data);
      if (data.logo?.value) setLogoUrl(data.logo.value);
      if (data.primaryColor?.value) setBrandPrimaryColor(data.primaryColor.value);
      if (data.secondaryColor?.value) setBrandSecondaryColor(data.secondaryColor.value);
      if (data.phone?.value) setDetectedPhone(data.phone.value);
      if (data.googleReviewUrl?.value) setDetectedGoogleReview(data.googleReviewUrl.value);
    } catch {
      setBrandError(true);
    } finally {
      setBrandLoading(false);
    }
  }, [websiteUrl]);

  // Auto-fetch branding when entering step 3
  useEffect(() => {
    if (step === 3 && hasWebsite && !brandResult && !brandLoading) {
      fetchBranding();
    }
  }, [step, hasWebsite, brandResult, brandLoading, fetchBranding]);

  // Pre-fill google review URL from auto-detect when entering step 4
  useEffect(() => {
    if (step === 4 && detectedGoogleReview && !googleReviewUrl) {
      setGoogleReviewUrl(detectedGoogleReview);
    }
  }, [step, detectedGoogleReview, googleReviewUrl]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          businessName,
          businessType,
          businessPhone,
          websiteUrl: websiteUrl || undefined,
          googleReviewUrl,
          bookingUrl,
          logoUrl: logoUrl || undefined,
          brandPrimaryColor,
          brandSecondaryColor,
          autoBrandFetched: !!brandResult,
          autoBrandData: brandResult || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Auto-sign-in and redirect to onboarding wizard
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/dashboard/welcome");
      } else {
        router.push("/sign-in?registered=true");
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4 py-12">
      {/* Background accents */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50/50 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-50/40 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-[family-name:var(--font-display)] text-2xl text-teal-700 tracking-tight">
              AfterYourVisit
            </span>
          </Link>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {visibleSteps.map((s, i) => (
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
              {i < visibleSteps.length - 1 && (
                <div
                  className={`w-8 h-px mx-1 ${
                    step > s.number ? "bg-teal-300" : "bg-warm-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-warm-100 shadow-card p-8">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl text-warm-900 mb-1">
                Create your account
              </h1>
              <p className="text-sm text-warm-400 mb-6">
                Start your 14-day free trial. No credit card required.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Your full name
                  </label>
                  <Input
                    type="text"
                    placeholder="Dr. Sarah Chen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Email address
                  </label>
                  <Input
                    type="email"
                    placeholder="you@yourbusiness.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                  />
                  <p className="text-xs text-warm-300 mt-1">
                    Must be at least 8 characters
                  </p>
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!canProceedStep1}
                  className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Business */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl text-warm-900 mb-1">
                Tell us about your business
              </h1>
              <p className="text-sm text-warm-400 mb-6">
                We&apos;ll set up your templates and branding automatically.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Business name
                  </label>
                  <Input
                    type="text"
                    placeholder="Smile Dental Care"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="h-11"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Business type
                  </label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((bt) => (
                        <SelectItem key={bt.value} value={bt.value}>
                          {bt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Business phone{" "}
                    <span className="text-warm-300 font-normal">(optional)</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Website URL{" "}
                    <span className="text-warm-300 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-300" />
                    <Input
                      type="url"
                      placeholder="www.yourbusiness.com"
                      value={websiteUrl}
                      onChange={(e) => {
                        setWebsiteUrl(e.target.value);
                        // Reset brand result when URL changes
                        setBrandResult(null);
                        setBrandError(false);
                      }}
                      className="h-11 pl-10"
                    />
                  </div>
                  <p className="text-xs text-warm-300 mt-1">
                    We&apos;ll auto-detect your logo and brand colors
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="h-11"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceedStep2}
                    className="flex-1 h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Brand (auto-detected) */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl text-warm-900 mb-1">
                Your brand
              </h1>
              <p className="text-sm text-warm-400 mb-6">
                {brandLoading
                  ? "Analyzing your website..."
                  : brandError
                  ? "We couldn't detect everything — you can set these manually."
                  : "We detected these from your website. Feel free to adjust."}
              </p>

              {brandLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-warm-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-warm-100 rounded w-3/4" />
                      <div className="h-3 bg-warm-50 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-10 bg-warm-100 rounded w-1/2" />
                    <div className="h-10 bg-warm-100 rounded w-1/2" />
                  </div>
                  <div className="h-10 bg-warm-100 rounded" />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Logo preview */}
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-2">
                      Logo
                    </label>
                    {logoUrl ? (
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl border border-warm-100 bg-warm-50 flex items-center justify-center overflow-hidden">
                          <Image
                            src={logoUrl}
                            alt="Detected logo"
                            width={64}
                            height={64}
                            className="object-contain w-full h-full"
                            unoptimized
                          />
                        </div>
                        <div className="text-sm">
                          <p className="text-warm-600">Logo detected</p>
                          {brandResult?.logo && (
                            <p className="text-xs text-warm-300">
                              via {brandResult.logo.source}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-warm-400">
                        No logo detected. You can upload one later in settings.
                      </p>
                    )}
                  </div>

                  {/* Brand colors */}
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-2">
                      Brand Colors
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-warm-400 mb-1">
                          Primary
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={brandPrimaryColor}
                            onChange={(e) => setBrandPrimaryColor(e.target.value)}
                            className="w-10 h-10 rounded-lg border border-warm-200 cursor-pointer p-0.5"
                          />
                          <Input
                            value={brandPrimaryColor}
                            onChange={(e) => setBrandPrimaryColor(e.target.value)}
                            className="flex-1 text-sm h-10"
                            maxLength={7}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-warm-400 mb-1">
                          Secondary
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={brandSecondaryColor}
                            onChange={(e) => setBrandSecondaryColor(e.target.value)}
                            className="w-10 h-10 rounded-lg border border-warm-200 cursor-pointer p-0.5"
                          />
                          <Input
                            value={brandSecondaryColor}
                            onChange={(e) => setBrandSecondaryColor(e.target.value)}
                            className="flex-1 text-sm h-10"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detected info summary */}
                  {(detectedPhone || detectedGoogleReview) && (
                    <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                      <p className="text-xs font-medium text-teal-700 uppercase tracking-wider mb-2">
                        Also detected
                      </p>
                      <div className="space-y-1 text-sm">
                        {detectedPhone && (
                          <p className="text-teal-800">
                            <span className="text-teal-500">Phone: </span>
                            {detectedPhone}
                          </p>
                        )}
                        {detectedGoogleReview && (
                          <p className="text-teal-800">
                            <span className="text-teal-500">Google Reviews: </span>
                            Found
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {brandError && (
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                      <p className="text-sm text-amber-700">
                        We couldn&apos;t auto-detect your branding. You can set your colors manually above, or skip and update them later in settings.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="h-11"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={brandLoading}
                  className="flex-1 h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Personalize */}
          {step === 4 && (
            <div>
              <h1 className="text-2xl text-warm-900 mb-1">
                Last step — personalize
              </h1>
              <p className="text-sm text-warm-400 mb-6">
                These are optional. You can always update them later in settings.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Google Review URL{" "}
                    <span className="text-warm-300 font-normal">(optional)</span>
                  </label>
                  <Input
                    type="url"
                    placeholder="https://g.page/r/your-business/review"
                    value={googleReviewUrl}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                    className="h-11"
                    autoFocus
                  />
                  <p className="text-xs text-warm-300 mt-1">
                    This is the link your clients will use to leave a review.
                    {detectedGoogleReview && !googleReviewUrl && " (Auto-detected from your website)"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Booking URL{" "}
                    <span className="text-warm-300 font-normal">(optional)</span>
                  </label>
                  <Input
                    type="url"
                    placeholder="https://calendly.com/your-business"
                    value={bookingUrl}
                    onChange={(e) => setBookingUrl(e.target.value)}
                    className="h-11"
                  />
                </div>

                {/* Summary */}
                <div className="bg-warm-50 rounded-xl p-4 border border-warm-100">
                  <p className="text-xs font-medium text-warm-400 uppercase tracking-wider mb-2">
                    Account Summary
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="text-warm-700">
                      <span className="text-warm-400">Name: </span>
                      {name}
                    </p>
                    <p className="text-warm-700">
                      <span className="text-warm-400">Email: </span>
                      {email}
                    </p>
                    <p className="text-warm-700">
                      <span className="text-warm-400">Business: </span>
                      {businessName}
                    </p>
                    <p className="text-warm-700">
                      <span className="text-warm-400">Type: </span>
                      {businessTypes.find((bt) => bt.value === businessType)
                        ?.label || businessType}
                    </p>
                    {brandResult && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-warm-400">Brand: </span>
                        <div
                          className="w-4 h-4 rounded-sm border border-warm-200"
                          style={{ backgroundColor: brandPrimaryColor }}
                        />
                        <div
                          className="w-4 h-4 rounded-sm border border-warm-200"
                          style={{ backgroundColor: brandSecondaryColor }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="h-11"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Create Account & Start Trial
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sign in link */}
        <p className="text-center text-sm text-warm-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-teal-600 hover:text-teal-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
