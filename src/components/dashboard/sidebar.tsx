"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  BarChart3,
  Send,
  ClipboardList,
  FileText,
  MessageSquare,
  Settings,
  TrendingUp,
  Crown,
  LogOut,
  Users,
  Puzzle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Send Follow-Up", href: "/dashboard/send", icon: Send },
  { label: "Follow-Ups", href: "/dashboard/followups", icon: ClipboardList },
  { label: "Contacts", href: "/dashboard/contacts", icon: Users },
  { label: "Templates", href: "/dashboard/templates", icon: FileText },
  { label: "Snippets", href: "/dashboard/snippets", icon: MessageSquare },
  { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { label: "Integrations", href: "/dashboard/integrations", icon: Puzzle },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface PlanData {
  plan: string;
  planName: string;
  isTrialExpired: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const [planData, setPlanData] = useState<PlanData | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setPlanData({ plan: data.plan, planName: data.planName, isTrialExpired: data.isTrialExpired });
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen fixed left-0 top-0 bg-white border-r border-warm-200 z-40">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/" className="block">
          <span className="font-[family-name:var(--font-display)] text-xl text-teal-700 tracking-tight">
            AfterYourVisit
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-teal-50 text-teal-700"
                  : "text-warm-500 hover:bg-warm-50 hover:text-warm-700"
              )}
            >
              <item.icon
                className={cn(
                  "w-[18px] h-[18px]",
                  isActive ? "text-teal-600" : "text-warm-400"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-warm-100 space-y-3">
        {/* Plan badge */}
        {planData?.isTrialExpired && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-red-700">Trial expired</span>
          </div>
        )}
        <div className="flex items-center justify-between px-3 py-2 bg-warm-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-warm-600">
              {planData ? `${planData.planName} Plan` : "Loading..."}
            </span>
          </div>
          {planData?.plan !== "pro" && (
            <Link
              href="/dashboard/settings?tab=billing"
              className="text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Upgrade
            </Link>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-teal-700">
              {user ? getInitials(user.name || "U") : "..."}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-warm-800 truncate">
              {user?.name || "Loading..."}
            </p>
            <p className="text-xs text-warm-400 truncate">
              {user?.email || ""}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-warm-300 hover:text-red-500 transition-colors p-1"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
