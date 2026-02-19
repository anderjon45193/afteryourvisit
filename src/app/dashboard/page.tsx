"use client";

import { useState, useEffect } from "react";
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
  Plus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OverviewData {
  totalSent: number;
  openRate: number;
  reviewClicks: number;
  reviewRate: number;
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function parseTrend(trend: string): { value: string; up: boolean } {
  const up = trend.startsWith("+") && trend !== "+0%";
  return { value: trend, up };
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
  const userName = session?.user?.name || "there";

  const [greeting, setGreeting] = useState("");
  const [today, setToday] = useState("");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [recentFollowUps, setRecentFollowUps] = useState<FollowUpItem[]>([]);

  // Compute date-dependent values only on the client to avoid hydration mismatch
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
  }, []);

  useEffect(() => {
    fetch("/api/analytics/overview")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then(setOverview)
      .catch(() => {});

    fetch("/api/followups?limit=6")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => setRecentFollowUps(data.data || []))
      .catch(() => {});
  }, []);

  const stats = overview?.trends
    ? [
        {
          label: "Follow-ups Sent",
          value: String(overview.totalSent),
          trend: parseTrend(overview.trends.sent),
          icon: Send,
          iconBg: "bg-teal-50",
          iconColor: "text-teal-600",
        },
        {
          label: "Open Rate",
          value: `${overview.openRate}%`,
          trend: parseTrend(overview.trends.openRate),
          icon: Eye,
          iconBg: "bg-blue-50",
          iconColor: "text-blue-600",
        },
        {
          label: "Review Clicks",
          value: String(overview.reviewClicks),
          trend: parseTrend(overview.trends.reviewClicks),
          icon: Star,
          iconBg: "bg-amber-50",
          iconColor: "text-amber-600",
        },
        {
          label: "Review Rate",
          value: `${overview.reviewRate}%`,
          trend: parseTrend(overview.trends.reviews),
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
          {greeting ? `${greeting}, ` : ""}{userName}
        </h1>
        <p className="text-warm-400 mt-1">{today}</p>
      </div>

      {/* First-run banner */}
      {overview && overview.totalSent === 0 && (
        <Link href="/dashboard/welcome">
          <div className="mb-6 bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-center justify-between hover:bg-teal-100/50 transition-colors">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <div>
                <p className="text-sm font-medium text-teal-800">
                  Welcome! Ready to send your first follow-up?
                </p>
                <p className="text-xs text-teal-600">
                  Take a quick tour and send yourself a test.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-teal-500" />
          </div>
        </Link>
      )}

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
                  <span
                    className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                      stat.trend.up ? "text-green-600" : "text-warm-400"
                    }`}
                  >
                    {stat.trend.up ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {stat.trend.value}
                  </span>
                </div>
                <p className="text-2xl font-bold text-warm-900">{stat.value}</p>
                <p className="text-xs text-warm-400 mt-1">{stat.label}</p>
              </motion.div>
            ))
          : // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-warm-50">
                <th className="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-5 py-3">
                  Client
                </th>
                <th className="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-5 py-3">
                  Phone
                </th>
                <th className="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-5 py-3">
                  Template
                </th>
                <th className="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-5 py-3">
                  Sent
                </th>
                <th className="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-5 py-3">
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
                    className="border-b border-warm-50 last:border-0 hover:bg-warm-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-warm-800">
                        {fu.clientFirstName}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-warm-500">{fu.clientPhone}</span>
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
              <div key={fu.id} className="p-4 hover:bg-warm-50/50 transition-colors">
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

        {recentFollowUps.length === 0 && (
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

      {/* Floating Action Button */}
      <Link href="/dashboard/send" className="fixed bottom-20 lg:bottom-8 right-6 z-30">
        <Button
          size="lg"
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-xl hover:shadow-2xl px-6 py-6 text-sm font-semibold hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Follow-Up
        </Button>
      </Link>
    </>
  );
}
