"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Eye,
  Star,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface OverviewData {
  totalSent: number;
  openRate: number;
  reviewClicks: number;
  reviewRate: number;
  bookingClicks: number;
  trends: {
    sent: string;
    openRate: string;
    reviewClicks: string;
    reviews: string;
  };
}

interface TimelineDay {
  date: string;
  day: string;
  sent: number;
  opened: number;
  reviewed: number;
}

function parseTrend(trend: string): { value: string; up: boolean } {
  const up = trend.startsWith("+") && trend !== "+0%";
  return { value: trend, up };
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [timeline, setTimeline] = useState<TimelineDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/overview").then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      }),
      fetch("/api/analytics/timeline").then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      }),
    ])
      .then(([overviewData, timelineData]) => {
        if (overviewData?.trends) setOverview(overviewData);
        if (Array.isArray(timelineData)) setTimeline(timelineData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxSent = Math.max(...timeline.map((d) => d.sent), 1);

  const summaryStats = overview
    ? [
        {
          label: "Total Sent",
          value: String(overview.totalSent),
          trend: parseTrend(overview.trends.sent),
          subtext: "this month",
          icon: Send,
          color: "text-teal-600",
          bg: "bg-teal-50",
        },
        {
          label: "Avg Open Rate",
          value: `${overview.openRate}%`,
          trend: parseTrend(overview.trends.openRate),
          subtext: "vs last month",
          icon: Eye,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          label: "Review Click Rate",
          value: `${overview.reviewRate}%`,
          trend: parseTrend(overview.trends.reviewClicks),
          subtext: "of sent",
          icon: Star,
          color: "text-amber-600",
          bg: "bg-amber-50",
        },
        {
          label: "Review Clicks",
          value: String(overview.reviewClicks),
          trend: parseTrend(overview.trends.reviews),
          subtext: "this month",
          icon: TrendingUp,
          color: "text-green-600",
          bg: "bg-green-50",
        },
      ]
    : null;

  // Funnel data derived from overview
  const funnelSteps = overview
    ? (() => {
        const sent = overview.totalSent;
        const delivered = sent; // Approximate — sent ≈ delivered
        const opened = sent > 0 ? Math.round((overview.openRate / 100) * sent) : 0;
        const reviewClicked = overview.reviewClicks;
        return [
          { label: "Sent", value: sent, color: "bg-teal-500", percent: 100 },
          {
            label: "Delivered",
            value: delivered,
            color: "bg-teal-400",
            percent: sent > 0 ? Math.round((delivered / sent) * 100) : 0,
          },
          {
            label: "Opened",
            value: opened,
            color: "bg-blue-400",
            percent: sent > 0 ? overview.openRate : 0,
          },
          {
            label: "Review Clicked",
            value: reviewClicked,
            color: "bg-amber-400",
            percent: sent > 0 ? overview.reviewRate : 0,
          },
        ];
      })()
    : null;

  if (loading) {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl text-warm-900">Analytics</h1>
          <p className="text-sm text-warm-400 mt-1">Track your follow-up performance</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-warm-100 shadow-sm animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-warm-100 mb-3" />
              <div className="h-7 bg-warm-100 rounded w-16 mb-2" />
              <div className="h-3 bg-warm-50 rounded w-24" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-warm-100 shadow-sm p-6 mb-8 animate-pulse">
          <div className="h-5 bg-warm-100 rounded w-32 mb-6" />
          <div className="h-48 bg-warm-50 rounded" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl text-warm-900">Analytics</h1>
        <p className="text-sm text-warm-400 mt-1">
          Track your follow-up performance
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryStats?.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-white rounded-xl p-5 border border-warm-100 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-warm-900">{stat.value}</p>
            <p className="text-xs text-warm-400 mt-0.5">{stat.label}</p>
            <p className="text-xs text-warm-300 mt-0.5 flex items-center gap-0.5">
              {stat.trend.up ? (
                <ArrowUpRight className="w-3 h-3 text-green-500" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-warm-300" />
              )}
              {stat.trend.value} {stat.subtext}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Weekly chart (CSS-based) */}
      <div className="bg-white rounded-xl border border-warm-100 shadow-sm p-6 mb-8">
        <h2 className="text-lg text-warm-900 font-[family-name:var(--font-display)] mb-6">
          This Week
        </h2>

        {timeline.length > 0 ? (
          <>
            <div className="flex items-end justify-between gap-3 h-48">
              {timeline.map((day, i) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  style={{ transformOrigin: "bottom" }}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full flex flex-col gap-1 items-center" style={{ height: "160px", justifyContent: "flex-end" }}>
                    <div
                      className="w-full max-w-[40px] bg-teal-200 rounded-t-md transition-all"
                      style={{
                        height: `${(day.sent / maxSent) * 100}%`,
                        minHeight: day.sent > 0 ? "4px" : "0px",
                      }}
                    />
                  </div>
                  <span className="text-xs text-warm-400 font-medium">
                    {day.day}
                  </span>
                  <span className="text-xs text-warm-600 font-semibold">
                    {day.sent}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-warm-50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-teal-200" />
                <span className="text-xs text-warm-400">Sent</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm text-warm-400">No data for this week yet.</p>
          </div>
        )}
      </div>

      {/* Funnel */}
      <div className="bg-white rounded-xl border border-warm-100 shadow-sm p-6">
        <h2 className="text-lg text-warm-900 font-[family-name:var(--font-display)] mb-6">
          Follow-Up Funnel (This Month)
        </h2>

        {funnelSteps && overview && overview.totalSent > 0 ? (
          <div className="space-y-4">
            {funnelSteps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-warm-700">
                    {step.label}
                  </span>
                  <span className="text-sm text-warm-500">
                    {step.value}{" "}
                    <span className="text-warm-300">({step.percent}%)</span>
                  </span>
                </div>
                <div className="h-3 bg-warm-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${step.percent}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                    className={`h-full ${step.color} rounded-full`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-warm-400">
              Send your first follow-ups to see funnel data here.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
