"use client";

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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
  {
    label: "Follow-ups Sent",
    value: "142",
    trend: "+12%",
    trendUp: true,
    icon: Send,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    label: "Open Rate",
    value: "78%",
    trend: "+5%",
    trendUp: true,
    icon: Eye,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "Review Clicks",
    value: "64",
    trend: "+18%",
    trendUp: true,
    icon: Star,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    label: "Reviews Generated",
    value: "38",
    trend: "-3%",
    trendUp: false,
    icon: TrendingUp,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
];

const recentFollowUps = [
  {
    id: "1",
    clientName: "Sarah Johnson",
    phone: "(555) 123-4567",
    template: "Standard Cleaning",
    sentAt: "Today, 2:30 PM",
    status: "reviewed" as const,
  },
  {
    id: "2",
    clientName: "Mike Chen",
    phone: "(555) 234-5678",
    template: "Standard Cleaning",
    sentAt: "Today, 11:15 AM",
    status: "opened" as const,
  },
  {
    id: "3",
    clientName: "Emma Wilson",
    phone: "(555) 345-6789",
    template: "Post-Procedure",
    sentAt: "Today, 9:45 AM",
    status: "sent" as const,
  },
  {
    id: "4",
    clientName: "James Rodriguez",
    phone: "(555) 456-7890",
    template: "Standard Cleaning",
    sentAt: "Yesterday, 4:20 PM",
    status: "reviewed" as const,
  },
  {
    id: "5",
    clientName: "Lisa Park",
    phone: "(555) 567-8901",
    template: "Orthodontics Check",
    sentAt: "Yesterday, 2:00 PM",
    status: "opened" as const,
  },
  {
    id: "6",
    clientName: "David Kim",
    phone: "(555) 678-9012",
    template: "Standard Cleaning",
    sentAt: "Yesterday, 10:30 AM",
    status: "sent" as const,
  },
];

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

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "there";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl text-warm-900">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-warm-400 mt-1">{today}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
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
                  stat.trendUp ? "text-green-600" : "text-red-500"
                }`}
              >
                {stat.trendUp ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-warm-900">{stat.value}</p>
            <p className="text-xs text-warm-400 mt-1">{stat.label}</p>
          </motion.div>
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
                        {fu.clientName}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-warm-500">{fu.phone}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-warm-500">
                        {fu.template}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-warm-400">{fu.sentAt}</span>
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
                    {fu.clientName}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`${status.className} text-[10px] font-medium`}
                  >
                    {fu.status === "reviewed" && "⭐ "}
                    {status.label}
                  </Badge>
                </div>
                <p className="text-xs text-warm-400">{fu.template}</p>
                <p className="text-xs text-warm-300 mt-0.5">{fu.sentAt}</p>
              </div>
            );
          })}
        </div>
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
