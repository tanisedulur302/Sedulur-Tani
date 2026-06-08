"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { isTokenExpired } from "@/lib/utils/auth";

type AuthStatus = "loading" | "authorized" | "unauthorized" | "no-user";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
    setShowLogoutModal(false);
    router.push("/login");
  };

  // Check auth status on mount (client-side only)
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      // Check if token is expired
      if (token && isTokenExpired(token)) {
        console.log("Admin token expired, logging out...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-changed"));
        setAuthStatus("no-user");
        return;
      }

      // Jika tidak ada token DAN tidak ada user, baru redirect
      if (!token && !userStr) {
        setAuthStatus("no-user");
        return;
      }

      // Jika ada token tapi tidak ada user, coba parse dari token atau tunggu
      if (token && !userStr) {
        // Mungkin user data belum ter-set, tunggu sebentar
        setTimeout(() => {
          const retryUserStr = localStorage.getItem("user");
          if (retryUserStr) {
            try {
              const user = JSON.parse(retryUserStr);
              if (user.role === "seller" || user.role === "admin") {
                setAuthStatus("authorized");
              } else {
                setAuthStatus("unauthorized");
              }
            } catch {
              setAuthStatus("no-user");
            }
          } else {
            setAuthStatus("no-user");
          }
        }, 100);
        return;
      }

      try {
        const user = JSON.parse(userStr!);
        if (user.role === "seller" || user.role === "admin") {
          setAuthStatus("authorized");
        } else {
          setAuthStatus("unauthorized");
        }
      } catch {
        setAuthStatus("no-user");
      }
    };

    checkAuth();

    // Listen for storage changes
    window.addEventListener("storage", checkAuth);

    // Juga listen custom event untuk login/logout dari tab yang sama
    const handleAuthChange = () => checkAuth();
    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  // Handle redirects
  useEffect(() => {
    if (authStatus === "no-user") {
      router.push("/login");
    } else if (authStatus === "unauthorized") {
      router.push("/");
    }
  }, [authStatus, router]);

  // Show loading while checking auth
  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (authStatus !== "authorized") return null;

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    },
    {
      name: "Produk",
      href: "/admin/products",
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    },
    {
      name: "Kategori",
      href: "/admin/categories",
      icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
    },
    {
      name: "Pesanan",
      href: "/admin/orders",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    },
    {
      name: "Pengguna",
      href: "/admin/users",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
    {
      name: "Laporan",
      href: "/admin/reports",
      icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
      name: "Pengaturan",
      href: "/admin/settings",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay untuk mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-all duration-300 ${
          isMobileOpen
            ? "opacity-100 backdrop-blur-sm"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar - Hover to expand on desktop with smooth animations */}
      <aside
        className="bg-linear-to-b from-[#064e3b] to-[#065f46] text-white fixed top-0 left-0 h-screen z-50 overflow-hidden border-r border-emerald-800 group/sidebar shadow-2xl
          w-20 hover:w-64 transition-all duration-300 ease-in-out hidden md:block"
      >
        <div className="flex flex-col h-full w-64">
          {/* Header */}
          <div className="flex items-center h-16 px-4 border-b border-emerald-800/50 shrink-0 bg-emerald-950/30">
            <Link href="/" className="flex items-center gap-3 overflow-hidden">
              <Image
                src="/image/logo.png"
                alt="Sedulur Tani"
                width={40}
                height={40}
                className="object-contain shrink-0"
              />
              <span className="text-lg font-bold text-white tracking-tight whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
                Sedulur Tani
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3 py-6 overflow-y-auto overflow-x-hidden">
            <div className="mb-2 px-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
              Menu Utama
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  title={item.name}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group/item ${
                    pathname === item.href
                      ? "bg-white/10 text-white font-medium shadow-sm backdrop-blur-sm border border-white/5"
                      : "text-emerald-100 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 shrink-0 ${
                      pathname === item.href
                        ? "text-emerald-400"
                        : "text-emerald-300 group-hover/item:text-white"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-emerald-800/50 bg-emerald-950/30">
            <div className="flex items-center gap-3 mb-3 px-2 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold border border-emerald-600 shrink-0">
                A
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">
                  Admin User
                </p>
                <p className="text-xs text-emerald-300 truncate">
                  admin@sedulurtani.com
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              title="Sign Out"
              className="flex items-center justify-center gap-2 text-red-200 hover:text-white hover:bg-red-500/20 w-full px-4 py-2 rounded-lg text-sm font-medium"
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar - Slide in/out */}
      <aside
        className={`bg-[#064e3b] text-white fixed top-0 left-0 h-screen z-50 w-64 md:hidden
          transition-transform duration-300 ease-in-out border-r border-emerald-800
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-emerald-800/50 shrink-0 bg-emerald-950/30">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/image/logo.png"
                alt="Sedulur Tani"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-lg font-bold text-white tracking-tight">
                Sedulur Tani
              </span>
            </Link>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="text-emerald-200 hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3 py-6 overflow-y-auto">
            <div className="mb-2 px-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Menu Utama
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group ${
                    pathname === item.href
                      ? "bg-white/10 text-white font-medium shadow-sm backdrop-blur-sm border border-white/5"
                      : "text-emerald-100 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 shrink-0 ${
                      pathname === item.href
                        ? "text-emerald-400"
                        : "text-emerald-300 group-hover:text-white"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-emerald-800/50 bg-emerald-950/30">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold border border-emerald-600">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Admin User
                </p>
                <p className="text-xs text-emerald-300 truncate">
                  admin@sedulurtani.com
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center justify-center gap-2 text-red-200 hover:text-white hover:bg-red-500/20 w-full px-4 py-2 rounded-lg text-sm font-medium"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-20 min-h-screen flex flex-col bg-gray-50">
        {/* Header - Mobile only toggle */}
        <header className="md:hidden bg-white shadow-sm h-16 flex items-center justify-between px-4 sticky top-0 z-40">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <span className="font-bold text-gray-900">Admin Panel</span>
          <div className="w-10"></div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">{children}</main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Konfirmasi Logout
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Apakah Anda yakin ingin keluar dari admin panel? Anda perlu
                login kembali untuk mengakses halaman ini.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Ya, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
