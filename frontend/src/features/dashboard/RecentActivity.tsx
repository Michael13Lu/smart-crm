"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard.service";
import { formatRelativeTime } from "@/lib/utils";
import type { ActivityLog } from "@/types";

export function RecentActivity() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    dashboardService.getStats().then((s) => setLogs(s.recentActivity)).catch(console.error);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-full">
      <h2 className="text-sm font-semibold text-gray-900 mb-5">Recent Activity</h2>

      {logs.length === 0 ? (
        <div className="space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-7 h-7 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const initials = log.performedBy
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <div key={log.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-semibold text-indigo-700">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">
                    <span className="font-medium">{log.performedBy}</span>{" "}
                    {log.action.toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{log.entityName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(log.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
