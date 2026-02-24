"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Send,
  ClipboardList,
  Users,
  MoreHorizontal,
  FileText,
  MessageSquare,
  TrendingUp,
  Puzzle,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primaryNavItems = [
  { label: "Home", href: "/dashboard", icon: BarChart3 },
  { label: "Send", href: "/dashboard/send", icon: Send },
  { label: "History", href: "/dashboard/followups", icon: ClipboardList },
  { label: "Contacts", href: "/dashboard/contacts", icon: Users },
];

const moreNavItems = [
  { label: "Templates", href: "/dashboard/templates", icon: FileText },
  { label: "Snippets", href: "/dashboard/snippets", icon: MessageSquare },
  { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { label: "Integrations", href: "/dashboard/integrations", icon: Puzzle },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreNavItems.some((item) =>
    pathname.startsWith(item.href)
  );

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowMore(false)}
          />
          <div className="absolute bottom-16 left-0 right-0 bg-white border-t border-warm-200 rounded-t-2xl shadow-xl p-4 safe-area-bottom">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-warm-600">More</span>
              <button
                onClick={() => setShowMore(false)}
                className="p-1 text-warm-400 hover:text-warm-600"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {moreNavItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors",
                      isActive
                        ? "bg-teal-50 text-teal-600"
                        : "text-warm-500 hover:bg-warm-50"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-warm-200 z-40 safe-area-bottom"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {primaryNavItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]",
                  isActive ? "text-teal-600" : "text-warm-400"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]",
              isMoreActive || showMore ? "text-teal-600" : "text-warm-400"
            )}
            aria-label="More navigation options"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
