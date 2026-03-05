"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Eye,
  Star,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";

type Range = "7d" | "30d" | "90d" | "all";

const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
];

const RANGE_CONTEXT: Record<Range, string> = {
  "7d": "vs previous 7 days",
  "30d": "vs previous 30 days",
  "90d": "vs previous 90 days",
  all: "all time",
};

const STAT_TOOLTIPS: Record<string, string> = {
  "Total Sent": "Total SMS follow-ups sent in the selected period",
  "Avg Open Rate": "Percentage of clients who opened their follow-up page",
  "Review Click Rate": "Percentage of follow-ups that led to a review click",
  "Review Clicks": "Total number of review button clicks",
};

interface OverviewData {
  totalSent: number;
  totalSentAllTime: number;
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

function parseTrend(trend: string, currentValue: number): { value: string; up: boolean; neutral: boolean; noData: boolean } {
  const noData = currentValue === 0 && (trend === "-100%" || trend === "0%");
  const neutral = noData || trend === "+0%" || trend === "0%" || trend === "-0%";
  const up = trend.startsWith("+") && !neutral;
  return { value: noData ? "—" : trend, up, neutral, noData };
}

// Timeline range for chart only (no "all" option)
type TimelineRange = "7d" | "30d" | "90d";

const CHART_LABELS: Record<TimelineRange, string> = {
  "7d": "This Week",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days",
};

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("30d");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [timeline, setTimeline] = useState<TimelineDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const fetchData = useCallback((r: Range) => {
    setLoading(true);
    setLoadError(false);
    const timelineRange: TimelineRange = r === "all" ? "30d" : r;
    Promise.all([
      fetch(`/api/analytics/overview?range=${r}`).then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      }),
      fetch(`/api/analytics/timeline?range=${timelineRange}`).then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      }),
    ])
      .then(([overviewData, timelineData]) => {
        if (overviewData?.trends) setOverview(overviewData);
        if (Array.isArray(timelineData)) setTimeline(timelineData);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  const maxVal = Math.max(...timeline.map((d) => Math.max(d.sent, d.opened, d.reviewed)), 1);
  const timelineRange: TimelineRange = range === "all" ? "30d" : range;

  const summaryStats = overview
    ? [
        {
          label: "Total Sent",
          value: String(overview.totalSent),
          trend: parseTrend(overview.trends.sent, overview.totalSent),
          subtext: RANGE_CONTEXT[range],
          icon: Send,
          color: "text-teal-600",
          bg: "bg-teal-50",
        },
        {
          label: "Avg Open Rate",
          value: `${overview.openRate}%`,
          trend: parseTrend(overview.trends.openRate, overview.openRate),
          subtext: RANGE_CONTEXT[range],
          icon: Eye,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          label: "Review Click Rate",
          value: `${overview.reviewRate}%`,
          trend: parseTrend(overview.trends.reviewClicks, overview.reviewRate),
          subtext: "of sent",
          icon: Star,
          color: "text-amber-600",
          bg: "bg-amber-50",
        },
        {
          label: "Review Clicks",
          value: String(overview.reviewClicks),
          trend: parseTrend(overview.trends.reviews, overview.reviewClicks),
          subtext: RANGE_CONTEXT[range],
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
        const delivered = sent;
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
      <Breadcrumbs items={[{ label: "Analytics" }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl text-warm-900">Analytics</h1>
          <p className="text-sm text-warm-400 mt-1">
            Track your follow-up performance
          </p>
        </div>
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
      </div>

      {loadError && !overview && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
          Unable to load analytics data. Please try refreshing the page.
        </div>
      )}

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
            <p className="text-xs text-warm-400 mt-0.5 flex items-center gap-1">
              {stat.label}
              <span title={STAT_TOOLTIPS[stat.label]}>
                <Info className="w-3 h-3 text-warm-300" />
              </span>
            </p>
            {!stat.trend.noData && (
              <p className="text-xs text-warm-300 mt-0.5 flex items-center gap-0.5">
                {stat.trend.neutral ? null : stat.trend.up ? (
                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-warm-300" />
                )}
                {stat.trend.value} {stat.subtext}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-warm-100 shadow-sm p-6 mb-8">
        <h2 className="text-lg text-warm-900 font-[family-name:var(--font-display)] mb-6">
          {CHART_LABELS[timelineRange]}
        </h2>

        {timeline.length > 0 ? (
          <>
            {(() => {
              const allZero = timeline.every((d) => d.sent === 0);
              // For 30d/90d, only show every Nth label to avoid crowding
              const labelEvery = timelineRange === "7d" ? 1 : timelineRange === "30d" ? 5 : 10;
              return (
                <div className="relative">
                  {allZero && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <p className="text-sm text-warm-300 bg-white/80 px-3 py-1 rounded-lg">No follow-ups sent in this period</p>
                    </div>
                  )}
                  <div className="flex items-end gap-1 sm:gap-2 h-52">
                    {timeline.map((day, i) => {
                      const barH = (v: number) => v > 0 ? `${(v / maxVal) * 100}%` : "0px";
                      return (
                        <motion.div
                          key={day.date}
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          transition={{ duration: 0.5, delay: Math.min(i * 0.02, 0.6) }}
                          style={{ transformOrigin: "bottom" }}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <div className="w-full flex items-end justify-center gap-px" style={{ height: "170px" }}>
                            {/* Sent bar */}
                            <div
                              className="flex-1 max-w-[14px] rounded-t-sm bg-teal-300 transition-all"
                              style={{ height: barH(day.sent), minHeight: day.sent > 0 ? "3px" : "0" }}
                              title={`Sent: ${day.sent}`}
                            />
                            {/* Opened bar */}
                            <div
                              className="flex-1 max-w-[14px] rounded-t-sm bg-blue-300 transition-all"
                              style={{ height: barH(day.opened), minHeight: day.opened > 0 ? "3px" : "0" }}
                              title={`Opened: ${day.opened}`}
                            />
                            {/* Reviewed bar */}
                            <div
                              className="flex-1 max-w-[14px] rounded-t-sm bg-amber-300 transition-all"
                              style={{ height: barH(day.reviewed), minHeight: day.reviewed > 0 ? "3px" : "0" }}
                              title={`Reviewed: ${day.reviewed}`}
                            />
                          </div>
                          {i % labelEvery === 0 && (
                            <span className="text-[10px] text-warm-400 font-medium leading-none">
                              {timelineRange === "7d" ? day.day : day.date.slice(5)}
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-warm-50">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-teal-300" />
                <span className="text-xs text-warm-400">Sent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-300" />
                <span className="text-xs text-warm-400">Opened</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-amber-300" />
                <span className="text-xs text-warm-400">Reviewed</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-32 flex items-center justify-center">
            <p className="text-sm text-warm-400">No data for this period yet. Send some follow-ups to see your chart.</p>
          </div>
        )}
      </div>

      {/* Funnel */}
      <div className="bg-white rounded-xl border border-warm-100 shadow-sm p-6">
        <h2 className="text-lg text-warm-900 font-[family-name:var(--font-display)] mb-6">
          Follow-Up Funnel ({range === "all" ? "All Time" : CHART_LABELS[timelineRange]})
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
