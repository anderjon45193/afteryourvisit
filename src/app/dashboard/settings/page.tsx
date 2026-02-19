"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Users,
  Link as LinkIcon,
  CreditCard,
  MessageSquare,
  Save,
  ExternalLink,
  Check,
  Loader2,
} from "lucide-react";

const tabs = [
  { id: "profile", label: "Business Profile", icon: Building2 },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "team", label: "Team", icon: Users },
  { id: "google", label: "Google", icon: LinkIcon },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "sms", label: "SMS Settings", icon: MessageSquare },
];

const PLAN_DETAILS: Record<string, { name: string; monthlyPrice: number; limits: { followUpsPerMonth: number } }> = {
  starter: { name: "Starter", monthlyPrice: 29, limits: { followUpsPerMonth: 200 } },
  growth: { name: "Growth", monthlyPrice: 59, limits: { followUpsPerMonth: 1000 } },
  pro: { name: "Pro", monthlyPrice: 99, limits: { followUpsPerMonth: Infinity } },
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-warm-400">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}

interface ProfileForm {
  name: string;
  type: string;
  email: string;
  phone: string;
  websiteUrl: string;
  bookingUrl: string;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  googleReviewUrl: string;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(tabParam);

  // Sync tab when navigating via URL (e.g. sidebar "Upgrade" link)
  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [business, setBusiness] = useState<Record<string, unknown> | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: "", type: "", email: "", phone: "",
    websiteUrl: "", bookingUrl: "",
    brandPrimaryColor: "#0D9488", brandSecondaryColor: "#0F766E",
    googleReviewUrl: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    fetch("/api/business")
      .then((r) => r.json())
      .then((data) => {
        setBusiness(data);
        setProfileForm({
          name: (data.name as string) || "",
          type: (data.type as string) || "",
          email: (data.email as string) || "",
          phone: (data.phone as string) || "",
          websiteUrl: (data.websiteUrl as string) || "",
          bookingUrl: (data.bookingUrl as string) || "",
          brandPrimaryColor: (data.brandPrimaryColor as string) || "#0D9488",
          brandSecondaryColor: (data.brandSecondaryColor as string) || "#0F766E",
          googleReviewUrl: (data.googleReviewUrl as string) || "",
        });
      })
      .catch(() => {});
  }, []);

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileSaved(false);
    try {
      const res = await fetch("/api/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name,
          type: profileForm.type,
          email: profileForm.email,
          phone: profileForm.phone,
          websiteUrl: profileForm.websiteUrl,
          bookingUrl: profileForm.bookingUrl,
          googleReviewUrl: profileForm.googleReviewUrl,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBusiness(updated);
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      }
    } catch {
      // Save failed
    } finally {
      setProfileSaving(false);
    }
  };

  const updateProfile = (field: keyof ProfileForm, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const currentPlan = (business?.plan as string) || "starter";
  const planInfo = PLAN_DETAILS[currentPlan] || PLAN_DETAILS.starter;
  const isOnTrial = !!business?.trialEndsAt;
  const hasStripe = !!business?.stripeCustomerId;

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Portal not available without Stripe customer
    } finally {
      setPortalLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval: "monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Checkout failed
    } finally {
      setCheckoutLoading(null);
    }
  };

  const trialDaysLeft = isOnTrial
    ? Math.max(0, Math.ceil((new Date(business.trialEndsAt as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl text-warm-900">Settings</h1>
        <p className="text-sm text-warm-400 mt-1">
          Manage your business and account
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-teal-50 text-teal-700"
                    : "text-warm-500 hover:bg-warm-50 hover:text-warm-700"
                }`}
              >
                <tab.icon
                  className={`w-4 h-4 ${
                    activeTab === tab.id ? "text-teal-600" : "text-warm-400"
                  }`}
                />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="bg-white rounded-xl border border-warm-100 shadow-sm p-6">
              <h2 className="text-lg text-warm-900 font-[family-name:var(--font-display)] mb-6">
                Business Profile
              </h2>

              <div className="space-y-5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-teal-700">
                      {profileForm.name.slice(0, 2).toUpperCase() || "BZ"}
                    </span>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      Upload Logo
                    </Button>
                    <p className="text-xs text-warm-400 mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1.5">
                      Business Name
                    </label>
                    <Input value={profileForm.name} onChange={(e) => updateProfile("name", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1.5">
                      Business Type
                    </label>
                    <Input value={profileForm.type} onChange={(e) => updateProfile("type", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1.5">
                      Email
                    </label>
                    <Input value={profileForm.email} onChange={(e) => updateProfile("email", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1.5">
                      Phone
                    </label>
                    <Input value={profileForm.phone} onChange={(e) => updateProfile("phone", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1.5">
                      Website
                    </label>
                    <Input value={profileForm.websiteUrl} onChange={(e) => updateProfile("websiteUrl", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1.5">
                      Booking URL
                    </label>
                    <Input value={profileForm.bookingUrl} onChange={(e) => updateProfile("bookingUrl", e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Brand Colors
                  </label>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg border border-warm-200" style={{ backgroundColor: profileForm.brandPrimaryColor }} />
                      <Input value={profileForm.brandPrimaryColor} onChange={(e) => updateProfile("brandPrimaryColor", e.target.value)} className="w-28 text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg border border-warm-200" style={{ backgroundColor: profileForm.brandSecondaryColor }} />
                      <Input value={profileForm.brandSecondaryColor} onChange={(e) => updateProfile("brandSecondaryColor", e.target.value)} className="w-28 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-warm-100 flex items-center gap-3">
                  <Button
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={handleProfileSave}
                    disabled={profileSaving}
                  >
                    {profileSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : profileSaved ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {profileSaved ? "Saved!" : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              {/* Current plan */}
              <div className="bg-white rounded-xl border border-warm-100 shadow-sm p-6">
                <h2 className="text-lg text-warm-900 font-[family-name:var(--font-display)] mb-6">
                  Current Plan
                </h2>

                <div className="bg-warm-50 rounded-xl p-5 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-warm-800">
                          {planInfo.name} Plan
                        </h3>
                        {isOnTrial ? (
                          <Badge className="bg-amber-50 text-amber-700 text-xs">
                            Trial &middot; {trialDaysLeft} days left
                          </Badge>
                        ) : (
                          <Badge className="bg-teal-50 text-teal-700 text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-warm-400 mt-0.5">
                        ${planInfo.monthlyPrice}/month
                        {isOnTrial && " after trial ends"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-warm-500 mb-1">
                      <span>Follow-ups used this month</span>
                      <span>
                        {business ? 142 : "..."} / {planInfo.limits.followUpsPerMonth === Infinity ? "Unlimited" : planInfo.limits.followUpsPerMonth}
                      </span>
                    </div>
                    {planInfo.limits.followUpsPerMonth !== Infinity && (
                      <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (142 / planInfo.limits.followUpsPerMonth) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {hasStripe && (
                  <Button
                    variant="outline"
                    className="text-warm-600"
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                  >
                    {portalLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 mr-2" />
                    )}
                    Manage Billing in Stripe
                  </Button>
                )}
              </div>

              {/* Upgrade options */}
              {currentPlan !== "pro" && (
                <div className="bg-white rounded-xl border border-warm-100 shadow-sm p-6">
                  <h2 className="text-lg text-warm-900 font-[family-name:var(--font-display)] mb-4">
                    Upgrade Your Plan
                  </h2>
                  <p className="text-sm text-warm-400 mb-6">
                    Get more follow-ups, locations, and features.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {(["growth", "pro"] as const)
                      .filter((p) => {
                        const planOrder = { starter: 0, growth: 1, pro: 2 };
                        return (planOrder[p] || 0) > (planOrder[currentPlan as keyof typeof planOrder] || 0);
                      })
                      .map((planId) => {
                        const plan = PLAN_DETAILS[planId];
                        return (
                          <div
                            key={planId}
                            className={`rounded-xl border p-5 ${
                              planId === "growth"
                                ? "border-teal-200 bg-teal-50/50"
                                : "border-warm-200"
                            }`}
                          >
                            <h3 className="font-semibold text-warm-800">
                              {plan.name}
                            </h3>
                            <p className="text-2xl font-bold text-warm-900 mt-1">
                              ${plan.monthlyPrice}
                              <span className="text-sm font-normal text-warm-400">
                                /mo
                              </span>
                            </p>
                            <ul className="mt-3 space-y-1.5">
                              <li className="flex items-center gap-2 text-sm text-warm-600">
                                <Check className="w-3.5 h-3.5 text-teal-500" />
                                {plan.limits.followUpsPerMonth === Infinity
                                  ? "Unlimited follow-ups"
                                  : `${plan.limits.followUpsPerMonth.toLocaleString()} follow-ups/mo`}
                              </li>
                              <li className="flex items-center gap-2 text-sm text-warm-600">
                                <Check className="w-3.5 h-3.5 text-teal-500" />
                                {planId === "growth" ? "3 locations" : "Unlimited locations"}
                              </li>
                              <li className="flex items-center gap-2 text-sm text-warm-600">
                                <Check className="w-3.5 h-3.5 text-teal-500" />
                                {planId === "growth" ? "Up to 5 team members" : "Unlimited team members"}
                              </li>
                            </ul>
                            <Button
                              className={`w-full mt-4 ${
                                planId === "growth"
                                  ? "bg-teal-600 hover:bg-teal-700 text-white"
                                  : "bg-warm-800 hover:bg-warm-900 text-white"
                              }`}
                              onClick={() => handleUpgrade(planId)}
                              disabled={checkoutLoading === planId}
                            >
                              {checkoutLoading === planId ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : null}
                              Upgrade to {plan.name}
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "google" && (
            <div className="bg-white rounded-xl border border-warm-100 shadow-sm p-6">
              <h2 className="text-lg text-warm-900 font-[family-name:var(--font-display)] mb-6">
                Google Integration
              </h2>

              {profileForm.googleReviewUrl ? (
                <div className="bg-green-50 rounded-xl p-5 mb-6 border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-green-800">
                      Connected
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your Google Business Profile is linked. Review links are
                    automatically generated for your follow-up pages.
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 rounded-xl p-5 mb-6 border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm font-medium text-amber-800">
                      Not Connected
                    </span>
                  </div>
                  <p className="text-sm text-amber-700">
                    Add your Google Review URL below so clients can leave reviews directly.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1.5">
                  Google Review URL
                </label>
                <Input
                  value={profileForm.googleReviewUrl}
                  onChange={(e) => updateProfile("googleReviewUrl", e.target.value)}
                  placeholder="https://g.page/r/your-business/review"
                />
                <p className="text-xs text-warm-400 mt-1">
                  This is the link clients will see on their follow-up page.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-warm-100">
                <Button
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                >
                  {profileSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          )}

          {(activeTab === "locations" ||
            activeTab === "team" ||
            activeTab === "sms") && (
            <div className="bg-white rounded-xl border border-warm-100 shadow-sm p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-warm-400" />
              </div>
              <h3 className="text-lg text-warm-700 font-[family-name:var(--font-display)] mb-2">
                Coming Soon
              </h3>
              <p className="text-sm text-warm-400 max-w-sm mx-auto">
                {activeTab === "locations" &&
                  "Multi-location management is available on Growth and Pro plans."}
                {activeTab === "team" &&
                  "Team management is available on Growth and Pro plans."}
                {activeTab === "sms" &&
                  "Custom SMS settings including sender name and compliance options are coming soon."}
              </p>
              {(activeTab === "locations" || activeTab === "team") && (
                <Button
                  className="mt-4 bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => handleUpgrade("growth")}
                  disabled={checkoutLoading === "growth"}
                >
                  {checkoutLoading === "growth" && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Upgrade to Growth
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
