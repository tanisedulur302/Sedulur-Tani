"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { productsApi, cartApi, categoryApi } from "@/lib/api";
import { Product, PaginationMeta, Category } from "@/lib/types";
import Alert from "@/components/shared/Alert";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Read category from URL on mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data.data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const itemsPerPage = 12;

  // Sort
  const [sortBy, setSortBy] = useState("newest");

  interface ProductApiParams {
    search?: string;
    category?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
  }

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const apiParams: ProductApiParams = {};

      if (search) apiParams.search = search;
      if (category) apiParams.category = category;
      if (minPrice) apiParams.min_price = Number(minPrice);
      if (maxPrice) apiParams.max_price = Number(maxPrice);

      if (!category) {
        apiParams.in_stock = true;
      }

      const response = await productsApi.getAll(
        currentPage,
        itemsPerPage,
        apiParams,
      );
      let fetchedProducts = response.data.data?.products || [];
      const paginationData = response.data.data?.pagination;

      // Sort products locally (client-side)
      if (sortBy === "price_low") {
        fetchedProducts = [...fetchedProducts].sort(
          (a, b) => (a.price || 0) - (b.price || 0),
        );
      } else if (sortBy === "price_high") {
        fetchedProducts = [...fetchedProducts].sort(
          (a, b) => (b.price || 0) - (a.price || 0),
        );
      } else if (sortBy === "name") {
        fetchedProducts = [...fetchedProducts].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      }

      setProducts(fetchedProducts);

      if (paginationData) {
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, currentPage, itemsPerPage, sortBy]);

  // Debounce search and reset page on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, category, minPrice, maxPrice, sortBy]);

  // Fetch when page changes or filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = async (productId: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setAddingToCart(productId);
      await cartApi.addToCart({
        productId: productId,
        quantity: 1,
      });
      setAlertConfig({
        title: "Berhasil",
        message: "Produk berhasil ditambahkan ke keranjang!",
        type: "success",
      });
      setShowAlert(true);
      window.dispatchEvent(new Event("cart-updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("Failed to add to cart:", error);
      const errorMessage =
        error instanceof Error
          ? (error as Error & { response?: { data?: { message?: string } } })
              .response?.data?.message || error.message
          : "Gagal menambahkan ke keranjang";
      setAlertConfig({
        title: "Gagal",
        message: errorMessage,
        type: "error",
      });
      setShowAlert(true);
    } finally {
      setAddingToCart(null);
    }
  };

  const activeFiltersCount = [category, search, minPrice, maxPrice].filter(
    Boolean,
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 pt-20 sm:pt-24">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            {category
              ? `Produk ${
                  categories.find((c) => c.id === category)?.name || "Kategori"
                }`
              : "Semua Produk"}
          </h1>
          {category && (
            <button
              onClick={() => {
                setCategory("");
                router.push("/products");
              }}
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm sm:text-base"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali ke Semua Produk
            </button>
          )}

          {/* Search Bar & Filter Toggle - Mobile */}
          <div className="mt-4 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm sm:text-base"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Filter Toggle Button - Mobile */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filter
                {activeFiltersCount > 0 && (
                  <span className="bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white font-medium text-gray-700"
              >
                <option value="newest">Terbaru</option>
                <option value="name">A-Z</option>
                <option value="price_low">Termurah</option>
                <option value="price_high">Termahal</option>
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4 animate-in slide-in-from-top duration-200">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value) {
                      router.push(`/products?category=${e.target.value}`);
                    } else {
                      router.push("/products");
                    }
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rentang Harga
                </label>
                <div className="flex flex-col sm:flex-row sm:gap-2 sm:items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                  <span className="hidden sm:block text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Filter Aktif ({activeFiltersCount})
                    </span>
                    <button
                      onClick={() => {
                        setCategory("");
                        setSearch("");
                        setMinPrice("");
                        setMaxPrice("");
                        router.push("/products");
                      }}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Reset Semua
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs border border-emerald-200">
                        {categories.find((c) => c.id === category)?.name}
                        <button
                          onClick={() => {
                            setCategory("");
                            router.push("/products");
                          }}
                          className="hover:text-emerald-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {search && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs border border-blue-200">
                        &quot;{search}&quot;
                        <button
                          onClick={() => setSearch("")}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {(minPrice || maxPrice) && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs border border-purple-200">
                        Rp {minPrice || "0"} - {maxPrice || "∞"}
                        <button
                          onClick={() => {
                            setMinPrice("");
                            setMaxPrice("");
                          }}
                          className="hover:text-purple-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Info */}
          {!loading && products.length > 0 && (
            <div className="mt-3 text-sm text-gray-600">
              Menampilkan {products.length} produk
              {pagination && ` dari ${pagination.total} total`}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-9 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 overflow-hidden group flex flex-col"
              >
                <Link
                  href={`/products/${product.id}`}
                  className="block relative aspect-square bg-linear-to-br from-gray-100 to-gray-200 overflow-hidden"
                >
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                      <svg
                        className="w-12 sm:w-16 h-12 sm:h-16 mb-1 sm:mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm font-medium">
                        No Image
                      </span>
                    </div>
                  )}
                  {(product.stock || 0) === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Stok Habis
                      </span>
                    </div>
                  )}
                </Link>

                <div className="flex-1 flex flex-col px-2.5 sm:px-3 py-2.5 sm:py-3">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm sm:text-base font-bold text-emerald-600">
                      Rp {product.price?.toLocaleString("id-ID") || "0"}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${
                        (product.stock || 0) > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      Stok: {product.stock || 0}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 p-3 border-t border-gray-100">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 flex items-center justify-center rounded-lg border-2 border-emerald-600 bg-white py-1.5 text-center text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 sm:py-2 sm:text-sm"
                  >
                    Detail
                  </Link>

                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={
                      addingToCart === product.id || (product.stock || 0) === 0
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:h-11 sm:w-11"
                  >
                    {addingToCart === product.id ? (
                      <svg
                        className="h-4 w-4 animate-spin text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5"
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
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-gray-100">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
              Produk tidak ditemukan
            </h3>
            <p className="text-sm sm:text-base text-gray-500 px-4">
              Coba ubah kata kunci atau filter Anda.
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading &&
          products.length > 0 &&
          pagination &&
          pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 sm:px-3 sm:py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex gap-1 sm:gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => (
                    <div
                      key={page}
                      className="flex items-center gap-1 sm:gap-2"
                    >
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="text-gray-400 text-sm">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                          currentPage === page
                            ? "bg-emerald-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(pagination.totalPages, prev + 1),
                  )
                }
                disabled={currentPage === pagination.totalPages}
                className="p-2 sm:px-3 sm:py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
      </main>

      {/* Alert Component */}
      {showAlert && (
        <Alert
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat produk...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
