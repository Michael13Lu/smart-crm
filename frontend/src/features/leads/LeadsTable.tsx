"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, ExternalLink, Users } from "lucide-react";
import { leadsService } from "@/services/leads.service";
import { formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CreateLeadModal } from "@/features/leads/CreateLeadModal";
import { useAuth } from "@/lib/auth-context";
import type { Lead, LeadStatus } from "@/types";

const STATUS_FILTERS: { label: string; value: LeadStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "New" },
  { label: "Contacted", value: "Contacted" },
  { label: "Qualified", value: "Qualified" },
  { label: "Lost", value: "Lost" },
];

export function LeadsTable() {
  const { isManager } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    leadsService
      .getAll({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search || undefined,
      })
      .then(setLeads)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {isManager && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Company</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Assigned To</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">Source</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden xl:table-cell">Added</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array(4).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-5 py-3.5">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-48" />
                      </td>
                    </tr>
                  ))
                : leads.map((lead) => {
                    const initials = lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    const assignedInitials = lead.assignedTo?.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                              <span className="text-xs font-semibold text-slate-600">{initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                              <p className="text-xs text-gray-400">{lead.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="text-sm text-gray-600">{lead.company ?? "—"}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge type="lead" status={lead.status} />
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          {lead.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-[10px] font-semibold text-indigo-700">{assignedInitials}</span>
                              </div>
                              <span className="text-sm text-gray-600">{lead.assignedTo.fullName}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="text-sm text-gray-500">{lead.source ?? "—"}</span>
                        </td>
                        <td className="px-4 py-3.5 hidden xl:table-cell">
                          <span className="text-sm text-gray-400">{formatRelativeTime(lead.createdAt)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors inline-flex"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
              {!loading && leads.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Users className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">No leads found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {search || statusFilter !== "all"
                          ? "Try adjusting your filters or search query."
                          : "Add your first lead to start tracking your pipeline."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <CreateLeadModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(lead) => setLeads((prev) => [lead, ...prev])}
      />
    </div>
  );
}
