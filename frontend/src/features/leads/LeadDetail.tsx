"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Building2, Globe, Pencil, Trash2, Loader2 } from "lucide-react";
import { leadsService } from "@/services/leads.service";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CreateLeadModal } from "@/features/leads/CreateLeadModal";
import { useAuth } from "@/lib/auth-context";
import type { Lead } from "@/types";

export function LeadDetail({ id }: { id: string }) {
  const router = useRouter();
  const { isManager, isAdmin } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    leadsService.getById(id).then(setLead).catch(() => setNotFound(true));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await leadsService.delete(id);
      router.push("/leads");
    } catch {
      setDeleting(false);
      setDeleteError("Failed to delete. Please try again.");
    }
  }

  if (notFound) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>Lead not found.</p>
        <Link href="/leads" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
          Back to Leads
        </Link>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-5 bg-gray-100 rounded w-28" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-48 bg-gray-100 rounded-2xl" />
          <div className="h-48 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const initials = lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const assignedInitials = lead.assignedTo?.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leads
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-600">{initials}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{lead.name}</h1>
                {lead.company && <p className="text-sm text-gray-500 mt-0.5">{lead.company}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge type="lead" status={lead.status} />
                  {lead.source && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {lead.source}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right mr-2">
                <p className="text-xs text-gray-400">Added</p>
                <p className="text-sm font-medium text-gray-700">{formatDate(lead.createdAt)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Updated {formatRelativeTime(lead.updatedAt)}</p>
              </div>
              {isManager && (
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => { setConfirmDelete(true); setDeleteError(""); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-100 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Delete confirmation */}
          {confirmDelete && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100">
              <p className="text-sm font-medium text-red-700 mb-3">
                Delete <span className="font-semibold">{lead.name}</span>? This cannot be undone.
              </p>
              {deleteError && <p className="text-xs text-red-600 mb-2">{deleteError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {deleting ? "Deleting…" : "Yes, Delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:underline">
                    {lead.email}
                  </a>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <a href={`tel:${lead.phone}`} className="text-gray-700 hover:text-indigo-600 transition-colors">
                      {lead.phone}
                    </a>
                  </div>
                )}
                {lead.company && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700">{lead.company}</span>
                  </div>
                )}
                {lead.source && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-500">Source: {lead.source}</span>
                  </div>
                )}
              </div>
            </div>

            {lead.notes && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Notes</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{lead.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Assigned To
              </h2>
              {lead.assignedTo ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-indigo-700">{assignedInitials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.assignedTo.fullName}</p>
                    <p className="text-xs text-gray-400">{lead.assignedTo.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Unassigned</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Timeline
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-700 font-medium">{formatDate(lead.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last updated</span>
                  <span className="text-gray-700 font-medium">{formatDate(lead.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal — reuses CreateLeadModal in edit mode */}
      <CreateLeadModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialLead={lead}
        onCreated={(updated) => setLead(updated)}
      />
    </>
  );
}
