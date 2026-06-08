"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type UserRole = "buyer" | "seller" | "admin" | null;

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

function getUserRole(): UserRole {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    return user.role || null;
  } catch {
    return null;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("auth-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("auth-changed", callback);
  };
}

function getServerSnapshot(): UserRole {
  return null;
}

export function useUserRole(): UserRole {
  return useSyncExternalStore(subscribe, getUserRole, getServerSnapshot);
}

export function useIsAuthenticated(): boolean {
  const role = useUserRole();
  return role !== null;
}

export default function RoleGuard({
  children,
  allowedRoles,
  redirectTo,
}: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const userRole = useUserRole();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Belum login
    if (userRole === null) {
      // Jika halaman memerlukan login, redirect ke login
      if (allowedRoles.length > 0 && !allowedRoles.includes(null)) {
        router.push("/login");
      }
      return;
    }

    // Sudah login tapi role tidak diizinkan
    if (!allowedRoles.includes(userRole)) {
      // Redirect berdasarkan role
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        // Default redirect berdasarkan role
        if (userRole === "seller" || userRole === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    }
  }, [userRole, allowedRoles, redirectTo, router, pathname, isClient]);

  // Show loading during SSR or initial client render
  if (!isClient) {
    return null;
  }

  // Jika role tidak diizinkan, jangan render children
  if (userRole !== null && !allowedRoles.includes(userRole)) {
    return null;
  }

  // Jika belum login dan halaman memerlukan login
  if (userRole === null && !allowedRoles.includes(null)) {
    return null;
  }

  return <>{children}</>;
}
