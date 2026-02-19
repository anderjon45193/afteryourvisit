"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Users,
  Zap,
  CalendarCheck,
  Building2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const integrations = [
  {
    name: "CSV Import",
    description: "Upload a CSV file to bulk-import contacts into your account.",
    icon: FileSpreadsheet,
    active: true,
    href: "/dashboard/contacts?import=true",
  },
  {
    name: "Google Contacts",
    description: "Sync contacts directly from your Google account.",
    icon: Users,
    active: false,
  },
  {
    name: "Zapier",
    description: "Connect AfterYourVisit with 5,000+ apps via Zapier automations.",
    icon: Zap,
    active: false,
  },
  {
    name: "Square Appointments",
    description: "Auto-send follow-ups after Square appointments complete.",
    icon: CalendarCheck,
    active: false,
  },
  {
    name: "Practice Management",
    description: "Integrate with dental, vet, and medical practice management systems.",
    icon: Building2,
    active: false,
  },
];

export default function IntegrationsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl text-warm-900">Integrations</h1>
        <p className="text-sm text-warm-400 mt-1">
          Connect your tools to streamline your workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration, i) => (
          <motion.div
            key={integration.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white rounded-xl border border-warm-100 shadow-card p-6 ${
              !integration.active ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                <integration.icon className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-warm-800">
                    {integration.name}
                  </h3>
                  {!integration.active && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-warm-100 text-warm-500"
                    >
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-warm-400 mb-4">
                  {integration.description}
                </p>
                {integration.active ? (
                  <Link href={integration.href!}>
                    <Button
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      Import Contacts
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    Coming Soon
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
