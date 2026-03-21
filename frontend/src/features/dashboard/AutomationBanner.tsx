"use client";

import { Zap, Bot, Workflow, ArrowRight } from "lucide-react";

const integrations = [
  {
    icon: Bot,
    label: "AI Agents",
    desc: "Claude, GPT-4",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: Workflow,
    label: "Automation",
    desc: "n8n, Zapier",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Zap,
    label: "Webhooks",
    desc: "Any REST API",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

export function AutomationBanner() {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Left: title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">
              AI-Ready
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white leading-snug">
            Connect to AI agents and automation workflows
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Every action in this CRM is accessible via REST API — ready to plug in AI lead scoring,
            automated follow-ups, or any external integration.
          </p>
        </div>

        {/* Right: integration chips */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {integrations.map(({ icon: Icon, label, desc, color, bg }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded-xl px-3 py-2"
            >
              <div className={`p-1.5 rounded-lg ${bg}`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-white leading-none">{label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}

          <a
            href="https://smart-crm-api-production.up.railway.app/health"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 ml-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors whitespace-nowrap"
          >
            API Docs <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
