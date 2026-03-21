"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { dealsService } from "@/services/deals.service";
import { leadsService } from "@/services/leads.service";
import type { Deal, DealStage, Lead } from "@/types";

const STAGES: { value: DealStage; label: string }[] = [
  { value: "New",         label: "New"         },
  { value: "Contacted",   label: "Contacted"   },
  { value: "Negotiation", label: "Negotiation" },
  { value: "ClosedWon",   label: "Won"         },
  { value: "ClosedLost",  label: "Lost"        },
];

interface Props {
  open: boolean;
  onClose: () => void;
  /** If provided, modal is in edit mode */
  deal?: Deal;
  /** Pre-selected stage when creating from a column button */
  initialStage?: DealStage;
  /** Pre-selected lead when creating from a lead detail page */
  initialLeadId?: string;
  onSaved: (deal: Deal) => void;
}

export function DealFormModal({ open, onClose, deal, initialStage, initialLeadId, onSaved }: Props) {
  const isEdit = !!deal;

  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState<DealStage>(initialStage ?? "New");
  const [notes, setNotes] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [leadId, setLeadId] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  // Load leads for selector
  useEffect(() => {
    leadsService.getAll().then(setLeads).catch(() => {});
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (open) {
      if (deal) {
        setTitle(deal.title);
        setValue(deal.value.toString());
        setStage(deal.stage);
        setNotes(deal.notes ?? "");
        setClosingDate(deal.closingDate ? deal.closingDate.split("T")[0] : "");
        setLeadId(deal.lead?.id ?? "");
      } else {
        setTitle(""); setValue(""); setNotes(""); setClosingDate("");
        setLeadId(initialLeadId ?? "");
        setStage(initialStage ?? "New");
      }
      setError("");
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [open, deal, initialStage]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      setError("Please enter a valid deal value.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      let saved: Deal;
      if (isEdit && deal) {
        saved = await dealsService.update(deal.id, {
          title: title.trim(),
          value: numValue,
          stage,
          notes: notes.trim() || undefined,
          closingDate: closingDate ? closingDate + "T00:00:00Z" : undefined,
          leadId: leadId || undefined,
        });
      } else {
        saved = await dealsService.create({
          title: title.trim(),
          value: numValue,
          stage,
          notes: notes.trim() || undefined,
          closingDate: closingDate ? closingDate + "T00:00:00Z" : undefined,
          leadId: leadId || undefined,
        });
      }
      onSaved(saved);
      onClose();
    } catch {
      setError(`Failed to ${isEdit ? "update" : "create"} deal. Please try again.`);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">{isEdit ? "Edit Deal" : "New Deal"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Deal Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enterprise SaaS Contract"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Value + Stage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Value ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                placeholder="5000"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DealStage)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Associated Lead */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Associated Lead</label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">— No lead —</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}{l.company ? ` · ${l.company}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Closing Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Expected Close Date</label>
            <input
              type="date"
              value={closingDate}
              onChange={(e) => setClosingDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Key context about this deal…"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save Changes" : "Create Deal")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
