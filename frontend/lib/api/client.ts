import axios from "axios";
import { isTokenExpired } from "@/lib/utils/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://sedulur-tani-be.vercel.app";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Check if token is expired before making request
      if (isTokenExpired(token)) {
        // Token expired, clear storage and redirect
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("auth-changed"));

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(new Error("Token expired"));
      }

      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check various auth error scenarios
    const status = error.response?.status;
    const isAuthError = status === 401;
    const isForbiddenError = status === 403;
    const isUserNotFoundError =
      status === 404 && error.config?.url?.includes("/auth/me");

    // Jangan redirect jika error dari cart API (bisa jadi user belum punya cart)
    const isCartError = error.config?.url?.includes("/cart");

    // Handle token expired atau unauthorized
    if ((isAuthError || isUserNotFoundError) && !isCartError) {
      if (typeof window !== "undefined") {
        console.log("Session expired or unauthorized, redirecting to login...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("auth-changed"));
        window.location.href = "/login";
      }
    }

    // Handle forbidden (user doesn't have permission)
    if (isForbiddenError && !isCartError) {
      if (typeof window !== "undefined") {
        console.log("Access forbidden, redirecting to home...");
        // Redirect based on user role
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user.role === "seller" || user.role === "admin") {
              window.location.href = "/admin";
            } else {
              window.location.href = "/";
            }
          } catch {
            window.location.href = "/";
          }
        } else {
          window.location.href = "/";
        }
      }
    }

    return Promise.reject(error);
  },
);
