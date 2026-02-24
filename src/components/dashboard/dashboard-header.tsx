"use client";

import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Send,
  ClipboardList,
  FileText,
  MessageSquare,
  Settings,
  TrendingUp,
  Users,
  Puzzle,
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

export function DashboardHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="lg:hidden sticky top-0 bg-white/95 backdrop-blur-md border-b border-warm-200 z-30 px-4 h-14 flex items-center justify-between">
      <Link href="/">
        <span className="font-[family-name:var(--font-display)] text-lg text-teal-700">
          AfterYourVisit
        </span>
      </Link>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open navigation menu">
            <Menu className="h-5 w-5 text-warm-600" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="px-6 pt-7 pb-5 border-b border-warm-100">
            <span className="font-[family-name:var(--font-display)] text-xl text-teal-700">
              AfterYourVisit
            </span>
          </div>
          <nav className="px-4 py-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14.5px] font-medium transition-all",
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-warm-500 hover:bg-warm-50 hover:text-warm-700"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-[18px] h-[18px] flex-shrink-0",
                      isActive ? "text-teal-600" : "text-warm-400"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section at bottom of mobile menu */}
          <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-warm-100">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                <span className="text-xs font-semibold text-teal-700">
                  {user ? getInitials(user.name || "U") : "..."}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-warm-800 truncate">
                  {user?.name || "Loading..."}
                </p>
                <p className="text-xs text-warm-400 truncate mt-0.5">
                  {user?.email || ""}
                </p>
              </div>
              <button
                onClick={() => signOut({ redirectTo: "/sign-in" })}
                className="text-warm-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
