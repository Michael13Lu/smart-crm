import api from "@/lib/axios";
import type { Lead } from "@/types";

export const leadsService = {
  async getAll(params?: { status?: string; search?: string }): Promise<Lead[]> {
    const { data } = await api.get<Lead[]>("/api/leads", { params });
    return data;
  },

  async getById(id: string): Promise<Lead> {
    const { data } = await api.get<Lead>(`/api/leads/${id}`);
    return data;
  },

  async create(payload: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    source?: string;
    notes?: string;
    assignedToId?: string;
  }): Promise<Lead> {
    const { data } = await api.post<Lead>("/api/leads", payload);
    return data;
  },

  async update(id: string, payload: Partial<Lead & { assignedToId?: string }>): Promise<Lead> {
    const { data } = await api.put<Lead>(`/api/leads/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/leads/${id}`);
  },
};
