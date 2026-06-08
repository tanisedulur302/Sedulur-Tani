import { api } from "./client";

export const categoryApi = {
  getAll: () => api.get("/categories"),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: FormData) =>
    api.post("/categories", data, {
      headers: { "Content-Type": undefined } as any,
    }),
  update: (id: string, data: FormData) =>
    api.put(`/categories/${id}`, data, {
      headers: { "Content-Type": undefined } as any,
    }),
  delete: (id: string) => api.delete(`/categories/${id}`),
};
