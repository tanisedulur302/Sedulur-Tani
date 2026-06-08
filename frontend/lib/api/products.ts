import { api } from "./client";

export const productsApi = {
  getAll: (
    page?: number,
    limit?: number,
    params?: {
      seller_id?: string;
      search?: string;
      min_price?: number;
      max_price?: number;
      in_stock?: boolean;
      category?: string;
    }
  ) =>
    api.get("/products", {
      params: {
        page: page || 1,
        limit: limit || 12,
        ...params,
      },
    }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: FormData) =>
    api.post("/products", data, {
      headers: { "Content-Type": undefined } as any,
    }),
  update: (id: string, data: FormData) =>
    api.put(`/products/${id}`, data, {
      headers: { "Content-Type": undefined } as any,
    }),
  delete: (id: string) => api.delete(`/products/${id}`),
};
