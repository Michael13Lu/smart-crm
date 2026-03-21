import api from "@/lib/axios";
import type { Deal, DealStage } from "@/types";

export const dealsService = {
  async getAll(params?: { stage?: string }): Promise<Deal[]> {
    const { data } = await api.get<Deal[]>("/api/deals", { params });
    return data;
  },

  async getById(id: string): Promise<Deal> {
    const { data } = await api.get<Deal>(`/api/deals/${id}`);
    return data;
  },

  async create(payload: {
    title: string;
    value: number;
    stage: DealStage;
    notes?: string;
    closingDate?: string;
    leadId?: string;
    assignedToId?: string;
  }): Promise<Deal> {
    const { data } = await api.post<Deal>("/api/deals", payload);
    return data;
  },

  async update(id: string, payload: Partial<Deal & { assignedToId?: string; leadId?: string }>): Promise<Deal> {
    const { data } = await api.put<Deal>(`/api/deals/${id}`, payload);
    return data;
  },

  async updateStage(id: string, stage: DealStage): Promise<Deal> {
    const { data } = await api.patch<Deal>(`/api/deals/${id}/stage`, { stage });
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/deals/${id}`);
  },
};
