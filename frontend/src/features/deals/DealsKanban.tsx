"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { dealsService } from "@/services/deals.service";
import { formatCurrency } from "@/lib/utils";
import type { Deal, DealStage } from "@/types";

const STAGES: { key: DealStage; label: string; color: string; header: string }[] = [
  { key: "New",         label: "New",         color: "border-slate-300",   header: "bg-slate-100 text-slate-700"   },
  { key: "Contacted",   label: "Contacted",   color: "border-blue-300",    header: "bg-blue-50 text-blue-700"     },
  { key: "Negotiation", label: "Negotiation", color: "border-amber-300",   header: "bg-amber-50 text-amber-700"   },
  { key: "ClosedWon",   label: "Won",         color: "border-emerald-300", header: "bg-emerald-50 text-emerald-700"},
  { key: "ClosedLost",  label: "Lost",        color: "border-red-300",     header: "bg-red-50 text-red-600"       },
];

function DealCard({ deal }: { deal: Deal }) {
  const assignedInitials = deal.assignedTo?.fullName
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug pr-2">{deal.title}</h3>
        <button className="p-0.5 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <p className="text-lg font-bold text-gray-900 mb-3">{formatCurrency(deal.value)}</p>

      {deal.lead && (
        <p className="text-xs text-gray-500 mb-3">{deal.lead.company ?? deal.lead.name}</p>
      )}

      {deal.closingDate && (
        <p className="text-xs text-gray-400 mb-3">
          Closes{" "}
          {new Date(deal.closingDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
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
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<DealStage | null>(null);

  useEffect(() => {
    dealsService.getAll().then(setDeals).catch(console.error);
  }, []);

  async function handleDrop(stage: DealStage) {
    if (!dragging) return;
    const deal = deals.find((d) => d.id === dragging);
    if (!deal || deal.stage === stage) {
      setDragging(null);
      setDragOver(null);
      return;
    }
    // Optimistic update
    setDeals((prev) => prev.map((d) => (d.id === dragging ? { ...d, stage } : d)));
    setDragging(null);
    setDragOver(null);
    try {
      await dealsService.updateStage(dragging, stage);
    } catch {
      // Rollback
      setDeals((prev) => prev.map((d) => (d.id === dragging ? { ...d, stage: deal.stage } : d)));
    }
  }

  return (
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
                  draggable
                  onDragStart={() => setDragging(deal.id)}
                  onDragEnd={() => setDragging(null)}
                  className={`transition-opacity ${dragging === deal.id ? "opacity-40" : ""}`}
                >
                  <DealCard deal={deal} />
                </div>
              ))}
              {stageDeals.length === 0 && (
                <div className="flex items-center justify-center h-20 text-xs text-gray-300">
                  Drop here
                </div>
              )}
            </div>

            <button className="flex items-center gap-1.5 px-3 py-2 mt-2 rounded-xl text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors w-full">
              <Plus className="w-3.5 h-3.5" />
              Add deal
            </button>
          </div>
        );
      })}
    </div>
  );
}
