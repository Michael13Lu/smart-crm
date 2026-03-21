"use client";

import { useState, useEffect, useRef } from "react";
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import { dealsService } from "@/services/deals.service";
import { formatCurrency } from "@/lib/utils";
import { DealFormModal } from "@/features/deals/DealFormModal";
import { useAuth } from "@/lib/auth-context";
import type { Deal, DealStage } from "@/types";

const STAGES: { key: DealStage; label: string; color: string; header: string }[] = [
  { key: "New",         label: "New",         color: "border-slate-300",   header: "bg-slate-100 text-slate-700"   },
  { key: "Contacted",   label: "Contacted",   color: "border-blue-300",    header: "bg-blue-50 text-blue-700"     },
  { key: "Negotiation", label: "Negotiation", color: "border-amber-300",   header: "bg-amber-50 text-amber-700"   },
  { key: "ClosedWon",   label: "Won",         color: "border-emerald-300", header: "bg-emerald-50 text-emerald-700"},
  { key: "ClosedLost",  label: "Lost",        color: "border-red-300",     header: "bg-red-50 text-red-600"       },
];

interface DealCardProps {
  deal: Deal;
  canEdit: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
}

function DealCard({ deal, canEdit, onEdit, onDelete }: DealCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const assignedInitials = deal.assignedTo?.fullName
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmDelete(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await dealsService.delete(deal.id);
      onDelete(deal.id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug pr-2">{deal.title}</h3>
        {canEdit && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); setConfirmDelete(false); }}
              className="p-0.5 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity rounded"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-6 z-10 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm">
                {!confirmDelete ? (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(deal); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-gray-400" />
                      Edit deal
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </>
                ) : (
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-600 mb-2">Delete this deal?</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                        disabled={deleting}
                        className="flex-1 py-1 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
                      >
                        {deleting ? "…" : "Yes"}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
                        className="flex-1 py-1 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-lg font-bold text-gray-900 mb-3">{formatCurrency(deal.value)}</p>

      {deal.lead && (
        <p className="text-xs text-gray-500 mb-3">{deal.lead.company ?? deal.lead.name}</p>
      )}

      {deal.closingDate && (
        <p className="text-xs text-gray-400 mb-3">
          Closes{" "}
          {new Date(deal.closingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      )}

      {deal.assignedTo && (
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-[9px] font-semibold text-indigo-700">{assignedInitials}</span>
          </div>
          <span className="text-xs text-gray-400">{deal.assignedTo.fullName}</span>
        </div>
      )}
    </div>
  );
}

export function DealsKanban() {
  const { isManager } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<DealStage | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | undefined>(undefined);
  const [modalStage, setModalStage] = useState<DealStage>("New");

  useEffect(() => {
    dealsService.getAll().then(setDeals).catch(console.error);
  }, []);

  async function handleDrop(stage: DealStage) {
    if (!dragging) return;
    const deal = deals.find((d) => d.id === dragging);
    if (!deal || deal.stage === stage) { setDragging(null); setDragOver(null); return; }
    setDeals((prev) => prev.map((d) => (d.id === dragging ? { ...d, stage } : d)));
    setDragging(null); setDragOver(null);
    try {
      await dealsService.updateStage(dragging, stage);
    } catch {
      setDeals((prev) => prev.map((d) => (d.id === dragging ? { ...d, stage: deal.stage } : d)));
    }
  }

  function openCreate(stage: DealStage) {
    setEditingDeal(undefined);
    setModalStage(stage);
    setModalOpen(true);
  }

  function openEdit(deal: Deal) {
    setEditingDeal(deal);
    setModalOpen(true);
  }

  function handleSaved(saved: Deal) {
    setDeals((prev) => {
      const exists = prev.some((d) => d.id === saved.id);
      return exists ? prev.map((d) => (d.id === saved.id ? saved : d)) : [saved, ...prev];
    });
  }

  function handleDeleted(id: string) {
    setDeals((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <>
      <div className="flex gap-4 h-full overflow-x-auto pb-2">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.key);
          const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
          const isDragTarget = dragOver === stage.key;

          return (
            <div
              key={stage.key}
              className="flex flex-col w-72 shrink-0"
              onDragOver={(e) => { e.preventDefault(); setDragOver(stage.key); }}
              onDrop={() => handleDrop(stage.key)}
              onDragLeave={() => setDragOver(null)}
            >
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 ${stage.header}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{stage.label}</span>
                  <span className="text-xs bg-white/60 px-1.5 py-0.5 rounded-full font-medium">
                    {stageDeals.length}
                  </span>
                </div>
                <span className="text-xs font-semibold">{formatCurrency(stageValue)}</span>
              </div>

              <div
                className={`flex-1 space-y-3 p-2 rounded-xl border-2 border-dashed transition-colors min-h-[200px] ${
                  isDragTarget ? "border-indigo-400 bg-indigo-50/50" : "border-transparent"
                }`}
              >
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable={isManager}
                    onDragStart={() => isManager && setDragging(deal.id)}
                    onDragEnd={() => setDragging(null)}
                    className={`transition-opacity ${dragging === deal.id ? "opacity-40" : ""}`}
                  >
                    <DealCard
                      deal={deal}
                      canEdit={isManager}
                      onEdit={openEdit}
                      onDelete={handleDeleted}
                    />
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-xs text-gray-300">
                    Drop here
                  </div>
                )}
              </div>

              {isManager && (
                <button
                  onClick={() => openCreate(stage.key)}
                  className="flex items-center gap-1.5 px-3 py-2 mt-2 rounded-xl text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors w-full"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add deal
                </button>
              )}
            </div>
          );
        })}
      </div>

      <DealFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        deal={editingDeal}
        initialStage={modalStage}
        onSaved={handleSaved}
      />
    </>
  );
}
