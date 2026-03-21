import api from "@/lib/axios";
import type { Task, TaskPriority } from "@/types";

export const tasksService = {
  async getAll(params?: { status?: string; assignedTo?: string }): Promise<Task[]> {
    const { data } = await api.get<Task[]>("/api/tasks", { params });
    return data;
  },

  async getById(id: string): Promise<Task> {
    const { data } = await api.get<Task>(`/api/tasks/${id}`);
    return data;
  },

  async create(payload: {
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: string;
    assignedToId?: string;
    relatedLeadId?: string;
    relatedDealId?: string;
  }): Promise<Task> {
    const { data } = await api.post<Task>("/api/tasks", payload);
    return data;
  },

  async update(id: string, payload: Partial<Task & { assignedToId?: string }>): Promise<Task> {
    const { data } = await api.put<Task>(`/api/tasks/${id}`, payload);
    return data;
  },

  async complete(id: string): Promise<Task> {
    const { data } = await api.patch<Task>(`/api/tasks/${id}/complete`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/tasks/${id}`);
  },
};
