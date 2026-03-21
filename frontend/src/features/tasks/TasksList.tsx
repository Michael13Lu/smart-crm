"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Plus, Calendar } from "lucide-react";
import { tasksService } from "@/services/tasks.service";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Task, TaskStatus } from "@/types";

const STATUS_TABS: { label: string; value: TaskStatus | "all" }[] = [
  { label: "All",         value: "all"       },
  { label: "Pending",     value: "Pending"   },
  { label: "In Progress", value: "InProgress"},
  { label: "Done",        value: "Done"      },
];

function TaskRow({ task, onComplete }: { task: Task; onComplete: (id: string) => void }) {
  const isDone = task.status === "Done";
  const isOverdue = task.dueDate && !isDone && new Date(task.dueDate) < new Date();
  const assignedInitials = task.assignedTo?.fullName
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
        isDone ? "bg-gray-50 border-gray-100" : "bg-white border-gray-100 hover:border-indigo-200"
      }`}
    >
      <button
        onClick={() => !isDone && onComplete(task.id)}
        className={`mt-0.5 shrink-0 transition-colors ${
          isDone ? "text-emerald-500" : "text-gray-300 hover:text-indigo-500"
        }`}
      >
        {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium leading-snug ${isDone ? "text-gray-400 line-through" : "text-gray-900"}`}>
            {task.title}
          </p>
          <StatusBadge type="priority" status={task.priority} />
        </div>

        {task.description && !isDone && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>
        )}

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
              <Calendar className="w-3 h-3" />
              {isOverdue ? "Overdue · " : ""}
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.assignedTo && (
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-[8px] font-bold text-indigo-700">{assignedInitials}</span>
              </div>
              <span className="text-xs text-gray-400">{task.assignedTo.fullName}</span>
            </div>
          )}
          {task.relatedLead && (
            <span className="text-xs text-gray-400 truncate">Lead: {task.relatedLead.name}</span>
          )}
          {task.relatedDeal && (
            <span className="text-xs text-gray-400 truncate">Deal: {task.relatedDeal.name}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function TasksList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    tasksService
      .getAll({ status: filter !== "all" ? filter : undefined })
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  async function handleComplete(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Done" as TaskStatus } : t)));
    try {
      await tasksService.complete(id);
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Pending" as TaskStatus } : t)));
    }
  }

  const allTasks = tasks;
  const counts = {
    all: allTasks.length,
    Pending:    allTasks.filter((t) => t.status === "Pending").length,
    InProgress: allTasks.filter((t) => t.status === "InProgress").length,
    Done:       allTasks.filter((t) => t.status === "Done").length,
  };

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === tab.value
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  filter === tab.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {counts[tab.value as keyof typeof counts] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      <div className="space-y-2">
        {loading
          ? Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-xl border border-gray-100 animate-pulse" />
            ))
          : filtered.map((task) => (
              <TaskRow key={task.id} task={task} onComplete={handleComplete} />
            ))}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">No tasks here.</div>
        )}
      </div>
    </div>
  );
}
