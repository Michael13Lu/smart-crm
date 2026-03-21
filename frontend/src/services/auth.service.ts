import api from "@/lib/axios";
import type { AuthResponse, User } from "@/types";

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/api/auth/login", { email, password });
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>("/api/auth/me");
    return data;
  },

  async getUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>("/api/auth/users");
    return data;
  },
};
