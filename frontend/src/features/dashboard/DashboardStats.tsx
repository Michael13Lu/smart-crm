"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, CheckSquare, DollarSign } from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats as Stats } from "@/types";

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    dashboardService.getStats().then(setStats).catch(console.error);
  }, []);

  const cards = stats
    ? [
        {
          label: "Total Leads",
          value: stats.totalLeads.toString(),
          sub: `${stats.newLeads} new`,
          icon: Users,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        },
        {
          label: "Active Deals",
          value: stats.totalDeals.toString(),
          sub: formatCurrency(stats.pipelineValue) + " pipeline",
          icon: TrendingUp,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          label: "Revenue Won",
          value: formatCurrency(stats.totalRevenue),
          sub: "Closed won deals",
          icon: DollarSign,
          color: "text-violet-600",
          bg: "bg-violet-50",
        },
        {
          label: "Pending Tasks",
          value: stats.pendingTasks.toString(),
          sub: stats.overdueTasks > 0 ? `${stats.overdueTasks} overdue` : "All on track",
          icon: CheckSquare,
          color: "text-amber-600",
          bg: "bg-amber-50",
        },
      ]
    : Array(4).fill(null);

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((s, i) =>
        s ? (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
          </div>
        ) : (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
            <div className="h-7 bg-gray-100 rounded w-16 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-20" />
          </div>
        )
      )}
    </div>
  );
}
