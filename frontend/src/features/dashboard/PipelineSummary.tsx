"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard.service";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";

// Fixed pipeline order — all 5 stages always shown
const PIPELINE_ORDER = ["New", "Contacted", "Negotiation", "ClosedWon", "ClosedLost"] as const;

const STAGE_STYLES: Record<string, { color: string; bar: string; hex: string }> = {
  New:         { color: "text-slate-600",   bar: "bg-slate-400",   hex: "#94a3b8" },
  Contacted:   { color: "text-blue-600",    bar: "bg-blue-400",    hex: "#60a5fa" },
  Negotiation: { color: "text-amber-600",   bar: "bg-amber-400",   hex: "#fbbf24" },
  ClosedWon:   { color: "text-emerald-600", bar: "bg-emerald-400", hex: "#34d399" },
  ClosedLost:  { color: "text-red-500",     bar: "bg-red-400",     hex: "#f87171" },
};

const STAGE_LABELS: Record<string, string> = {
  New: "New", Contacted: "Contacted", Negotiation: "Negotiation",
  ClosedWon: "Won", ClosedLost: "Lost",
};

// ── Donut chart (pure SVG, no library) ───────────────────────
interface Segment { stage: string; value: number; count: number }

function DonutChart({ segments, total }: { segments: Segment[]; total: number }) {
  const r = 46;
  const cx = 60;
  const cy = 60;
  const strokeWidth = 18;
  const C = 2 * Math.PI * r;

  const active = segments.filter((s) => s.value > 0);

  if (active.length === 0) {
    return (
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
      </svg>
    );
  }

  let cumulative = 0;
  const slices = active.map((s) => {
    const pct = s.value / total;
    const dashLen = pct * C;
    const dashOffset = -cumulative * C;
    cumulative += pct;
    return { ...s, pct, dashLen, dashOffset };
  });

  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {slices.map((s) => (
          <circle
            key={s.stage}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={STAGE_STYLES[s.stage]?.hex ?? "#cbd5e1"}
            strokeWidth={strokeWidth}
            strokeDasharray={`${s.dashLen} ${C}`}
            strokeDashoffset={s.dashOffset}
            strokeLinecap="butt"
          />
        ))}
      </g>
      {/* Center label */}
      <text x={cx} y={cy - 6} textAnchor="middle" className="text-xs" fontSize="10" fill="#6b7280">deals</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="16" fontWeight="700" fill="#111827">
        {active.reduce((s, d) => s + d.count, 0)}
      </text>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────
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

  const stageMap = Object.fromEntries(stats.dealsByStage.map((s) => [s.stage, s]));
  const ordered = PIPELINE_ORDER.map((key) => stageMap[key] ?? { stage: key, count: 0, value: 0 });
  const maxValue = Math.max(...ordered.map((s) => s.value), 1);

  const totalValue = ordered
    .filter((s) => s.stage !== "ClosedLost")
    .reduce((sum, s) => sum + s.value, 0);
  const lostValue = stageMap["ClosedLost"]?.value ?? 0;

  // For donut: all stages (including Lost) with their actual values
  const donutTotal = ordered.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900 mb-5">Deal Pipeline</h2>

      {/* Bar chart */}
      <div className="space-y-4">
        {ordered.map((s) => {
          const style = STAGE_STYLES[s.stage] ?? { color: "text-gray-600", bar: "bg-gray-400", hex: "#cbd5e1" };
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

      {/* Donut chart + legend */}
      {donutTotal > 0 && (
        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-6">
          <DonutChart segments={ordered} total={donutTotal} />

          <div className="flex-1 space-y-2 min-w-0">
            {ordered.filter((s) => s.value > 0).map((s) => {
              const style = STAGE_STYLES[s.stage];
              const pct = ((s.value / donutTotal) * 100).toFixed(1);
              return (
                <div key={s.stage} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: style?.hex }}
                    />
                    <span className="text-xs text-gray-600 truncate">
                      {STAGE_LABELS[s.stage]}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-500 shrink-0">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer totals */}
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
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
