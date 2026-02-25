"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
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
  Sparkles,
  Pencil,
  Trash2,
  Plus,
  Phone,
  Mail,
  X,
} from "lucide-react";
import { PLANS, getPlanLimits } from "@/lib/stripe";

const tabs = [
  { id: "profile", label: "Business Profile", icon: Building2 },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "team", label: "Team", icon: Users },
  { id: "google", label: "Google", icon: LinkIcon },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "sms", label: "SMS Settings", icon: MessageSquare },
];

type PlanKey = keyof typeof PLANS;

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
  logoUrl: string;
}

interface LocationItem {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  _count: { followUps: number };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
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
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("monthly");
  const [usageData, setUsageData] = useState<{ used: number; limit: number } | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: "", type: "", email: "", phone: "",
    websiteUrl: "", bookingUrl: "",
    brandPrimaryColor: "#0D9488", brandSecondaryColor: "#0F766E",
    googleReviewUrl: "", logoUrl: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileValidation, setProfileValidation] = useState<Record<string, string>>({});
  const [autoBrandLoading, setAutoBrandLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const isValidUrl = (url: string) => !url.trim() || /^https?:\/\/.+\..+/.test(url.trim());
  const isValidHex = (hex: string) => /^#[0-9a-fA-F]{6}$/.test(hex);
  const isValidEmail = (email: string) => !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidGoogleUrl = (url: string) => !url.trim() || /google\.com|g\.page/i.test(url);

  // Session for role-based UI
  const { data: sessionData } = useSession();
  const currentUserRole = (sessionData?.user as Record<string, unknown> | undefined)?.role as string | undefined;
  const currentUserId = sessionData?.user?.id;

  // Locations state
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsFetched, setLocationsFetched] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [locationForm, setLocationForm] = useState({ name: "", address: "", phone: "" });
  const [locationSaving, setLocationSaving] = useState(false);
  const [locationAttempted, setLocationAttempted] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [editLocationForm, setEditLocationForm] = useState({ name: "", address: "", phone: "" });
  const [locationError, setLocationError] = useState<string | null>(null);

  // Team state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamFetched, setTeamFetched] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: "", email: "", password: "", role: "staff" });
  const [teamSaving, setTeamSaving] = useState(false);
  const [teamAttempted, setTeamAttempted] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [teamError, setTeamError] = useState<string | null>(null);

  // Lazy-fetch locations
  const fetchLocations = useCallback(async () => {
    setLocationsLoading(true);
    try {
      const res = await fetch("/api/locations");
      if (res.ok) {
        const data = await res.json();
        setLocations(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ } finally {
      setLocationsLoading(false);
      setLocationsFetched(true);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "locations" && !locationsFetched) fetchLocations();
  }, [activeTab, locationsFetched, fetchLocations]);

  // Lazy-fetch team
  const fetchTeam = useCallback(async () => {
    setTeamLoading(true);
    try {
      const res = await fetch("/api/team");
      if (res.ok) setTeamMembers(await res.json());
    } catch { /* ignore */ } finally {
      setTeamLoading(false);
      setTeamFetched(true);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "team" && !teamFetched) fetchTeam();
  }, [activeTab, teamFetched, fetchTeam]);

  const [usageLoaded, setUsageLoaded] = useState(false);
  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setUsageData({ used: data.followUps.used, limit: data.followUps.limit });
      })
      .catch(() => {})
      .finally(() => setUsageLoaded(true));
  }, []);

  useEffect(() => {
    // Wait until the session is authenticated before loading business data
    if (sessionData?.user === undefined) return;

    let retryCount = 0;
    let cancelled = false;

    function loadBusiness() {
      if (cancelled) return;
      fetch("/api/business")
        .then((r) => {
          if (!r.ok) throw new Error("Failed");
          return r.json();
        })
        .then((data) => {
          if (cancelled) return;
          // If we got the empty placeholder (session not yet ready), retry up to 6 times
          if (data._empty && retryCount < 6) {
            retryCount++;
            setTimeout(loadBusiness, 1000);
            return;
          }
          if (!data._empty) {
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
              logoUrl: (data.logoUrl as string) || "",
            });
          }
        })
        .catch(() => {});
    }

    loadBusiness();

    return () => { cancelled = true; };
  }, [sessionData]);

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileSaved(false);
    setProfileError("");
    // Validate fields
    const errors: Record<string, string> = {};
    if (profileForm.websiteUrl && !isValidUrl(profileForm.websiteUrl)) errors.websiteUrl = "Enter a valid URL (e.g. https://example.com)";
    if (profileForm.bookingUrl && !isValidUrl(profileForm.bookingUrl)) errors.bookingUrl = "Enter a valid URL (e.g. https://example.com)";
    if (profileForm.email && !isValidEmail(profileForm.email)) errors.email = "Enter a valid email address";
    if (profileForm.brandPrimaryColor && !isValidHex(profileForm.brandPrimaryColor)) errors.brandPrimaryColor = "Use hex format: #0D9488";
    if (profileForm.brandSecondaryColor && !isValidHex(profileForm.brandSecondaryColor)) errors.brandSecondaryColor = "Use hex format: #0F766E";
    if (profileForm.googleReviewUrl && !isValidGoogleUrl(profileForm.googleReviewUrl)) errors.googleReviewUrl = "Enter a valid Google Review URL (must contain google.com or g.page)";
    setProfileValidation(errors);
    if (Object.keys(errors).length > 0) {
      setProfileSaving(false);
      setProfileError("Please fix the validation errors below.");
      return;
    }
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
          brandPrimaryColor: profileForm.brandPrimaryColor,
          brandSecondaryColor: profileForm.brandSecondaryColor,
          logoUrl: profileForm.logoUrl,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBusiness(updated);
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error || `Failed to save changes (${res.status})`;
        setProfileError(errMsg.includes("Unauthorized") ? "Your session has expired. Please sign in again." : errMsg);
      }
    } catch {
      setProfileError("Failed to save changes. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAutoBrand = async () => {
    if (!profileForm.websiteUrl.trim()) return;
    setAutoBrandLoading(true);
    try {
      const res = await fetch("/api/business/auto-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: profileForm.websiteUrl, persist: true }),
      });
      if (res.ok) {
        // Refresh business data
        const bizRes = await fetch("/api/business");
        if (bizRes.ok) {
          const data = await bizRes.json();
          setBusiness(data);
          setProfileForm((prev) => ({
            ...prev,
            brandPrimaryColor: (data.brandPrimaryColor as string) || prev.brandPrimaryColor,
            brandSecondaryColor: (data.brandSecondaryColor as string) || prev.brandSecondaryColor,
            logoUrl: (data.logoUrl as string) || prev.logoUrl,
            phone: (data.phone as string) || prev.phone,
            googleReviewUrl: (data.googleReviewUrl as string) || prev.googleReviewUrl,
          }));
        }
      }
    } catch {
      // Auto-brand failed
    } finally {
      setAutoBrandLoading(false);
    }
  };

  const updateProfile = (field: keyof ProfileForm, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setProfileError("Invalid file type. Allowed: PNG, JPG, WebP, SVG");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("File too large. Maximum size is 2MB.");
      return;
    }

    setLogoUploading(true);
    setProfileError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/business/logo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.logoUrl) {
        setProfileForm((prev) => ({ ...prev, logoUrl: data.logoUrl }));
      } else {
        setProfileError(data.error || "Failed to upload logo");
      }
    } catch {
      setProfileError("Failed to upload logo");
    } finally {
      setLogoUploading(false);
      // Reset the input so re-selecting the same file triggers onChange
      e.target.value = "";
    }
  };

  // ── Location handlers ──────────────────────────────────
  const handleAddLocation = async () => {
    setLocationAttempted(true);
    if (!locationForm.name.trim()) return;
    setLocationSaving(true);
    setLocationError(null);
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationForm),
      });
      if (res.ok) {
        const created = await res.json();
        setLocations((prev) => [...prev, created]);
        setLocationForm({ name: "", address: "", phone: "" });
        setLocationAttempted(false);
        setShowAddLocation(false);
      } else {
        const data = await res.json();
        setLocationError(data.error || "Failed to add location");
      }
    } catch { setLocationError("Failed to add location"); } finally { setLocationSaving(false); }
  };

  const handleUpdateLocation = async (id: string) => {
    if (!editLocationForm.name.trim()) return;
    setLocationSaving(true);
    setLocationError(null);
    try {
      const res = await fetch(`/api/locations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editLocationForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setLocations((prev) => prev.map((l) => (l.id === id ? updated : l)));
        setEditingLocationId(null);
      } else {
        const data = await res.json();
        setLocationError(data.error || "Failed to update location");
      }
    } catch { setLocationError("Failed to update location"); } finally { setLocationSaving(false); }
  };

  const handleDeleteLocation = async (id: string) => {
    setLocationError(null);
    try {
      const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLocations((prev) => prev.filter((l) => l.id !== id));
      } else {
        const data = await res.json();
        setLocationError(data.error || "Failed to delete location");
      }
    } catch { setLocationError("Failed to delete location"); }
  };

  // ── Team handlers ─────────────────────────────────────
  const handleAddMember = async () => {
    setTeamAttempted(true);
    if (!teamForm.name.trim() || !teamForm.email.trim() || !teamForm.password || teamForm.password.length < 8) return;
    setTeamSaving(true);
    setTeamError(null);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamForm),
      });
      if (res.ok) {
        const created = await res.json();
        setTeamMembers((prev) => [...prev, created]);
        setTeamForm({ name: "", email: "", password: "", role: "staff" });
        setTeamAttempted(false);
        setShowAddMember(false);
      } else {
        const data = await res.json();
        setTeamError(data.error || "Failed to add member");
      }
    } catch { setTeamError("Failed to add member"); } finally { setTeamSaving(false); }
  };

  const handleUpdateMemberRole = async (id: string, role: string) => {
    setTeamError(null);
    try {
      const res = await fetch(`/api/team/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTeamMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
        setEditingMemberId(null);
      } else {
        const data = await res.json();
        setTeamError(data.error || "Failed to update role");
      }
    } catch { setTeamError("Failed to update role"); }
  };

  const handleDeleteMember = async (id: string) => {
    setTeamError(null);
    try {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTeamMembers((prev) => prev.filter((m) => m.id !== id));
      } else {
        const data = await res.json();
        setTeamError(data.error || "Failed to remove member");
      }
    } catch { setTeamError("Failed to remove member"); }
  };

  const currentPlan = ((business?.plan as string) || "starter") as PlanKey;
  const planInfo = PLANS[currentPlan] || PLANS.starter;
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

  const [checkoutError, setCheckoutError] = useState("");

  const handleUpgrade = async (planId: string) => {
    setCheckoutLoading(planId);
    setCheckoutError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval: billingInterval }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        const errMsg = data.error || `Could not start checkout (${res.status})`;
        setCheckoutError(errMsg.includes("Unauthorized") ? "Your session has expired. Please sign in again." : errMsg);
      }
    } catch {
      setCheckoutError("Could not start checkout. Please try again.");
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

              {profileError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                  {profileError}
                </div>
              )}

              <div className="space-y-5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden">
                    {profileForm.logoUrl ? (
                      <Image
                        src={profileForm.logoUrl}
                        alt="Business logo"
                        width={64}
                        height={64}
                        className="object-contain w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <span className="text-xl font-bold text-teal-700">
                        {profileForm.name.slice(0, 2).toUpperCase() || "BZ"}
                      </span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={logoUploading}
                      onClick={() => document.getElementById("logo-upload")?.click()}
                    >
                      {logoUploading ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Upload Logo"
                      )}
                    </Button>
                    <p className="text-xs text-warm-400 mt-1">
                      PNG, JPG, WebP, SVG up to 2MB
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="settings-business-name" className="block text-sm font-medium text-warm-700 mb-1.5">
                      Business Name
                    </label>
                    <Input id="settings-business-name" autoComplete="organization" placeholder="e.g. Smile Dental Care" value={profileForm.name} onChange={(e) => updateProfile("name", e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="settings-business-type" className="block text-sm font-medium text-warm-700 mb-1.5">
                      Business Type
                    </label>
                    <Input id="settings-business-type" placeholder="e.g. dentist, vet, salon" value={profileForm.type} onChange={(e) => updateProfile("type", e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="settings-email" className="block text-sm font-medium text-warm-700 mb-1.5">
                      Email
                    </label>
                    <Input id="settings-email" type="email" autoComplete="email" placeholder="you@yourbusiness.com" value={profileForm.email} onChange={(e) => updateProfile("email", e.target.value)} className={profileValidation.email ? "border-red-300" : ""} />
                    {profileValidation.email && <p className="text-xs text-red-500 mt-1">{profileValidation.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="settings-phone" className="block text-sm font-medium text-warm-700 mb-1.5">
                      Phone
                    </label>
                    <Input id="settings-phone" type="tel" autoComplete="tel" placeholder="(555) 123-4567" value={profileForm.phone} onChange={(e) => updateProfile("phone", e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="settings-website" className="block text-sm font-medium text-warm-700 mb-1.5">
                      Website
                    </label>
                    <Input id="settings-website" type="url" autoComplete="url" placeholder="https://yourbusiness.com" value={profileForm.websiteUrl} onChange={(e) => updateProfile("websiteUrl", e.target.value)} className={profileValidation.websiteUrl ? "border-red-300" : ""} />
                    {profileValidation.websiteUrl && <p className="text-xs text-red-500 mt-1">{profileValidation.websiteUrl}</p>}
                  </div>
                  <div>
                    <label htmlFor="settings-booking-url" className="block text-sm font-medium text-warm-700 mb-1.5">
                      Booking URL
                    </label>
                    <Input id="settings-booking-url" type="url" autoComplete="url" placeholder="https://calendly.com/your-link" value={profileForm.bookingUrl} onChange={(e) => updateProfile("bookingUrl", e.target.value)} className={profileValidation.bookingUrl ? "border-red-300" : ""} />
                    {profileValidation.bookingUrl && <p className="text-xs text-red-500 mt-1">{profileValidation.bookingUrl}</p>}
                  </div>
                </div>

                {/* Auto-detect branding button */}
                {profileForm.websiteUrl.trim() && (
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAutoBrand}
                      disabled={autoBrandLoading}
                      className="text-teal-600 border-teal-200 hover:bg-teal-50"
                    >
                      {autoBrandLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Auto-detect branding from website
                    </Button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1.5">
                    Brand Colors
                  </label>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-warm-400">Primary</label>
                      <input
                        type="color"
                        value={profileForm.brandPrimaryColor}
                        onChange={(e) => updateProfile("brandPrimaryColor", e.target.value)}
                        className="w-8 h-8 rounded-lg border border-warm-200 cursor-pointer p-0.5"
                      />
                      <Input value={profileForm.brandPrimaryColor} onChange={(e) => updateProfile("brandPrimaryColor", e.target.value)} className="w-28 text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-warm-400">Secondary</label>
                      <input
                        type="color"
                        value={profileForm.brandSecondaryColor}
                        onChange={(e) => updateProfile("brandSecondaryColor", e.target.value)}
                        className="w-8 h-8 rounded-lg border border-warm-200 cursor-pointer p-0.5"
                      />
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
                        {usageData ? usageData.used : usageLoaded ? "0" : "..."} / {planInfo.limits.followUpsPerMonth === Infinity ? "Unlimited" : planInfo.limits.followUpsPerMonth}
                      </span>
                    </div>
                    {planInfo.limits.followUpsPerMonth !== Infinity && (
                      <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((usageData?.used ?? 0) / planInfo.limits.followUpsPerMonth) * 100)}%` }}
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
                  <p className="text-sm text-warm-400 mb-4">
                    Get more follow-ups, locations, and features.
                  </p>

                  {checkoutError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                      {checkoutError}
                    </div>
                  )}

                  {/* Monthly / Annual toggle */}
                  <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-3 bg-warm-50 rounded-full p-1 border border-warm-200">
                      <button
                        onClick={() => setBillingInterval("monthly")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          billingInterval === "monthly"
                            ? "bg-teal-600 text-white"
                            : "text-warm-500 hover:text-warm-700"
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setBillingInterval("annual")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          billingInterval === "annual"
                            ? "bg-teal-600 text-white"
                            : "text-warm-500 hover:text-warm-700"
                        }`}
                      >
                        Annual
                        <span className="ml-1.5 text-xs opacity-80">Save 20%</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {(["growth", "pro"] as const)
                      .filter((p) => {
                        const planOrder = { starter: 0, growth: 1, pro: 2 };
                        return (planOrder[p] || 0) > (planOrder[currentPlan as keyof typeof planOrder] || 0);
                      })
                      .map((planId) => {
                        const plan = PLANS[planId];
                        const currentPlanFeatures = new Set<string>(PLANS[currentPlan]?.features || PLANS.starter.features);
                        const newFeatures = (plan.features as readonly string[]).filter((f) => !currentPlanFeatures.has(f));
                        const displayPrice = billingInterval === "annual" ? plan.annualPrice : plan.monthlyPrice;
                        return (
                          <div
                            key={planId}
                            className={`rounded-xl border p-5 ${
                              planId === "growth"
                                ? "border-teal-200 bg-teal-50/50"
                                : "border-warm-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-warm-800">
                                {plan.name}
                              </h3>
                              {billingInterval === "annual" && (
                                <Badge className="bg-green-50 text-green-700 text-[10px]">
                                  Save 20%
                                </Badge>
                              )}
                            </div>
                            <p className="text-2xl font-bold text-warm-900 mt-1">
                              ${displayPrice}
                              <span className="text-sm font-normal text-warm-400">
                                /mo
                              </span>
                            </p>
                            {billingInterval === "annual" && (
                              <p className="text-xs text-warm-400 mt-0.5">
                                Billed ${displayPrice * 12}/year
                              </p>
                            )}

                            {/* What you'll gain */}
                            {newFeatures.length > 0 && (
                              <div className="mt-3 mb-1">
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-teal-600 mb-1.5">
                                  You&apos;ll gain
                                </p>
                              </div>
                            )}
                            <ul className="space-y-1.5">
                              {newFeatures.map((feature: string) => (
                                <li key={feature} className="flex items-center gap-2 text-sm text-warm-700 font-medium">
                                  <Check className="w-3.5 h-3.5 text-teal-500" />
                                  {feature}
                                </li>
                              ))}
                            </ul>

                            {/* Everything in current plan */}
                            <p className="text-[10px] text-warm-400 mt-3 mb-1">
                              Plus everything in {PLANS[currentPlan]?.name || "Starter"}
                            </p>

                            <Button
                              className={`w-full mt-3 ${
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

              {profileForm.googleReviewUrl && /google\.com|g\.page/i.test(profileForm.googleReviewUrl) ? (
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
                <label htmlFor="settings-google-review-url" className="block text-sm font-medium text-warm-700 mb-1.5">
                  Google Review URL
                </label>
                <Input
                  id="settings-google-review-url"
                  type="url"
                  value={profileForm.googleReviewUrl}
                  onChange={(e) => updateProfile("googleReviewUrl", e.target.value)}
                  placeholder="https://g.page/r/your-business/review"
                  className={profileValidation.googleReviewUrl ? "border-red-300" : ""}
                />
                {profileValidation.googleReviewUrl ? (
                  <p className="text-xs text-red-500 mt-1.5">{profileValidation.googleReviewUrl}</p>
                ) : (
                  <p className="text-xs text-warm-400 mt-1.5">
                    This is the link clients will see on their follow-up page.
                  </p>
                )}
                <details className="mt-2">
                  <summary className="text-xs text-teal-600 cursor-pointer hover:text-teal-700">
                    How do I find my Google Review URL?
                  </summary>
                  <ol className="mt-2 text-xs text-warm-500 space-y-1 list-decimal list-inside">
                    <li>Search for your business on Google Maps</li>
                    <li>Click your business listing</li>
                    <li>Click &ldquo;Write a review&rdquo;</li>
                    <li>Copy the URL from your browser&apos;s address bar</li>
                  </ol>
                </details>
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

          {activeTab === "locations" && (
            <div className="bg-white rounded-xl border border-warm-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg text-warm-900 font-[family-name:var(--font-display)]">
                    Locations
                  </h2>
                  <p className="text-sm text-warm-400 mt-0.5">
                    {locations.length} of {planInfo.limits.locations === Infinity ? "unlimited" : planInfo.limits.locations} location{planInfo.limits.locations !== 1 ? "s" : ""}
                  </p>
                </div>
                {locations.length < planInfo.limits.locations ? (
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => { setShowAddLocation(true); setLocationError(null); }}
                    disabled={showAddLocation}
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Location
                  </Button>
                ) : (
                  <div className="text-right">
                    <p className="text-xs text-amber-600 font-medium">Location limit reached</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 text-teal-600 border-teal-200 hover:bg-teal-50 text-xs"
                      onClick={() => handleUpgrade("growth")}
                      disabled={checkoutLoading === "growth"}
                    >
                      Upgrade Plan
                    </Button>
                  </div>
                )}
              </div>

              {locationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-center justify-between">
                  {locationError}
                  <button onClick={() => setLocationError(null)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                </div>
              )}

              {locationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-warm-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Add location form */}
                  {showAddLocation && (
                    <div className="border border-teal-200 bg-teal-50/30 rounded-lg p-4">
                      <div className="grid sm:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-warm-600 mb-1">Name *</label>
                          <Input
                            placeholder="e.g. Main Office"
                            value={locationForm.name}
                            onChange={(e) => setLocationForm((f) => ({ ...f, name: e.target.value }))}
                            className={locationAttempted && !locationForm.name.trim() ? "border-red-300 focus-visible:ring-red-300" : ""}
                          />
                          {locationAttempted && !locationForm.name.trim() && (
                            <p className="text-xs text-red-500 mt-1">Location name is required</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-warm-600 mb-1">Address</label>
                          <Input
                            placeholder="123 Main St"
                            value={locationForm.address}
                            onChange={(e) => setLocationForm((f) => ({ ...f, address: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-warm-600 mb-1">Phone</label>
                          <Input
                            placeholder="(555) 123-4567"
                            value={locationForm.phone}
                            onChange={(e) => setLocationForm((f) => ({ ...f, phone: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                          onClick={handleAddLocation}
                          disabled={locationSaving}
                        >
                          {locationSaving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setShowAddLocation(false); setLocationForm({ name: "", address: "", phone: "" }); setLocationError(null); setLocationAttempted(false); }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Location cards */}
                  {locations.map((loc) => (
                    <div key={loc.id} className="border border-warm-100 rounded-lg p-4">
                      {editingLocationId === loc.id ? (
                        <>
                          <div className="grid sm:grid-cols-3 gap-3 mb-3">
                            <div>
                              <label className="block text-xs font-medium text-warm-600 mb-1">Name *</label>
                              <Input
                                value={editLocationForm.name}
                                onChange={(e) => setEditLocationForm((f) => ({ ...f, name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-warm-600 mb-1">Address</label>
                              <Input
                                value={editLocationForm.address}
                                onChange={(e) => setEditLocationForm((f) => ({ ...f, address: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-warm-600 mb-1">Phone</label>
                              <Input
                                value={editLocationForm.phone}
                                onChange={(e) => setEditLocationForm((f) => ({ ...f, phone: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-teal-600 hover:bg-teal-700 text-white"
                              onClick={() => handleUpdateLocation(loc.id)}
                              disabled={locationSaving || !editLocationForm.name.trim()}
                            >
                              {locationSaving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
                              Save
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingLocationId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-warm-800">{loc.name}</h3>
                              <Badge className="bg-warm-100 text-warm-500 text-[10px]">
                                {loc._count.followUps} follow-up{loc._count.followUps !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                            {loc.address && (
                              <p className="text-sm text-warm-400 mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {loc.address}
                              </p>
                            )}
                            {loc.phone && (
                              <p className="text-sm text-warm-400 mt-0.5 flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" /> {loc.phone}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setEditingLocationId(loc.id);
                                setEditLocationForm({ name: loc.name, address: loc.address || "", phone: loc.phone || "" });
                                setLocationError(null);
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteLocation(loc.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {locations.length === 0 && !showAddLocation && (
                    <div className="text-center py-8">
                      <MapPin className="w-8 h-8 text-warm-300 mx-auto mb-2" />
                      <p className="text-sm text-warm-400">No locations yet. Add your first location.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "team" && (
            <div className="bg-white rounded-xl border border-warm-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg text-warm-900 font-[family-name:var(--font-display)]">
                    Team Members
                  </h2>
                  <p className="text-sm text-warm-400 mt-0.5">
                    {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""}{planInfo.limits.teamMembers !== Infinity && ` (${planInfo.limits.teamMembers} included in plan)`}
                  </p>
                </div>
                {(currentUserRole === "owner" || currentUserRole === "admin") && (
                  teamMembers.length < planInfo.limits.teamMembers ? (
                    <Button
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                      onClick={() => { setShowAddMember(true); setTeamError(null); }}
                      disabled={showAddMember}
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Invite Member
                    </Button>
                  ) : (
                    <div className="text-right">
                      <p className="text-xs text-amber-600 font-medium">Team limit reached</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-1 text-teal-600 border-teal-200 hover:bg-teal-50 text-xs"
                        onClick={() => handleUpgrade("growth")}
                        disabled={checkoutLoading === "growth"}
                      >
                        Upgrade Plan
                      </Button>
                    </div>
                  )
                )}
              </div>

              {teamError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-center justify-between">
                  {teamError}
                  <button onClick={() => setTeamError(null)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                </div>
              )}

              {currentUserRole === "staff" && (
                <div className="mb-4 p-3 bg-warm-50 border border-warm-100 rounded-lg text-sm text-warm-500">
                  Contact your admin to manage team members.
                </div>
              )}

              {teamLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-warm-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Add member form */}
                  {showAddMember && (
                    <div className="border border-teal-200 bg-teal-50/30 rounded-lg p-4">
                      <div className="grid sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-warm-600 mb-1">Name *</label>
                          <Input
                            placeholder="Full name"
                            value={teamForm.name}
                            onChange={(e) => setTeamForm((f) => ({ ...f, name: e.target.value }))}
                            autoComplete="off"
                            className={teamAttempted && !teamForm.name.trim() ? "border-red-300 focus-visible:ring-red-300" : ""}
                          />
                          {teamAttempted && !teamForm.name.trim() && (
                            <p className="text-xs text-red-500 mt-1">Name is required</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-warm-600 mb-1">Email *</label>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            value={teamForm.email}
                            onChange={(e) => setTeamForm((f) => ({ ...f, email: e.target.value }))}
                            autoComplete="new-email"
                            className={teamAttempted && !teamForm.email.trim() ? "border-red-300 focus-visible:ring-red-300" : ""}
                          />
                          {teamAttempted && !teamForm.email.trim() && (
                            <p className="text-xs text-red-500 mt-1">Email is required</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-warm-600 mb-1">Temporary Password * (min 8 chars)</label>
                          <Input
                            type="password"
                            placeholder="Min 8 characters"
                            value={teamForm.password}
                            onChange={(e) => setTeamForm((f) => ({ ...f, password: e.target.value }))}
                            autoComplete="new-password"
                            className={teamAttempted && teamForm.password.length < 8 ? "border-red-300 focus-visible:ring-red-300" : ""}
                          />
                          {teamAttempted && !teamForm.password && (
                            <p className="text-xs text-red-500 mt-1">Password is required</p>
                          )}
                          {teamAttempted && teamForm.password && teamForm.password.length < 8 && (
                            <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-warm-600 mb-1">Role</label>
                          <select
                            value={teamForm.role}
                            onChange={(e) => setTeamForm((f) => ({ ...f, role: e.target.value }))}
                            className="w-full h-9 rounded-md border border-warm-200 bg-white px-3 text-sm text-warm-700"
                          >
                            <option value="staff">Staff</option>
                            {currentUserRole === "owner" && <option value="admin">Admin</option>}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                          onClick={handleAddMember}
                          disabled={teamSaving}
                        >
                          {teamSaving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setShowAddMember(false); setTeamForm({ name: "", email: "", password: "", role: "staff" }); setTeamError(null); setTeamAttempted(false); }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Team member rows */}
                  {teamMembers.map((member) => {
                    const isOwner = member.role === "owner";
                    const isSelf = member.id === currentUserId;
                    const canManage = (currentUserRole === "owner" || currentUserRole === "admin") && !isOwner;
                    const canDelete = canManage && !isSelf && !(currentUserRole === "admin" && member.role === "admin");
                    const initials = member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

                    return (
                      <div key={member.id} className="border border-warm-100 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${
                            isOwner ? "bg-teal-100 text-teal-700" : member.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-warm-100 text-warm-600"
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-warm-800 text-sm">{member.name}</span>
                              <Badge className={`text-[10px] ${
                                isOwner ? "bg-teal-50 text-teal-700" : member.role === "admin" ? "bg-blue-50 text-blue-700" : "bg-warm-100 text-warm-500"
                              }`}>
                                {member.role}
                              </Badge>
                              {isSelf && <span className="text-[10px] text-warm-400">(you)</span>}
                            </div>
                            <p className="text-xs text-warm-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {member.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canManage && editingMemberId === member.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                defaultValue={member.role}
                                onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                                className="h-8 rounded-md border border-warm-200 bg-white px-2 text-xs text-warm-700"
                              >
                                <option value="staff">Staff</option>
                                {currentUserRole === "owner" && <option value="admin">Admin</option>}
                              </select>
                              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setEditingMemberId(null)}>
                                Cancel
                              </Button>
                            </div>
                          ) : canManage ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => { setEditingMemberId(member.id); setTeamError(null); }}
                              >
                                Change Role
                              </Button>
                              {canDelete && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteMember(member.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}

                  {teamMembers.length === 0 && !showAddMember && (
                    <div className="text-center py-8">
                      <Users className="w-8 h-8 text-warm-300 mx-auto mb-2" />
                      <p className="text-sm text-warm-400">No team members found.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "sms" && (
            <div className="bg-white rounded-xl border border-warm-100 shadow-sm p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-warm-400" />
              </div>
              <h3 className="text-lg text-warm-700 font-[family-name:var(--font-display)] mb-2">
                Coming Soon
              </h3>
              <p className="text-sm text-warm-400 max-w-sm mx-auto">
                Custom SMS settings including sender name and compliance options are coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
