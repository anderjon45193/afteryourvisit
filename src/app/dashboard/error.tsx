"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-warm-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-warm-400 mb-6 max-w-sm">
        We hit an unexpected error loading this page. Please try again.
      </p>
      <Button onClick={reset} className="bg-teal-600 hover:bg-teal-700 text-white">
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>
  );
}
