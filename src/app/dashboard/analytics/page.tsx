"use client";

import { motion } from "framer-motion";
import {
  Send,
  Eye,
  Star,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

const weeklyData = [
  { day: "Mon", sent: 8, opened: 6, reviewed: 3 },
  { day: "Tue", sent: 12, opened: 9, reviewed: 5 },
  { day: "Wed", sent: 6, opened: 5, reviewed: 2 },
  { day: "Thu", sent: 15, opened: 12, reviewed: 7 },
  { day: "Fri", sent: 10, opened: 8, reviewed: 4 },
  { day: "Sat", sent: 3, opened: 2, reviewed: 1 },
  { day: "Sun", sent: 0, opened: 0, reviewed: 0 },
];

const maxSent = Math.max(...weeklyData.map((d) => d.sent), 1);

const summaryStats = [
  {
    label: "Total Sent",
    value: "142",
    subtext: "this month",
    icon: Send,
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    label: "Avg Open Rate",
    value: "78%",
    subtext: "+5% vs last month",
    icon: Eye,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Review Click Rate",
    value: "45%",
    subtext: "of opened",
    icon: Star,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Conversion Rate",
    value: "27%",
    subtext: "sent → reviewed",
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-50",
  },
];

export default function AnalyticsPage() {
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
        {summaryStats.map((stat, i) => (
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
              <ArrowUpRight className="w-3 h-3 text-green-500" />
              {stat.subtext}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Weekly chart (CSS-based) */}
      <div className="bg-white rounded-xl border border-warm-100 shadow-sm p-6 mb-8">
        <h2 className="text-lg text-warm-900 font-[family-name:var(--font-display)] mb-6">
          This Week
        </h2>

        <div className="flex items-end justify-between gap-3 h-48">
          {weeklyData.map((day, i) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{ transformOrigin: "bottom" }}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className="w-full flex flex-col gap-1 items-center" style={{ height: "160px", justifyContent: "flex-end" }}>
                {/* Sent bar */}
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
      </div>

      {/* Funnel */}
      <div className="bg-white rounded-xl border border-warm-100 shadow-sm p-6">
        <h2 className="text-lg text-warm-900 font-[family-name:var(--font-display)] mb-6">
          Follow-Up Funnel (This Month)
        </h2>

        <div className="space-y-4">
          {[
            { label: "Sent", value: 142, color: "bg-teal-500", percent: 100 },
            { label: "Delivered", value: 139, color: "bg-teal-400", percent: 98 },
            { label: "Opened", value: 111, color: "bg-blue-400", percent: 78 },
            { label: "Review Clicked", value: 64, color: "bg-amber-400", percent: 45 },
            { label: "Review Left", value: 38, color: "bg-green-400", percent: 27 },
          ].map((step, i) => (
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
      </div>
    </>
  );
}
