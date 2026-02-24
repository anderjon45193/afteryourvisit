"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function FloatingActionButton() {
  const pathname = usePathname();

  // Hide on the Send page itself and on the welcome page
  if (pathname === "/dashboard/send" || pathname === "/dashboard/welcome") {
    return null;
  }

  return (
    <Link
      href="/dashboard/send"
      className="fixed bottom-20 lg:bottom-8 right-6 z-30"
    >
      <Button
        size="lg"
        className="bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-xl hover:shadow-2xl px-6 py-6 text-sm font-semibold hover:-translate-y-0.5 transition-all"
      >
        <Plus className="w-5 h-5 mr-2" />
        New Follow-Up
      </Button>
    </Link>
  );
}
