"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, TrendingUp, CheckSquare, ArrowRight, X } from "lucide-react";
import { leadsService } from "@/services/leads.service";
import { dealsService } from "@/services/deals.service";
import { tasksService } from "@/services/tasks.service";
import type { Lead, Deal, Task } from "@/types";

interface SearchResult {
  type: "lead" | "deal" | "task";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 250);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Search when query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    const q = debouncedQuery.toLowerCase();
    setLoading(true);

    Promise.allSettled([
      leadsService.getAll({ search: debouncedQuery }),
      dealsService.getAll(),
      tasksService.getAll(),
    ]).then(([leadsRes, dealsRes, tasksRes]) => {
      const out: SearchResult[] = [];

      if (leadsRes.status === "fulfilled") {
        leadsRes.value.slice(0, 4).forEach((l: Lead) => {
          out.push({
            type: "lead",
            id: l.id,
            title: l.name,
            subtitle: [l.company, l.email].filter(Boolean).join(" · "),
            href: `/leads/${l.id}`,
          });
        });
      }

      if (dealsRes.status === "fulfilled") {
        dealsRes.value
          .filter((d: Deal) =>
            d.title.toLowerCase().includes(q) ||
            (d.lead?.name ?? "").toLowerCase().includes(q)
          )
          .slice(0, 3)
          .forEach((d: Deal) => {
            out.push({
              type: "deal",
              id: d.id,
              title: d.title,
              subtitle: `${d.stage} · $${d.value.toLocaleString()}`,
              href: "/deals",
            });
          });
      }

      if (tasksRes.status === "fulfilled") {
        tasksRes.value
          .filter((t: Task) => t.title.toLowerCase().includes(q))
          .slice(0, 3)
          .forEach((t: Task) => {
            out.push({
              type: "task",
              id: t.id,
              title: t.title,
              subtitle: `${t.priority} priority · ${t.status}`,
              href: "/tasks",
            });
          });
      }

      setResults(out);
      setSelected(0);
      setLoading(false);
    });
  }, [debouncedQuery]);

  const navigate = useCallback((href: string) => {
    router.push(href);
    onClose();
  }, [router, onClose]);

  // Keyboard navigation
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      navigate(results[selected].href);
    }
  }

  const ICONS = {
    lead: <Users className="w-3.5 h-3.5" />,
    deal: <TrendingUp className="w-3.5 h-3.5" />,
    task: <CheckSquare className="w-3.5 h-3.5" />,
  };
  const COLORS = {
    lead: "bg-indigo-100 text-indigo-600",
    deal: "bg-emerald-100 text-emerald-600",
    task: "bg-amber-100 text-amber-600",
  };
  const TYPE_LABELS = { lead: "Lead", deal: "Deal", task: "Task" };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search leads, deals, tasks…"
            className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-gray-200 text-[10px] font-medium text-gray-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        {query.trim() && (
          <div className="max-h-80 overflow-y-auto py-2">
            {loading && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">Searching…</div>
            )}
            {!loading && results.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No results for <span className="font-medium text-gray-600">"{query}"</span>
              </div>
            )}
            {!loading && results.map((r, i) => (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => navigate(r.href)}
                onMouseEnter={() => setSelected(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  selected === i ? "bg-indigo-50" : "hover:bg-gray-50"
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${COLORS[r.type]}`}>
                  {ICONS[r.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                  <p className="text-xs text-gray-400 truncate">{r.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {TYPE_LABELS[r.type]}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty state hint */}
        {!query.trim() && (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-gray-400">
              Type to search across <span className="font-medium text-gray-500">leads</span>,{" "}
              <span className="font-medium text-gray-500">deals</span> and{" "}
              <span className="font-medium text-gray-500">tasks</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
