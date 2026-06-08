import { api } from "./client";

export const cartApi = {
  getCart: () => api.get("/cart"),
  addToCart: (data: { productId: string; quantity: number }) =>
    api.post("/cart", { product_id: data.productId, quantity: data.quantity }),
  updateItem: (itemId: string, data: { quantity: number }) =>
    api.put(`/cart/${itemId}`, data),
  removeItem: (itemId: string) => api.delete(`/cart/${itemId}`),
};
