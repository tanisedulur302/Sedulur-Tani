import { api } from "./client";

export const dashboardApi = {
  getSellerStats: () => api.get("/dashboard/seller"),
  getAdminStats: () => api.get("/dashboard/admin"),
};
