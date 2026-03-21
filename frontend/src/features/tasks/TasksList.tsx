"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Circle, Plus, Calendar, ClipboardList, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { tasksService } from "@/services/tasks.service";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CreateTaskModal } from "@/features/tasks/CreateTaskModal";
import { useAuth } from "@/lib/auth-context";
import type { Task, TaskStatus } from "@/types";

const STATUS_TABS: { label: string; value: TaskStatus | "all" }[] = [
  { label: "All",         value: "all"       },
  { label: "Pending",     value: "Pending"   },
  { label: "In Progress", value: "InProgress"},
  { label: "Done",        value: "Done"      },
];

interface TaskRowProps {
  task: Task;
  onToggle: (id: string, isDone: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isManager: boolean;
}

function TaskRow({ task, onToggle, onEdit, onDelete, isManager }: TaskRowProps) {
  const isDone = task.status === "Done";
  const isOverdue = task.dueDate && !isDone && new Date(task.dueDate) < new Date();
  const assignedInitials = task.assignedTo?.fullName
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [menuOpen]);

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
        isDone ? "bg-gray-50 border-gray-100" : "bg-white border-gray-100 hover:border-indigo-200"
      }`}
    >
      <button
        onClick={() => onToggle(task.id, isDone)}
        title={isDone ? "Reopen task" : "Mark as done"}
        className={`mt-0.5 shrink-0 transition-colors ${
          isDone
            ? "text-emerald-500 hover:text-gray-400"
            : "text-gray-300 hover:text-indigo-500"
        }`}
      >
        {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium leading-snug ${isDone ? "text-gray-400 line-through" : "text-gray-900"}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <StatusBadge type="priority" status={task.priority} />
            {isManager && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-7 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[130px]">
                    <button
                      onClick={() => { setMenuOpen(false); onEdit(task); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); onDelete(task); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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
  const { isManager } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    tasksService
      .getAll({ status: filter !== "all" ? filter : undefined })
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  async function handleToggle(id: string, isDone: boolean) {
    const nextStatus: TaskStatus = isDone ? "Pending" : "Done";
    const prevStatus: TaskStatus = isDone ? "Done" : "Pending";
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
    try {
      if (isDone) {
        await tasksService.update(id, { status: "Pending" });
      } else {
        await tasksService.complete(id);
      }
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: prevStatus } : t)));
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTask) return;
    setDeleting(true);
    try {
      await tasksService.delete(deleteTask.id);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTask.id));
      setDeleteTask(null);
    } catch {
      // keep modal open on error
    } finally {
      setDeleting(false);
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

        {isManager && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        )}
      </div>

      <div className="space-y-2">
        {loading
          ? Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-xl border border-gray-100 animate-pulse" />
            ))
          : filtered.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={setEditTask}
                onDelete={setDeleteTask}
                isManager={isManager}
              />
            ))}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <ClipboardList className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">No tasks found</p>
            <p className="text-xs text-gray-400 mt-1">
              {filter !== "all" ? "Try a different filter." : "Add your first task to stay on track."}
            </p>
          </div>
        )}
      </div>

      {/* Create modal */}
      <CreateTaskModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(task) => setTasks((prev) => [task, ...prev])}
      />

      {/* Edit modal */}
      <CreateTaskModal
        open={!!editTask}
        onClose={() => setEditTask(null)}
        editTask={editTask}
        onCreated={() => {}}
        onUpdated={(updated) =>
          setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
        }
      />

      {/* Delete confirmation */}
      {deleteTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteTask(null); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Delete Task</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <span className="font-medium text-gray-900">"{deleteTask.title}"</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTask(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
