"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard.service";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";

// Fixed pipeline order — all 5 stages always shown
const PIPELINE_ORDER = ["New", "Contacted", "Negotiation", "ClosedWon", "ClosedLost"] as const;

const STAGE_STYLES: Record<string, { color: string; bar: string }> = {
  New:         { color: "text-slate-600",   bar: "bg-slate-400"  },
  Contacted:   { color: "text-blue-600",    bar: "bg-blue-400"   },
  Negotiation: { color: "text-amber-600",   bar: "bg-amber-400"  },
  ClosedWon:   { color: "text-emerald-600", bar: "bg-emerald-400"},
  ClosedLost:  { color: "text-red-500",     bar: "bg-red-400"    },
};

const STAGE_LABELS: Record<string, string> = {
  New: "New", Contacted: "Contacted", Negotiation: "Negotiation",
  ClosedWon: "Won", ClosedLost: "Lost",
};

export function PipelineSummary() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    dashboardService.getStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-4 bg-gray-100 rounded w-24" />
        {Array(5).fill(0).map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded" />)}
      </div>
    );
  }

  // Merge API data with fixed order — stages missing from API get count=0, value=0
  const stageMap = Object.fromEntries(stats.dealsByStage.map((s) => [s.stage, s]));
  const ordered = PIPELINE_ORDER.map((key) => stageMap[key] ?? { stage: key, count: 0, value: 0 });
  const maxValue = Math.max(...ordered.map((s) => s.value), 1);
  // Pipeline value excludes Lost deals (they reduce, not add to, business value)
  const totalValue = ordered
    .filter((s) => s.stage !== "ClosedLost")
    .reduce((sum, s) => sum + s.value, 0);
  const lostValue = stageMap["ClosedLost"]?.value ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900 mb-5">Deal Pipeline</h2>

      <div className="space-y-4">
        {ordered.map((s) => {
          const style = STAGE_STYLES[s.stage] ?? { color: "text-gray-600", bar: "bg-gray-400" };
          return (
            <div key={s.stage}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${style.color}`}>
                    {STAGE_LABELS[s.stage] ?? s.stage}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {s.count}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {formatCurrency(s.value)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${style.bar}`}
                  style={{ width: `${(s.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-sm">
        {lostValue > 0 && (
          <div className="flex justify-between">
            <span className="text-red-400">Lost deals</span>
            <span className="text-red-400 font-medium">−{formatCurrency(lostValue)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Total pipeline value</span>
          <span className="font-bold text-gray-900">{formatCurrency(totalValue)}</span>
        </div>
      </div>
    </div>
  );
}
