"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User, Category, Product } from "@/lib/types";
import { cartApi, categoryApi, productsApi } from "@/lib/api";
import logo from "@/public/image/logo.png";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === "/" || pathname === "/dashboard";

  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [hideMenuTimeout, setHideMenuTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  useEffect(() => {
    // Check user on mount
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        fetchCartCount();
      } else {
        setUser(null);
        setCartCount(0);
      }
    };

    const fetchCartCount = async () => {
      try {
        const response = await cartApi.getCart();
        setCartCount(response.data.data.cart.total_items || 0);
      } catch (error: unknown) {
        // Jangan log error jika 401 (belum login) atau 404 (cart belum ada)
        const status = (error as { response?: { status?: number } }).response
          ?.status;
        if (status !== 401 && status !== 404) {
          console.error("Failed to fetch cart count:", error);
        }
        setCartCount(0);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        // Assuming response.data.data.categories based on typical response structure
        // Adjust if needed based on actual API response
        if (
          response.data &&
          response.data.data &&
          response.data.data.categories
        ) {
          setCategories(response.data.data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    loadUser();
    fetchCategories();

    // Listen for storage changes (login/logout)
    window.addEventListener("storage", loadUser);
    // Listen for cart updates
    window.addEventListener("cart-updated", fetchCartCount);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("cart-updated", fetchCartCount);
    };
  }, []);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const response = await productsApi.getAll(1, 5, {
            search: searchQuery,
          });
          setSearchResults(response.data.data?.products || []);
          setShowSearchDropdown(true);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchResultClick = (productId: string) => {
    setSearchQuery("");
    setShowSearchDropdown(false);
    setIsMobileMenuOpen(false);
    router.push(`/products/${productId}`);
  };

  useEffect(() => {
    // Scroll listener - only for dashboard
    const handleScroll = () => {
      if (isDashboard) {
        if (window.scrollY > 20) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      } else {
        // Always scrolled (white) on other pages
        setIsScrolled(true);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDashboard]);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    setIsLogoutDialogOpen(false);
    window.location.href = "/";
  };

  const handleCategoryClick = (categoryName: string) => {
    setShowCategoryMenu(false);
    setIsMobileMenuOpen(false);
    if (categoryName) {
      router.push(`/products?category=${encodeURIComponent(categoryName)}`);
    } else {
      router.push("/products");
    }
  };

  const handleMouseEnter = () => {
    // Clear any pending timeout
    if (hideMenuTimeout) {
      clearTimeout(hideMenuTimeout);
      setHideMenuTimeout(null);
    }
    setShowCategoryMenu(true);
  };

  const handleMouseLeave = () => {
    // Set timeout to hide menu after 300ms
    const timeout = setTimeout(() => {
      setShowCategoryMenu(false);
    }, 300);
    setHideMenuTimeout(timeout);
  };

  // FIX: Helper to check if user is admin or seller
  const isAdminOrSeller = user?.role === "seller";

  return (
    <div>
      {/* Main Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all backdrop-blur-xl duration-300 border-b border-gray-300 ${
          isScrolled
            ? "bg-white text-gray-800 shadow-md"
            : "bg-transparent text-white"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 lg:gap-3">
              <div className="relative">
                <Image
                  src={logo}
                  alt="Sedulur Tani Logo"
                  width={96}
                  height={96}
                  className="w-16 lg:w-24 h-auto"
                />
              </div>
              <div>
                <div
                  className={`text-lg lg:text-2xl font-bold tracking-tight transition-colors ${
                    isScrolled ? "text-[#308A50]" : "text-white"
                  }`}
                >
                  Sedulur Tani
                </div>
                <div
                  className={`text-[10px] lg:text-xs -mt-1 font-medium transition-colors ${
                    isScrolled ? "text-gray-500" : "text-white/80"
                  }`}
                >
                  Pupuk Berkualitas Terbaik
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Home */}
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 group relative ${
                  isScrolled
                    ? "hover:bg-gray-100 text-gray-700"
                    : "hover:bg-white/10 text-white"
                }`}
              >
                <span className="font-medium">Beranda</span>
                {pathname === "/" && (
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full transition-all duration-300 ${
                      isScrolled ? "bg-emerald-600" : "bg-white"
                    }`}
                  />
                )}
              </Link>

              {/* Produk */}
              <Link
                href="/products"
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 group relative ${
                  isScrolled
                    ? "hover:bg-gray-100 text-gray-700"
                    : "hover:bg-white/10 text-white"
                }`}
              >
                <span className="font-medium">Produk</span>
                {pathname === "/products" && (
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full transition-all duration-300 ${
                      isScrolled ? "bg-emerald-600" : "bg-white"
                    }`}
                  />
                )}
              </Link>

              {/* Kategori with Dropdown on Hover */}
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  suppressHydrationWarning
                  className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-1 relative ${
                    isScrolled
                      ? "hover:bg-gray-100 text-gray-700"
                      : "hover:bg-white/10 text-white"
                  }`}
                >
                  <span>Kategori</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      showCategoryMenu ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  {pathname === "/categories" && (
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full transition-all duration-300 ${
                        isScrolled ? "bg-emerald-600" : "bg-white"
                      }`}
                    />
                  )}
                </button>

                {showCategoryMenu && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="mb-3 pb-2 border-b border-gray-100 flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-500">
                        Kategori Pilihan
                      </span>
                      <Link
                        href="/categories"
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        Lihat Semua Kategori
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleCategoryClick("")}
                        className="text-left px-3 py-3 rounded-xl text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200 font-medium text-sm flex items-center gap-3 group border border-transparent hover:border-emerald-100"
                      >
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
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
                              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 group-hover:text-emerald-700">
                            Semua Produk
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Lihat semua koleksi
                          </span>
                        </div>
                      </button>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.name)}
                            className="text-left px-3 py-3 rounded-xl text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200 font-medium text-sm flex items-center gap-3 group border border-transparent hover:border-emerald-100"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative flex items-center justify-center text-gray-400 font-bold">
                              {category.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-bold text-gray-800 group-hover:text-emerald-700 truncate w-full">
                                {category.name}
                              </span>
                              {category.description && (
                                <span className="text-[10px] text-gray-400 truncate w-full">
                                  {category.description}
                                </span>
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="col-span-3 py-4 text-center text-gray-400 text-sm">
                          Belum ada kategori tersedia
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Search Bar Desktop */}
              <div className="relative hidden lg:block">
                <div
                  className={`flex items-center px-4 py-2 rounded-full transition-all w-64 focus-within:w-80 ${
                    isScrolled
                      ? "bg-gray-100 border border-gray-300 text-gray-700"
                      : "bg-white/20 backdrop-blur-sm text-white"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-2 opacity-70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-4.35-4.35m1.4-5.4a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z"
                    />
                  </svg>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowSearchDropdown(true);
                    }}
                    onBlur={() => {
                      // Delay hiding to allow click event on result
                      setTimeout(() => setShowSearchDropdown(false), 200);
                    }}
                    placeholder="Cari pupuk, tanaman..."
                    className={`bg-transparent w-full outline-none placeholder:text-sm ${
                      isScrolled
                        ? "text-gray-800 placeholder-gray-500"
                        : "text-white placeholder-white/70"
                    }`}
                  />
                  {isSearching && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current opacity-70"></div>
                  )}
                </div>

                {/* Search Dropdown */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSearchResultClick(product.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={
                              product.image_url ||
                              "https://via.placeholder.com/100"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium text-gray-900 truncate w-full">
                            {product.name}
                          </span>
                          <span className="text-xs text-gray-500 truncate w-full">
                            {product.category}
                          </span>
                        </div>
                      </button>
                    ))}
                    <div className="p-2 bg-gray-50 text-center">
                      <Link
                        href={`/products?search=${searchQuery}`}
                        className="text-xs text-emerald-600 font-medium hover:underline"
                      >
                        Lihat semua hasil
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isScrolled
                        ? "hover:bg-gray-100 text-gray-700"
                        : "hover:bg-white/10 text-white"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium max-w-[100px] truncate hidden md:block">
                      {user.name}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b border-gray-100 mb-2">
                          <p className="text-sm text-gray-500">Masuk sebagai</p>
                          <p className="font-bold text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-emerald-600 font-medium capitalize">
                            {isAdminOrSeller ? "Admin / Penjual" : "Pembeli"}
                          </p>
                        </div>

                        {isAdminOrSeller && (
                          <div>
                            <Link
                              href="/admin/products"
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                              </svg>
                              Produk Saya
                            </Link>
                            <Link
                              href="/admin/orders"
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                              Pesanan Masuk
                            </Link>
                          </div>
                        )}

                        {user?.role === "buyer" && (
                          <div>
                            <Link
                              href="/cart"
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors justify-between group"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <div className="flex items-center gap-3">
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                  />
                                </svg>
                                Keranjang
                              </div>
                              {cartCount > 0 && (
                                <span className="bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                  {cartCount}
                                </span>
                              )}
                            </Link>
                            <Link
                              href="/orders"
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                              </svg>
                              Pesanan Saya
                            </Link>
                          </div>
                        )}

                        <div className="border-t border-gray-100 my-2 pt-2">
                          <Link
                            href={
                              isAdminOrSeller ? "/admin/settings" : "/profile"
                            }
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Profil Saya
                          </Link>
                          <button
                            onClick={() => {
                              setIsLogoutDialogOpen(true);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                          >
                            <svg
                              className="w-5 h-5"
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
                            Keluar
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isScrolled
                        ? "text-gray-700 hover:text-[#308A50]"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="w-full bg-[#308A50] hover:bg-[#276D3F] px-4 py-3 rounded-lg font-medium text-white shadow-md text-center block transition-colors"
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Actions - Cart & Menu Button */}
            <div className="flex lg:hidden items-center gap-3">
              {user?.role === "buyer" && (
                <Link
                  href="/cart"
                  className="relative p-2 rounded-lg transition-colors hover:bg-gray-100"
                >
                  <svg
                    className={`w-6 h-6 ${isScrolled ? "text-gray-700" : "text-white"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled
                    ? "hover:bg-gray-100 text-gray-700"
                    : "hover:bg-white/10 text-white"
                }`}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
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
                ) : (
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
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 lg:hidden mt-16"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Menu Panel */}
          <div className="fixed top-16 right-0 bottom-0 w-full sm:w-80 bg-white shadow-2xl z-70 lg:hidden overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                <p className="text-xs text-gray-500">Navigasi Sedulur Tani</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info or Login/Register */}
              {user ? (
                <div className="bg-linear-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-emerald-700 font-medium mb-1">
                        Halo,
                      </p>
                      <p className="font-bold text-gray-900 truncate text-base">
                        {user.name}
                      </p>
                      <p className="text-xs text-emerald-600 font-semibold capitalize mt-1 inline-flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {isAdminOrSeller ? "Admin / Penjual" : "Pembeli"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full bg-white border-2 border-emerald-600 text-emerald-600 px-5 py-3.5 rounded-xl font-semibold text-center block hover:bg-emerald-50 transition-all shadow-sm hover:shadow-md"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-5 py-3.5 rounded-xl font-semibold text-white text-center block transition-all shadow-md hover:shadow-lg"
                  >
                    Daftar Sekarang
                  </Link>
                </div>
              )}

              {/* Search Bar Mobile */}
              <div className="relative">
                <div className="flex items-center px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-4.35-4.35m1.4-5.4a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    placeholder="Cari pupuk, tanaman..."
                    className="bg-transparent w-full outline-none text-gray-800 placeholder-gray-500 text-sm"
                  />
                  {isSearching && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                  )}
                </div>

                {/* Mobile Search Results */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSearchResultClick(product.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={
                              product.image_url ||
                              "https://via.placeholder.com/100"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </span>
                          <span className="text-xs text-gray-500 truncate">
                            {product.category}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    pathname === "/"
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Beranda
                </Link>

                <Link
                  href="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    pathname === "/products"
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  Produk
                </Link>

                {/* Mobile Category Dropdown */}
                <div>
                  <button
                    onClick={() =>
                      setIsMobileCategoryOpen(!isMobileCategoryOpen)
                    }
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                      Kategori
                    </div>
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        isMobileCategoryOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Category List */}
                  {isMobileCategoryOpen && (
                    <div className="mt-2 ml-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      <button
                        onClick={() => handleCategoryClick("")}
                        className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      >
                        Semua Produk
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryClick(category.name)}
                          className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </nav>

              {/* User Menu Items */}
              {user && (
                <div className="pt-6 border-t border-gray-200 space-y-2">
                  {isAdminOrSeller && (
                    <>
                      <Link
                        href="/admin/products"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        Produk Saya
                      </Link>
                      <Link
                        href="/admin/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Pesanan Masuk
                      </Link>
                    </>
                  )}

                  {user?.role === "buyer" && (
                    <Link
                      href="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      Pesanan Saya
                    </Link>
                  )}

                  <Link
                    href={isAdminOrSeller ? "/admin/settings" : "/profile"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profil Saya
                  </Link>

                  <button
                    onClick={() => {
                      setIsLogoutDialogOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
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
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Logout Confirmation Dialog */}
      {isLogoutDialogOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsLogoutDialogOpen(false)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600"
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
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Keluar</h3>
                    <p className="text-sm text-gray-500">Logout dari akun</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin keluar dari akun? Anda perlu login
                  kembali untuk mengakses akun Anda.
                </p>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setIsLogoutDialogOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
