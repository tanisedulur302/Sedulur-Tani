"use client";

import { useEffect, useState } from "react";
import { dashboardApi, productsApi, userApi } from "@/lib/api";
import Toast from "@/components/shared/Toast";
import { exportToCSV, exportSimpleReport } from "@/lib/utils/export";

interface ReportData {
  salesReport: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
  };
  productReport: {
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    topProducts: Array<{
      id: string;
      name: string;
      sold: number;
      revenue: number;
    }>;
  };
  userReport: {
    totalUsers: number;
    totalBuyers: number;
    totalSellers: number;
    newUsersThisMonth: number;
  };
}

type ReportType = "sales" | "products" | "users";
type DateRange = "today" | "week" | "month" | "year" | "all";

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<ReportType>("sales");
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Clear previous data to ensure chart re-renders with fresh data
      setReportData(null);

      // Fetch dashboard stats for sales data
      const dashboardRes = await dashboardApi.getAdminStats();
      const stats = dashboardRes.data.data;

      // Fetch products for product report
      const productsRes = await productsApi.getAll();
      const products = productsRes.data.data.products || [];

      // Fetch users for user report
      let users: Array<{ role: string; created_at: string }> = [];
      try {
        const usersRes = await userApi.getAll({ limit: 1000 });
        users = usersRes.data.data.users || [];
      } catch {
        // If user API fails, continue with empty users
      }

      // Calculate reports
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const newUsersThisMonth = users.filter((u) => {
        const created = new Date(u.created_at);
        return (
          created.getMonth() === thisMonth && created.getFullYear() === thisYear
        );
      }).length;

      const lowStockProducts = products.filter(
        (p: { stock: number }) => p.stock > 0 && p.stock <= 10,
      ).length;
      const outOfStockProducts = products.filter(
        (p: { stock: number }) => p.stock === 0,
      ).length;

      setReportData({
        salesReport: {
          totalRevenue: stats.summary?.totalRevenue || 0,
          totalOrders: stats.summary?.totalOrders || 0,
          averageOrderValue: stats.summary?.averageOrderValue || 0,
          ordersByStatus: stats.ordersByStatus || {},
        },
        productReport: {
          totalProducts: stats.summary?.totalProducts || products.length,
          lowStockProducts,
          outOfStockProducts,
          topProducts: [], // Would need additional API
        },
        userReport: {
          totalUsers: stats.summary?.totalUsers || users.length,
          totalBuyers:
            stats.summary?.totalBuyers ||
            users.filter((u) => u.role === "buyer").length,
          totalSellers:
            stats.summary?.totalSellers ||
            users.filter((u) => u.role === "seller").length,
          newUsersThisMonth,
        },
      });
    } catch (error) {
      console.error("Failed to fetch report data:", error);
      setToast({ message: "Gagal memuat data laporan", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: "csv" | "pdf") => {
    if (!reportData) {
      setToast({ message: "Tidak ada data untuk diekspor", type: "error" });
      return;
    }

    try {
      const dateRangeLabels: Record<DateRange, string> = {
        today: "Hari Ini",
        week: "Minggu Ini",
        month: "Bulan Ini",
        year: "Tahun Ini",
        all: "Semua Waktu",
      };

      const periodLabel = dateRangeLabels[dateRange];

      if (activeReport === "sales") {
        // Export Sales Report
        const salesData = Object.entries(
          reportData.salesReport.ordersByStatus,
        ).map(([status, count]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          jumlah: count,
        }));

        if (format === "csv") {
          exportToCSV(salesData, `laporan-penjualan-${dateRange}`, [
            { key: "status", label: "Status Pesanan" },
            { key: "jumlah", label: "Jumlah" },
          ]);
        } else {
          exportSimpleReport(`Laporan Penjualan - ${periodLabel}`, [
            {
              title: "Ringkasan Penjualan",
              items: [
                {
                  label: "Total Pendapatan",
                  value: formatCurrency(reportData.salesReport.totalRevenue),
                },
                {
                  label: "Total Pesanan",
                  value: reportData.salesReport.totalOrders.toString(),
                },
                {
                  label: "Rata-rata Pesanan",
                  value: formatCurrency(
                    reportData.salesReport.averageOrderValue,
                  ),
                },
              ],
            },
            {
              title: "Status Pesanan",
              items: Object.entries(reportData.salesReport.ordersByStatus).map(
                ([status, count]) => ({
                  label: status.charAt(0).toUpperCase() + status.slice(1),
                  value: count.toString(),
                }),
              ),
            },
          ]);
        }
      } else if (activeReport === "products") {
        // Export Products Report
        const productData = reportData.productReport.topProducts.map(
          (p, index) => ({
            no: index + 1,
            nama: p.name,
            terjual: p.sold,
            pendapatan: p.revenue,
          }),
        );

        if (format === "csv") {
          if (productData.length === 0) {
            // If no top products, create summary data
            exportToCSV(
              [
                {
                  metrik: "Total Produk",
                  nilai: reportData.productReport.totalProducts,
                },
                {
                  metrik: "Stok Rendah",
                  nilai: reportData.productReport.lowStockProducts,
                },
                {
                  metrik: "Stok Habis",
                  nilai: reportData.productReport.outOfStockProducts,
                },
              ],
              `laporan-produk-${dateRange}`,
              [
                { key: "metrik", label: "Metrik" },
                { key: "nilai", label: "Nilai" },
              ],
            );
          } else {
            exportToCSV(productData, `laporan-produk-${dateRange}`, [
              { key: "no", label: "No" },
              { key: "nama", label: "Nama Produk" },
              { key: "terjual", label: "Terjual" },
              { key: "pendapatan", label: "Pendapatan" },
            ]);
          }
        } else {
          exportSimpleReport(`Laporan Produk - ${periodLabel}`, [
            {
              title: "Ringkasan Produk",
              items: [
                {
                  label: "Total Produk",
                  value: reportData.productReport.totalProducts.toString(),
                },
                {
                  label: "Stok Rendah (≤10)",
                  value: reportData.productReport.lowStockProducts.toString(),
                },
                {
                  label: "Stok Habis",
                  value: reportData.productReport.outOfStockProducts.toString(),
                },
              ],
            },
          ]);
        }
      } else if (activeReport === "users") {
        // Export Users Report
        const userData = [
          { kategori: "Pembeli", jumlah: reportData.userReport.totalBuyers },
          { kategori: "Penjual", jumlah: reportData.userReport.totalSellers },
          {
            kategori: "Pengguna Baru (Bulan Ini)",
            jumlah: reportData.userReport.newUsersThisMonth,
          },
        ];

        if (format === "csv") {
          exportToCSV(userData, `laporan-pengguna-${dateRange}`, [
            { key: "kategori", label: "Kategori" },
            { key: "jumlah", label: "Jumlah" },
          ]);
        } else {
          exportSimpleReport(`Laporan Pengguna - ${periodLabel}`, [
            {
              title: "Ringkasan Pengguna",
              items: [
                {
                  label: "Total Pengguna",
                  value: reportData.userReport.totalUsers.toString(),
                },
                {
                  label: "Total Pembeli",
                  value: reportData.userReport.totalBuyers.toString(),
                },
                {
                  label: "Total Penjual",
                  value: reportData.userReport.totalSellers.toString(),
                },
                {
                  label: "Pengguna Baru Bulan Ini",
                  value: reportData.userReport.newUsersThisMonth.toString(),
                },
              ],
            },
          ]);
        }
      }

      setToast({
        message: `Laporan berhasil diekspor ke ${format.toUpperCase()}`,
        type: "success",
      });
    } catch (error) {
      console.error("Export error:", error);
      setToast({
        message: `Gagal mengekspor laporan: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const reportTabs = [
    {
      id: "sales" as ReportType,
      label: "Laporan Penjualan",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      id: "products" as ReportType,
      label: "Laporan Produk",
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    },
    {
      id: "users" as ReportType,
      label: "Laporan Pengguna",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
            <p className="text-gray-500 mt-1">
              Analisis data penjualan, produk, dan pengguna
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Date Range Filter */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="pl-9 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white cursor-pointer"
              >
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="year">Tahun Ini</option>
                <option value="all">Semua Waktu</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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
            </div>
            {/* Export Buttons */}
            <button
              onClick={() => handleExport("csv")}
              className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              CSV
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="inline-flex items-center px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <div className="flex gap-2">
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeReport === tab.id
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
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
                  d={tab.icon}
                />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Memuat data laporan...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Sales Report */}
          {activeReport === "sales" && reportData && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Pendapatan
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(reportData.salesReport.totalRevenue)}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl">
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
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Pesanan
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {reportData.salesReport.totalOrders}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl">
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Rata-rata Pesanan
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(
                          reportData.salesReport.averageOrderValue,
                        )}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Pesanan Selesai
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {reportData.salesReport.ordersByStatus.completed || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Status Pesanan
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    {
                      status: "pending",
                      label: "Menunggu",
                      color: "bg-amber-500",
                    },
                    {
                      status: "processed",
                      label: "Diproses",
                      color: "bg-blue-500",
                    },
                    {
                      status: "shipped",
                      label: "Dikirim",
                      color: "bg-purple-500",
                    },
                    {
                      status: "completed",
                      label: "Selesai",
                      color: "bg-emerald-500",
                    },
                    {
                      status: "cancelled",
                      label: "Dibatalkan",
                      color: "bg-red-500",
                    },
                  ].map((item) => (
                    <div
                      key={item.status}
                      className="bg-gray-50 rounded-xl p-4 text-center"
                    >
                      <div
                        className={`w-3 h-3 ${item.color} rounded-full mx-auto mb-2`}
                      ></div>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportData.salesReport.ordersByStatus[item.status] ||
                          0}
                      </p>
                      <p className="text-sm text-gray-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products Report */}
          {activeReport === "products" && reportData && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Produk
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {reportData.productReport.totalProducts}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl">
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
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Stok Menipis
                      </p>
                      <p className="text-2xl font-bold text-amber-600 mt-1">
                        {reportData.productReport.lowStockProducts}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Stok ≤ 10 unit
                      </p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl">
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

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Stok Habis
                      </p>
                      <p className="text-2xl font-bold text-red-600 mt-1">
                        {reportData.productReport.outOfStockProducts}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Perlu restok segera
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-xl">
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
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory Status */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Status Inventaris
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Stok Tersedia</span>
                      <span className="font-medium text-emerald-600">
                        {reportData.productReport.totalProducts -
                          reportData.productReport.lowStockProducts -
                          reportData.productReport.outOfStockProducts}{" "}
                        produk
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-emerald-500 h-3 rounded-full"
                        style={{
                          width: `${((reportData.productReport.totalProducts - reportData.productReport.lowStockProducts - reportData.productReport.outOfStockProducts) / reportData.productReport.totalProducts) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Stok Menipis</span>
                      <span className="font-medium text-amber-600">
                        {reportData.productReport.lowStockProducts} produk
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-amber-500 h-3 rounded-full"
                        style={{
                          width: `${(reportData.productReport.lowStockProducts / reportData.productReport.totalProducts) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Stok Habis</span>
                      <span className="font-medium text-red-600">
                        {reportData.productReport.outOfStockProducts} produk
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-red-500 h-3 rounded-full"
                        style={{
                          width: `${(reportData.productReport.outOfStockProducts / reportData.productReport.totalProducts) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Report */}
          {activeReport === "users" && reportData && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Pengguna
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {reportData.userReport.totalUsers}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-100 rounded-xl">
                      <svg
                        className="w-6 h-6 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className=" rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Pembeli
                      </p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {reportData.userReport.totalBuyers}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Penjual
                      </p>
                      <p className="text-2xl font-bold text-purple-600 mt-1">
                        {reportData.userReport.totalSellers}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Baru Bulan Ini
                      </p>
                      <p className="text-2xl font-bold text-emerald-600 mt-1">
                        {reportData.userReport.newUsersThisMonth}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl">
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
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Distribution */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Distribusi Pengguna
                </h3>
                <div className="flex items-center gap-8">
                  {/* Pie Chart Placeholder */}
                  <div className="relative w-40 h-40">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeDasharray={`${(reportData.userReport.totalBuyers / reportData.userReport.totalUsers) * 100} 100`}
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="3"
                        strokeDasharray={`${(reportData.userReport.totalSellers / reportData.userReport.totalUsers) * 100} 100`}
                        strokeDashoffset={`-${(reportData.userReport.totalBuyers / reportData.userReport.totalUsers) * 100}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {reportData.userReport.totalUsers}
                      </span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="font-medium text-gray-900">Pembeli</p>
                        <p className="text-sm text-gray-500">
                          {reportData.userReport.totalBuyers} pengguna (
                          {(
                            (reportData.userReport.totalBuyers /
                              reportData.userReport.totalUsers) *
                            100
                          ).toFixed(1)}
                          %)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                      <div>
                        <p className="font-medium text-gray-900">Penjual</p>
                        <p className="text-sm text-gray-500">
                          {reportData.userReport.totalSellers} pengguna (
                          {(
                            (reportData.userReport.totalSellers /
                              reportData.userReport.totalUsers) *
                            100
                          ).toFixed(1)}
                          %)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
