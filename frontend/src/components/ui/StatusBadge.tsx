import type { LeadStatus, DealStage, TaskStatus, TaskPriority } from "@/types";

type BadgeVariant = "lead" | "deal" | "task" | "priority";

interface StatusBadgeProps {
  type: BadgeVariant;
  status: LeadStatus | DealStage | TaskStatus | TaskPriority | string;
  className?: string;
}

const STYLES: Record<string, string> = {
  // Lead statuses (API casing)
  New:         "bg-blue-50 text-blue-700",
  Contacted:   "bg-amber-50 text-amber-700",
  Qualified:   "bg-emerald-50 text-emerald-700",
  Lost:        "bg-red-50 text-red-600",
  // Deal stages
  Negotiation: "bg-violet-50 text-violet-700",
  ClosedWon:   "bg-emerald-50 text-emerald-700",
  ClosedLost:  "bg-red-50 text-red-600",
  // Task statuses
  Pending:     "bg-gray-100 text-gray-600",
  InProgress:  "bg-blue-50 text-blue-700",
  Done:        "bg-emerald-50 text-emerald-700",
  // Priority
  Low:         "bg-gray-100 text-gray-500",
  Medium:      "bg-amber-50 text-amber-700",
  High:        "bg-red-50 text-red-600",
};

const LABELS: Record<string, string> = {
  New: "New", Contacted: "Contacted", Qualified: "Qualified", Lost: "Lost",
  Negotiation: "Negotiation", ClosedWon: "Won", ClosedLost: "Lost",
  Pending: "Pending", InProgress: "In Progress", Done: "Done",
  Low: "Low", Medium: "Medium", High: "High",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        STYLES[status] ?? "bg-gray-100 text-gray-600"
      } ${className ?? ""}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
