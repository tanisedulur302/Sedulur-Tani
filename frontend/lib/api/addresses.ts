import { api } from "./client";

export const addressApi = {
  getAll: () => api.get("/addresses"),
  getById: (id: string) => api.get(`/addresses/${id}`),
  create: (data: {
    label: string;
    recipient_name: string;
    phone: string;
    address_line: string;
    city: string;
    province: string;
    postal_code: string;
    is_default?: boolean;
  }) => api.post("/addresses", data),
  update: (
    id: string,
    data: {
      label?: string;
      recipient_name?: string;
      phone?: string;
      address_line?: string;
      city?: string;
      province?: string;
      postal_code?: string;
      is_default?: boolean;
    }
  ) => api.put(`/addresses/${id}`, data),
  delete: (id: string) => api.delete(`/addresses/${id}`),
};

export interface Destination {
  id: string;
  name: string;
  province?: string;
  type?: string;
}

export interface ShippingCost {
  service: string;
  description: string;
  cost: number;
  etd: string;
}

export interface ShippingCostRequest {
  origin: string;
  destination: string;
  weight: number;
  courier: string;
}

export interface ShippingCostResponse {
  costs: ShippingCost[];
  fromCache: boolean;
  cachedAt: string;
  expiresAt: string;
}

export const shippingApi = {
  /**
   * Get list of domestic destinations from static data
   */
  getDestinations: async (): Promise<any> => {
    const response = await api.get("/shipping/destinations");
    return response.data.data;
  },

  /**
   * Get provinces from backend
   */
  getProvinces: async (): Promise<any> => {
    const response = await api.get("/shipping/provinces");
    return {
      data: {
        data: response.data.data,
      },
    };
  },

  /**
   * Get cities by province from backend
   */
  getCities: async (provinceId?: string): Promise<any> => {
    const url = provinceId
      ? `/shipping/regencies?province_id=${provinceId}`
      : "/shipping/regencies";
    const response = await api.get(url);
    return {
      data: {
        data: response.data.data,
      },
    };
  },

  /**
   * Get regencies (alias for getCities for compatibility)
   */
  getRegencies: async (provinceId?: string): Promise<any> => {
    return shippingApi.getCities(provinceId);
  },

  /**
   * Get districts (kecamatan)
   */
  getDistricts: async (regencyId?: string): Promise<any> => {
    const url = regencyId
      ? `/shipping/districts?regency_id=${regencyId}`
      : "/shipping/districts";
    const response = await api.get(url);
    return {
      data: {
        data: response.data.data,
      },
    };
  },

  /**
   * Calculate shipping cost with caching
   */
  calculateCost: async (
    params: ShippingCostRequest
  ): Promise<ShippingCostResponse> => {
    const response = await api.post("/shipping/cost", params);
    return response.data.data;
  },

  /**
   * Clear expired cache (seller only)
   */
  clearExpiredCache: async (): Promise<number> => {
    const response = await api.delete("/shipping/cache/expired");
    return response.data.data.deletedCount;
  },

  /**
   * Clear all cache (seller only - for testing)
   */
  clearAllCache: async (): Promise<number> => {
    const response = await api.delete("/shipping/cache/all");
    return response.data.data.deletedCount;
  },
};
