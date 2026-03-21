import api from "@/lib/axios";
import type { DashboardStats } from "@/types";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>("/api/dashboard/stats");
    return data;
  },
};
