import type { Metadata } from "next";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FloatingActionButton } from "@/components/dashboard/floating-action-button";

export const metadata: Metadata = {
  title: {
    template: "%s — AfterYourVisit",
    default: "Dashboard",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-warm-50">
      <Sidebar />
      <DashboardHeader />
      <main className="lg:ml-[260px] pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
      <FloatingActionButton />
      <MobileNav />
    </div>
  );
}
