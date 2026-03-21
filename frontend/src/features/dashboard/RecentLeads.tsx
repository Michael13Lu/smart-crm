"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { leadsService } from "@/services/leads.service";
import { formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Lead } from "@/types";

export function RecentLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    leadsService
      .getAll()
      .then((all) =>
        setLeads(
          [...all]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
        )
      )
      .catch(console.error);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Recent Leads</h2>
        <Link
          href="/leads"
          className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-gray-50">
        {leads.length === 0
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3.5 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
              </div>
            ))
          : leads.map((lead) => {
              const initials = lead.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-slate-600">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                    <p className="text-xs text-gray-400 truncate">{lead.email}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <StatusBadge type="lead" status={lead.status} />
                    <span className="text-xs text-gray-400 hidden md:block">
                      {formatRelativeTime(lead.createdAt)}
                    </span>
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
