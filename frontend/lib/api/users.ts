import { api } from "./client";

export const userApi = {
  getAll: (params?: { role?: string; search?: string; page?: number; limit?: number }) => 
    api.get("/users", { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  updateProfile: (
    id: string,
    data: { name?: string; phone?: string; email?: string }
  ) => api.put(`/users/${id}`, data),
  updateRole: (id: string, role: string) => api.put(`/users/${id}/role`, { role }),
  delete: (id: string) => api.delete(`/users/${id}`),
};
