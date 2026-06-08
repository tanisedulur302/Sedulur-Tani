"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { checkAuthStatus } from "@/lib/utils/auth";

/**
 * Component untuk mengecek session user di setiap halaman
 * Jika session sudah expired, redirect ke login page
 */
export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check auth status on mount
    const authStatus = checkAuthStatus();

    if (authStatus === "expired") {
      // Token sudah expired, redirect ke login
      console.log("Session expired, redirecting to login...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("auth-changed"));

      // Jangan redirect jika sudah di login/register page
      if (pathname !== "/login" && pathname !== "/register") {
        router.push("/login");
      }
    }
  }, [router, pathname]);

  // Juga check setiap kali user navigate
  useEffect(() => {
    // const handleBeforeUnload = () => {
    //   validateAndCleanupToken();
    // };

    const handleTokenChange = () => {
      const authStatus = checkAuthStatus();
      if (authStatus === "expired") {
        // Redirect ke login jika token expired saat navigasi
        if (pathname !== "/login" && pathname !== "/register") {
          router.push("/login");
        }
      }
    };

    window.addEventListener("storage", handleTokenChange);
    window.addEventListener("auth-changed", handleTokenChange);

    return () => {
      window.removeEventListener("storage", handleTokenChange);
      window.removeEventListener("auth-changed", handleTokenChange);
    };
  }, [router, pathname]);

  return <>{children}</>;
}

/**
 * Higher Order Component untuk protect routes
 * Gunakan di pages yang memerlukan autentikasi
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
) {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const [authStatus, setAuthStatus] = useState<
      "loading" | "authenticated" | "expired" | "no-token"
    >("loading");

    useEffect(() => {
      const status = checkAuthStatus();
      setAuthStatus(status);

      if (status !== "authenticated") {
        // Redirect ke login jika tidak authenticated
        console.log("Access denied, redirecting to login...");
        router.push("/login");
      }
    }, [router]);

    if (authStatus === "loading") {
      return (
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#308A50]"></div>
        </div>
      );
    }

    if (authStatus !== "authenticated") {
      return null; // Tidak render component jika tidak authenticated
    }

    return <Component {...props} />;
  };
}
