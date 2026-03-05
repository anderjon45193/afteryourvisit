"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Send,
  Eye,
  Star,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ArrowRight,
  Info,
  X,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaskedPhone } from "@/components/shared/masked-phone";

type Range = "7d" | "30d" | "90d" | "all";

const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
];

const RANGE_CONTEXT: Record<Range, string> = {
  "7d": "this week",
  "30d": "this month",
  "90d": "last 90 days",
  all: "all time",
};

interface OverviewData {
  totalSent: number;
  totalSentAllTime: number;
  openRate: number;
  reviewClicks: number;
  reviewRate: number;
  plan: string;
  trialEndsAt: string | null;
  trends: {
    sent: string;
    openRate: string;
    reviewClicks: string;
    reviews: string;
  };
}

interface FollowUpItem {
  id: string;
  clientFirstName: string;
  clientPhone: string;
  templateName: string;
  createdAt: string;
  status: "sent" | "opened" | "reviewed";
}

const statusConfig = {
  sent: { label: "Sent", className: "bg-warm-100 text-warm-600" },
  opened: { label: "Opened", className: "bg-blue-50 text-blue-700" },
  reviewed: { label: "Reviewed", className: "bg-green-50 text-green-700" },
};

const STAT_TOOLTIPS: Record<string, string> = {
  "Follow-ups Sent": "Total SMS follow-ups sent in the selected period",
  "Open Rate": "Percentage of clients who opened their follow-up page",
  "Review Clicks": "Number of clients who clicked the review button",
  "Review Rate": "Percentage of follow-ups that led to a review click",
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function parseTrend(trend: string, currentValue: number): { value: string; up: boolean; neutral: boolean; noData: boolean } {
  const noData = currentValue === 0 && (trend === "-100%" || trend === "0%");
  const neutral = noData || trend === "+0%" || trend === "0%" || trend === "-0%";
  const up = trend.startsWith("+") && !neutral;
  return { value: noData ? "—" : trend, up, neutral, noData };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${time}`;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "";

  const [greeting, setGreeting] = useState("");
  const [today, setToday] = useState("");
  const [range, setRange] = useState<Range>("30d");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [overviewError, setOverviewError] = useState(false);
  const [recentFollowUps, setRecentFollowUps] = useState<FollowUpItem[]>([]);
  const [followUpsLoaded, setFollowUpsLoaded] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setGreeting(getGreeting());
    setToday(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
    setBannerDismissed(localStorage.getItem("ayv-banner-dismissed") === "true");
  }, []);

  const fetchOverview = useCallback((r: Range) => {
    setOverviewError(false);
    fetch(`/api/analytics/overview?range=${r}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        setOverview(data);
        setLastUpdated(new Date());
      })
      .catch(() => setOverviewError(true));
  }, []);

  useEffect(() => {
    fetchOverview(range);
  }, [range, fetchOverview]);

  useEffect(() => {
    fetch("/api/followups?limit=6")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => setRecentFollowUps(data.data || []))
      .catch(() => {})
      .finally(() => setFollowUpsLoaded(true));
  }, []);

  const dismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem("ayv-banner-dismissed", "true");
  };

  const openFollowUp = (id: string) => {
    window.open(`/v/${id}`, "_blank");
  };

  const stats = overview?.trends
    ? [
        {
          label: "Follow-ups Sent",
          value: String(overview.totalSent),
          trend: parseTrend(overview.trends.sent, overview.totalSent),
          icon: Send,
          iconBg: "bg-teal-50",
          iconColor: "text-teal-600",
        },
        {
          label: "Open Rate",
          value: `${overview.openRate}%`,
          trend: parseTrend(overview.trends.openRate, overview.openRate),
          icon: Eye,
          iconBg: "bg-blue-50",
          iconColor: "text-blue-600",
        },
        {
          label: "Review Clicks",
          value: String(overview.reviewClicks),
          trend: parseTrend(overview.trends.reviewClicks, overview.reviewClicks),
          icon: Star,
          iconBg: "bg-amber-50",
          iconColor: "text-amber-600",
        },
        {
          label: "Review Rate",
          value: `${overview.reviewRate}%`,
          trend: parseTrend(overview.trends.reviews, overview.reviewRate),
          icon: TrendingUp,
          iconBg: "bg-green-50",
          iconColor: "text-green-600",
        },
      ]
    : null;

  return (
    <>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl text-warm-900">
          {greeting ? `${greeting}${userName ? `, ${userName}` : ""}` : ""}
        </h1>
        <p className="text-warm-400 mt-1">{today}</p>
      </div>

      {/* First-run banner — only show if user has zero follow-ups ever AND hasn't dismissed */}
      {overview && overview.totalSentAllTime === 0 && !bannerDismissed && (
        <div className="mb-6 bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-center justify-between">
          <Link href="/dashboard/welcome" className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <div>
              <p className="text-sm font-medium text-teal-800">
                Welcome! Ready to send your first follow-up?
              </p>
              <p className="text-xs text-teal-600">
                Take a quick tour and send yourself a test.
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-teal-500" />
            <button
              onClick={(e) => {
                e.preventDefault();
                dismissBanner();
              }}
              className="p-1 rounded-md hover:bg-teal-100 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4 text-teal-400" />
            </button>
          </div>
        </div>
      )}

      {/* Trial expiration banner */}
      {overview && overview.plan === "trial" && overview.trialEndsAt && (() => {
        const daysLeft = Math.ceil((new Date(overview.trialEndsAt).getTime() - Date.now()) / 86400000);
        if (daysLeft > 7 || daysLeft < 0) return null;
        return (
          <div className={`mb-6 rounded-xl p-4 flex items-center justify-between ${
            daysLeft <= 2 ? "bg-red-50 border border-red-100" : "bg-amber-50 border border-amber-100"
          }`}>
            <div className="flex items-center gap-3">
              <Clock className={`w-5 h-5 ${daysLeft <= 2 ? "text-red-500" : "text-amber-500"}`} />
              <div>
                <p className={`text-sm font-medium ${daysLeft <= 2 ? "text-red-800" : "text-amber-800"}`}>
                  {daysLeft <= 0 ? "Your trial has expired" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left in your trial`}
                </p>
                <p className={`text-xs ${daysLeft <= 2 ? "text-red-600" : "text-amber-600"}`}>
                  Upgrade to keep sending follow-ups and generating reviews.
                </p>
              </div>
            </div>
            <Link href="/dashboard/settings?tab=billing">
              <Button size="sm" className={`${daysLeft <= 2 ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"} text-white`}>
                Upgrade Now
              </Button>
            </Link>
          </div>
        );
      })()}

      {/* Time range selector + last updated */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              aria-pressed={range === opt.value}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                range === opt.value
                  ? "bg-teal-600 text-white"
                  : "bg-warm-100 text-warm-500 hover:bg-warm-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-[11px] text-warm-300">
            <RefreshCw className="w-3 h-3" />
            Updated {lastUpdated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats
          ? stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white rounded-xl p-5 border border-warm-100 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  {!stat.trend.noData && (
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                        stat.trend.up ? "text-green-600" : "text-warm-400"
                      }`}
                    >
                      {stat.trend.neutral ? null : stat.trend.up ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {stat.trend.value}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-warm-900">{stat.value}</p>
                <p className="text-xs text-warm-400 mt-1 flex items-center gap-1">
                  {stat.label}
                  <span title={STAT_TOOLTIPS[stat.label]}>
                    <Info className="w-3 h-3 text-warm-300" />
                  </span>
                </p>
                {range !== "all" && (
                  <p className="text-[10px] text-warm-300 mt-0.5">{RANGE_CONTEXT[range]}</p>
                )}
              </motion.div>
            ))
          : overviewError
            ? [
                { label: "Follow-ups Sent", icon: Send, iconBg: "bg-teal-50", iconColor: "text-teal-600" },
                { label: "Open Rate", icon: Eye, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
                { label: "Review Clicks", icon: Star, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
                { label: "Review Rate", icon: TrendingUp, iconBg: "bg-green-50", iconColor: "text-green-600" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-xl p-5 border border-warm-100 shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
                    <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                  <p className="text-2xl font-bold text-warm-300">—</p>
                  <p className="text-xs text-warm-400 mt-1">{card.label}</p>
                </div>
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 border border-warm-100 shadow-sm animate-pulse"
                >
                  <div className="w-10 h-10 rounded-lg bg-warm-100 mb-3" />
                  <div className="h-7 bg-warm-100 rounded w-16 mb-2" />
                  <div className="h-3 bg-warm-50 rounded w-24" />
                </div>
              ))}
      </div>

      {/* Recent Follow-Ups */}
      <div className="bg-white rounded-xl border border-warm-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-warm-100">
          <h2 className="text-lg text-warm-900 font-[family-name:var(--font-display)]">
            Recent Follow-Ups
          </h2>
          <Link href="/dashboard/followups">
            <Button variant="ghost" size="sm" className="text-teal-600 text-xs">
              View All
            </Button>
          </Link>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full" aria-label="Recent follow-ups">
            <thead>
              <tr className="border-b border-warm-50">
                <th scope="col" className="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-5 py-3">
                  Client
                </th>
                <th scope="col" className="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-5 py-3">
                  Phone
                </th>
                <th scope="col" className="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-5 py-3">
                  Template
                </th>
                <th scope="col" className="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-5 py-3">
                  Sent
                </th>
                <th scope="col" className="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-5 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentFollowUps.map((fu, i) => {
                const status = statusConfig[fu.status];
                return (
                  <motion.tr
                    key={fu.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="border-b border-warm-50 last:border-0 hover:bg-warm-100/70 transition-colors cursor-pointer"
                    role="link"
                    tabIndex={0}
                    onClick={() => openFollowUp(fu.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") openFollowUp(fu.id);
                    }}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-warm-800">
                        {fu.clientFirstName}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-warm-500" onClick={(e) => e.stopPropagation()}>
                      <MaskedPhone phone={fu.clientPhone} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-warm-500">
                        {fu.templateName}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-warm-400">{formatDate(fu.createdAt)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant="secondary"
                        className={`${status.className} text-xs font-medium`}
                      >
                        {fu.status === "reviewed" && "⭐ "}
                        {status.label}
                      </Badge>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden divide-y divide-warm-50">
          {recentFollowUps.map((fu) => {
            const status = statusConfig[fu.status];
            return (
              <div
                key={fu.id}
                className="p-4 hover:bg-warm-100/70 transition-colors cursor-pointer"
                role="link"
                tabIndex={0}
                onClick={() => openFollowUp(fu.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") openFollowUp(fu.id);
                }}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-medium text-warm-800">
                    {fu.clientFirstName}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`${status.className} text-[10px] font-medium`}
                  >
                    {fu.status === "reviewed" && "⭐ "}
                    {status.label}
                  </Badge>
                </div>
                <p className="text-xs text-warm-400">{fu.templateName}</p>
                <p className="text-xs text-warm-300 mt-0.5">{formatDate(fu.createdAt)}</p>
              </div>
            );
          })}
        </div>

        {recentFollowUps.length === 0 && followUpsLoaded && (
          <div className="p-12 text-center">
            <Send className="w-8 h-8 text-warm-200 mx-auto mb-3" />
            <p className="text-warm-400 text-sm">No follow-ups yet.</p>
            <Link href="/dashboard/send">
              <Button className="mt-3 bg-teal-600 hover:bg-teal-700 text-white" size="sm">
                Send Your First Follow-Up
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Spacer for FAB */}
      <div className="h-20 lg:h-0" />
    </>
  );
}
