import { api } from "./client";

export const checkoutApi = {
  create: (data: {
    addressId: string;
    items: { productId: string; quantity: number }[];
    shippingCost: number;
    notes?: string;
    shipping_method?: string;
  }) =>
    api.post("/checkout", {
      address_id: data.addressId,
      items: data.items,
      shipping_cost: data.shippingCost,
      notes: data.notes,
      shipping_method: data.shipping_method,
    }),
  getById: (id: string) => api.get(`/checkout/${id}`),
};

export const paymentApi = {
  create: (data: { checkout_id: string }) => api.post("/payments/create", data),
  getStatus: (checkoutId: string) => api.get(`/payments/${checkoutId}`),
};

export const ordersApi = {
  getAll: (params?: { status?: string }) => api.get("/orders", { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (
    id: string,
    data: { status: string; courier_name?: string; tracking_number?: string }
  ) => api.put(`/orders/${id}/status`, data),
};
