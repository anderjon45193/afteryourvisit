"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface FollowUpItem {
  id: string;
  clientFirstName: string;
  clientPhone: string;
  templateName: string;
  createdAt: string;
  status: "sent" | "opened" | "reviewed";
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusConfig = {
  sent: { label: "Sent", className: "bg-warm-100 text-warm-600" },
  opened: { label: "Opened", className: "bg-blue-50 text-blue-700" },
  reviewed: { label: "Reviewed", className: "bg-green-50 text-green-700" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${time}`;
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async (page = 1, q = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (q) params.set("search", q);
      const res = await fetch(`/api/followups?${params}`);
      const data = await res.json();
      setFollowUps(data.data);
      setPagination(data.pagination);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(1, search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl text-warm-900">Follow-Ups</h1>
          <p className="text-sm text-warm-400 mt-1">
            {pagination.total} follow-ups sent
          </p>
        </div>
        <Link href="/dashboard/send">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Follow-Up
          </Button>
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
        <Input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {/* Table / Card list */}
      <div className="bg-white rounded-xl border border-warm-100 shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-warm-100 bg-warm-50/50">
                <th className="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-5 py-3">Client</th>
                <th className="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-5 py-3">Phone</th>
                <th className="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-5 py-3">Template</th>
                <th className="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-5 py-3">Sent</th>
                <th className="text-left text-xs font-medium text-warm-400 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-xs font-medium text-warm-400 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {followUps.map((fu, i) => {
                const status = statusConfig[fu.status];
                return (
                  <motion.tr
                    key={fu.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className="border-b border-warm-50 last:border-0 hover:bg-warm-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-warm-800">{fu.clientFirstName}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-warm-500">{fu.clientPhone}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-warm-500">{fu.templateName}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-warm-400">{formatDate(fu.createdAt)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="secondary" className={`${status.className} text-xs font-medium`}>
                        {fu.status === "reviewed" && "⭐ "}{status.label}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/v/${fu.id}`} target="_blank">
                        <Button variant="ghost" size="sm" className="text-warm-400 hover:text-teal-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden divide-y divide-warm-50">
          {followUps.map((fu) => {
            const status = statusConfig[fu.status];
            return (
              <div key={fu.id} className="p-4 hover:bg-warm-50/50 transition-colors">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-medium text-warm-800">{fu.clientFirstName}</span>
                  <Badge variant="secondary" className={`${status.className} text-[10px] font-medium`}>
                    {fu.status === "reviewed" && "⭐ "}{status.label}
                  </Badge>
                </div>
                <p className="text-xs text-warm-500">{fu.clientPhone}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-warm-300">{formatDate(fu.createdAt)}</p>
                  <span className="text-xs text-warm-400">{fu.templateName}</span>
                </div>
              </div>
            );
          })}
        </div>

        {followUps.length === 0 && !loading && (
          <div className="p-12 text-center">
            <p className="text-warm-400">No follow-ups found.</p>
          </div>
        )}

        {loading && followUps.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-warm-400">
          Showing {followUps.length} of {pagination.total}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => fetchData(pagination.page - 1, search)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchData(pagination.page + 1, search)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
