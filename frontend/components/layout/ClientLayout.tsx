"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";

type UserRole = "buyer" | "seller" | "admin" | null;

// Halaman yang hanya untuk buyer (tidak boleh diakses seller/admin)
const buyerOnlyRoutes = [
  "/",
  "/dashboard",
  "/categories",
  "/cart",
  "/checkout",
  "/orders",
  "/profile",
];

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

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const userRole = useSyncExternalStore(
    subscribe,
    getUserRole,
    getServerSnapshot,
  );
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isProductDetail = pathname?.startsWith("/products/");

  // Check if current route is buyer-only
  const isBuyerOnlyRoute = buyerOnlyRoutes.some((route) => {
    if (route === "/") return pathname === "/";
    if (route === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(route);
  });

  useEffect(() => {
    if (!isClient) return;

    // Jika admin/seller mengakses halaman buyer-only, redirect ke admin
    // Note: seller = admin karena penjual hanya 1
    if (userRole === "seller" || userRole === "admin") {
      // Biarkan akses ke halaman login/register
      if (isAuthRoute) return;

      // Biarkan akses ke detail produk (untuk melihat produk)
      if (isProductDetail) return;

      // Jika mengakses halaman buyer-only, redirect ke admin
      if (isBuyerOnlyRoute && !isAdminRoute) {
        router.push("/admin");
      }
    }
  }, [
    userRole,
    pathname,
    router,
    isAdminRoute,
    isAuthRoute,
    isBuyerOnlyRoute,
    isProductDetail,
    isClient,
  ]);

  // Jangan render jika seller/admin sedang di-redirect dari halaman buyer
  if (
    isClient &&
    (userRole === "seller" || userRole === "admin") &&
    isBuyerOnlyRoute &&
    !isAdminRoute &&
    !isProductDetail
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Mengalihkan ke dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't show Navbar/Footer on Admin routes
  const shouldShowNavFooter = !isAdminRoute;

  return (
    <AuthSessionProvider>
      <>
        {shouldShowNavFooter && <Navbar />}
        <main className={shouldShowNavFooter ? "min-h-screen" : ""}>
          {children}
        </main>
        {shouldShowNavFooter && <Footer />}
      </>
    </AuthSessionProvider>
  );
}
