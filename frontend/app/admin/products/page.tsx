"use client";

import { useEffect, useState, useCallback } from "react";
import { productsApi, categoryApi } from "@/lib/api";
import { Product, Category } from "@/lib/types";
import { toast } from "@/lib/toast";
import Image from "next/image";
import { exportToCSV, exportToPDF } from "@/lib/utils/export";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);

  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Store all products for client-side filtering
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchAllProducts(); // Fetch all products once for filtering
  }, []);

  // Fetch products when page or items per page changes (only when no filters)
  useEffect(() => {
    if (!searchQuery && !selectedCategory) {
      fetchProducts();
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedCategory]);

  const fetchAllProducts = async () => {
    try {
      // Fetch a large number to get all products for filtering
      const response = await productsApi.getAll(1, 1000);
      const productsData =
        response.data?.data?.products || response.data?.products || [];
      setAllProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch all products:", error);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll(currentPage, itemsPerPage);
      const productsData =
        response.data?.data?.products || response.data?.products || [];
      const paginationData =
        response.data?.data?.pagination || response.data?.pagination;

      setProducts(productsData);

      if (paginationData?.total) {
        setTotalProducts(paginationData.total);
      } else {
        setTotalProducts(productsData.length);
      }
    } catch (error: unknown) {
      console.error("Failed to fetch products:", error);
      const errorResponse = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      console.error("Error response:", errorResponse.response?.data);
      toast.error(
        `Gagal memuat produk: ${
          errorResponse.response?.data?.message ||
          errorResponse.message ||
          "Unknown error"
        }`,
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data.data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    data.append("category", formData.category);
    if (selectedImage) {
      data.append("image", selectedImage);
    }

    try {
      if (isEditing && currentId) {
        await productsApi.update(currentId, data);
        toast.success("Produk berhasil diperbarui");
      } else {
        await productsApi.create(data);
        toast.success("Produk berhasil ditambahkan");
      }
      closeModal();
      // Refresh both products and allProducts to show new/updated images
      setIsRefreshing(true);
      await Promise.all([fetchProducts(), fetchAllProducts()]);
      setIsRefreshing(false);
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error("Gagal menyimpan produk");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        await productsApi.delete(id);
        toast.success("Produk berhasil dihapus");
        // Refresh both products and allProducts after delete
        setIsRefreshing(true);
        await Promise.all([fetchProducts(), fetchAllProducts()]);
        setIsRefreshing(false);
      } catch (error) {
        console.error("Failed to delete product:", error);
        toast.error("Gagal menghapus produk");
      }
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
    });
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || "",
    });
    setSelectedImage(null);
    setCurrentImageUrl(product.image_url || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentId(null);
    setCurrentImageUrl(null);
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  // Filter and search logic - use allProducts when filtering
  const sourceProducts =
    searchQuery || selectedCategory ? allProducts : products;

  const filteredProducts = sourceProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Determine if we're using client-side filtering
  const isFiltering = !!(searchQuery || selectedCategory);

  // Pagination logic
  const totalPages = isFiltering
    ? Math.ceil(filteredProducts.length / itemsPerPage)
    : Math.ceil(totalProducts / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Use filtered and paginated products for client-side, or just products for server-side
  const paginatedProducts = isFiltering
    ? filteredProducts.slice(startIndex, endIndex)
    : products;

  const displayTotal = isFiltering ? filteredProducts.length : totalProducts;

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleExportProducts = (format: "csv" | "pdf") => {
    const exportProducts = isFiltering ? filteredProducts : allProducts;

    if (exportProducts.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    try {
      const exportData = exportProducts.map((product, index) => ({
        no: index + 1,
        nama: product.name,
        kategori: getCategoryName(product.category),
        harga: product.price,
        stok: product.stock,
        berat: product.weight ? `${product.weight}g` : "-",
      }));

      if (format === "csv") {
        exportToCSV(
          exportData,
          `produk-${new Date().toISOString().split("T")[0]}`,
          [
            { key: "no", label: "No" },
            { key: "nama", label: "Nama Produk" },
            { key: "kategori", label: "Kategori" },
            { key: "harga", label: "Harga (Rp)" },
            { key: "stok", label: "Stok" },
            { key: "berat", label: "Berat" },
          ],
        );
      } else {
        exportToPDF(
          "Data Produk",
          exportData,
          [
            { key: "nama", label: "Nama Produk" },
            { key: "kategori", label: "Kategori" },
            { key: "harga", label: "Harga" },
            { key: "stok", label: "Stok" },
            { key: "berat", label: "Berat" },
          ],
          [
            {
              label: "Total Produk",
              value: exportProducts.length.toString(),
            },
            {
              label: "Stok Rendah (≤10)",
              value: exportProducts
                .filter((p) => p.stock <= 10 && p.stock > 0)
                .length.toString(),
            },
            {
              label: "Stok Habis",
              value: exportProducts
                .filter((p) => p.stock === 0)
                .length.toString(),
            },
          ],
        );
      }

      toast.success(`Data produk berhasil diekspor ke ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengekspor data");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Refreshing Indicator */}
      {isRefreshing && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="font-medium">Memperbarui data...</span>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Produk
            </h1>
            <p className="text-gray-500 mt-1">
              Kelola daftar produk, harga, dan stok inventaris Anda
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExportProducts("csv")}
              className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              CSV
            </button>
            <button
              onClick={() => handleExportProducts("pdf")}
              className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
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
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              PDF
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Produk
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
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
              <input
                type="text"
                placeholder="Cari produk berdasarkan nama atau deskripsi..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
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
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
            >
              <option value="">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                setCurrentPage(1);
              }}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {(searchQuery || selectedCategory) && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 font-medium">
              Filter aktif:
            </span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
                Pencarian: &quot;{searchQuery}&quot;
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="hover:text-emerald-900"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                Kategori: {getCategoryName(selectedCategory)}
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setCurrentPage(1);
                  }}
                  className="hover:text-blue-900"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
            <span className="text-sm text-gray-500">
              ({filteredProducts.length} produk ditemukan)
            </span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Total Produk
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {totalProducts}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <svg
                className="w-6 h-6 text-emerald-600"
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
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Stok Tersedia
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {allProducts.reduce((sum, p) => sum + p.stock, 0)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Stok Rendah
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {allProducts.filter((p) => p.stock <= 10 && p.stock > 0).length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50">
              <svg
                className="w-6 h-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Stok Habis
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {allProducts.filter((p) => p.stock === 0).length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-red-50">
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Memuat data produk...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="group hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 relative">
                            {product.image_url ? (
                              <Image
                                src={`${
                                  product.image_url
                                }?t=${new Date().getTime()}`}
                                alt={product.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <svg
                                  className="h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {getCategoryName(product.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Rp {product.price.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`h-2.5 w-2.5 rounded-full mr-2 ${
                              product.stock > 10
                                ? "bg-green-500"
                                : product.stock > 0
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          ></div>
                          <span className="text-sm text-gray-700">
                            {product.stock} unit
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg
                          className="w-20 h-20 mb-4 text-gray-300"
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
                        {searchQuery || selectedCategory ? (
                          <>
                            <p className="text-lg font-semibold text-gray-900">
                              Tidak ada produk ditemukan
                            </p>
                            <p className="text-sm text-gray-500 mt-2 mb-4">
                              Coba ubah kata kunci pencarian atau filter
                              kategori Anda.
                            </p>
                            <button
                              onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("");
                                setCurrentPage(1);
                              }}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                              Reset Filter
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="text-lg font-semibold text-gray-900">
                              Belum ada produk
                            </p>
                            <p className="text-sm text-gray-500 mt-2 mb-4">
                              Mulai dengan menambahkan produk baru ke inventaris
                              Anda.
                            </p>
                            <button
                              onClick={openCreateModal}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Tambah Produk Pertama
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Section */}
        {(paginatedProducts.length > 0 || displayTotal > 0) && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-600">
                Tampilkan per halaman:
              </label>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:border-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              >
                <option value={6}>6 produk</option>
                <option value={12}>12 produk</option>
                <option value={24}>24 produk</option>
                <option value={50}>50 produk</option>
              </select>
            </div>

            <div className="text-sm text-gray-600 font-medium">
              Menampilkan{" "}
              <span className="text-gray-900 font-semibold">
                {startIndex + 1}
              </span>{" "}
              hingga{" "}
              <span className="text-gray-900 font-semibold">
                {Math.min(endIndex, displayTotal)}
              </span>{" "}
              dari{" "}
              <span className="text-gray-900 font-semibold">
                {displayTotal}
              </span>{" "}
              produk
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                title="Halaman pertama"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                title="Halaman sebelumnya"
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
                    d="M19 12H5m7 7l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-1 flex-wrap">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  if (totalPages <= 5) {
                    return i + 1;
                  }
                  if (currentPage <= 3) {
                    return i + 1;
                  }
                  if (currentPage >= totalPages - 2) {
                    return totalPages - 4 + i;
                  }
                  return currentPage - 2 + i;
                }).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-emerald-600 text-white border border-emerald-600"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="px-2 py-2 text-gray-500">...</span>
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                title="Halaman berikutnya"
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
                    d="M5 12h14m-7-7l7 7-7 7"
                  />
                </svg>
              </button>

              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                title="Halaman terakhir"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>
          <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? "Edit Produk" : "Tambah Produk Baru"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Isi informasi detail produk di bawah ini
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-500"
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

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Masukkan nama produk"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                  placeholder="Masukkan deskripsi produk"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar Produk
                </label>
                {(selectedImage || currentImageUrl) && (
                  <div className="mb-3 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <Image
                      src={
                        selectedImage
                          ? URL.createObjectURL(selectedImage)
                          : `${currentImageUrl}?t=${new Date().getTime()}`
                      }
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-500 transition-colors">
                      <svg
                        className="w-5 h-5 text-gray-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {selectedImage ? selectedImage.name : "Pilih gambar"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {(selectedImage || currentImageUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setCurrentImageUrl(null);
                      }}
                      className="px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </form>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>{isEditing ? "Perbarui Produk" : "Tambah Produk"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
