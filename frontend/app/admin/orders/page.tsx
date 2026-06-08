"use client";

import { useEffect, useState } from "react";
import { ordersApi } from "@/lib/api";
import { Order, OrderItem } from "@/lib/types";
import Toast from "@/components/shared/Toast";
import Image from "next/image";
import { exportToCSV, exportToPDF } from "@/lib/utils/export";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingData, setShippingData] = useState({
    courier_name: "",
    tracking_number: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getAll();
      const ordersData = response.data.data.orders || [];
      setOrders(ordersData);
    } catch (error: unknown) {
      console.error("Failed to fetch orders:", error);
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      console.error("Error response:", err.response?.data);
      setToast({ message: "Gagal memuat pesanan", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // If changing to shipped, show shipping modal
    if (newStatus === "shipped") {
      setSelectedOrder(order);
      setShowShippingModal(true);
      return;
    }

    if (!confirm(`Ubah status pesanan menjadi ${getStatusLabel(newStatus)}?`))
      return;

    try {
      console.log("Updating order Status: ", { orderId, newStatus });
      const response = await ordersApi.updateStatus(orderId, {
        status: newStatus,
      });
      console.log("update status", response);
      setToast({
        message: "Status Pesanan Berhasil Diperbaharui",
        type: "success",
      });
      fetchOrders();
    } catch (error: unknown) {
      console.error("Failed to update status:", error);
      const err = error as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Gagal Memperbarui Status";
      setToast({ message: `Error ${errorMsg}`, type: "error" });

      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log("Current User :", user.role);
      }
    }
  };

  const handleShippingSubmit = async () => {
    if (!selectedOrder) return;
    if (!shippingData.courier_name.trim()) {
      setToast({ message: "Nama ekspedisi wajib diisi", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      await ordersApi.updateStatus(selectedOrder.id, {
        status: "shipped",
        courier_name: shippingData.courier_name,
        tracking_number: shippingData.tracking_number,
      });
      setToast({ message: "Pesanan berhasil dikirim", type: "success" });
      setShowShippingModal(false);
      setShippingData({ courier_name: "", tracking_number: "" });
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error("Failed to update shipping:", error);
      setToast({ message: "Gagal memperbarui pengiriman", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportOrders = (format: "csv" | "pdf") => {
    if (filteredOrders.length === 0) {
      setToast({ message: "Tidak ada data untuk diekspor", type: "error" });
      return;
    }

    try {
      const exportData = filteredOrders.map((order, index) => {
        const items = order.items || [];
        const productNames = items
          .map(
            (item: OrderItem) => item.product?.name || "Produk tidak tersedia",
          )
          .join(", ");
        const totalQuantity = items.reduce(
          (sum: number, item: OrderItem) => sum + (item.quantity || 0),
          0,
        );
        return {
          no: index + 1,
          id_pesanan: order.id.substring(0, 8),
          pelanggan: order.user?.name || "-",
          produk: productNames || "-",
          jumlah: totalQuantity,
          total: order.checkout?.grand_total || order.grand_total || 0,
          status: getStatusLabel(order.status),
          tanggal: new Date(order.created_at).toLocaleDateString("id-ID"),
        };
      });

      if (format === "csv") {
        exportToCSV(
          exportData,
          `pesanan-${filterStatus}-${new Date().toISOString().split("T")[0]}`,
          [
            { key: "no", label: "No" },
            { key: "id_pesanan", label: "ID Pesanan" },
            { key: "pelanggan", label: "Pelanggan" },
            { key: "produk", label: "Produk" },
            { key: "jumlah", label: "Jumlah" },
            { key: "total", label: "Total (Rp)" },
            { key: "status", label: "Status" },
            { key: "tanggal", label: "Tanggal" },
          ],
        );
      } else {
        exportToPDF(
          `Laporan Pesanan - ${filterStatus === "all" ? "Semua" : getStatusLabel(filterStatus)}`,
          exportData,
          [
            { key: "id_pesanan", label: "ID Pesanan" },
            { key: "pelanggan", label: "Pelanggan" },
            { key: "produk", label: "Produk" },
            { key: "jumlah", label: "Qty" },
            { key: "total", label: "Total" },
            { key: "status", label: "Status" },
            { key: "tanggal", label: "Tanggal" },
          ],
          [
            { label: "Total Pesanan", value: filteredOrders.length.toString() },
            {
              label: "Total Nilai",
              value: new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(
                filteredOrders.reduce(
                  (sum, o) =>
                    sum + (o.checkout?.grand_total || o.grand_total || 0),
                  0,
                ),
              ),
            },
          ],
        );
      }

      setToast({
        message: `Data pesanan berhasil diekspor ke ${format.toUpperCase()}`,
        type: "success",
      });
    } catch (error) {
      console.error("Export error:", error);
      setToast({ message: "Gagal mengekspor data", type: "error" });
    }
  };

  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const closeShippingModal = () => {
    setShowShippingModal(false);
    setShippingData({ courier_name: "", tracking_number: "" });
    setSelectedOrder(null);
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => getOrderStatus(order) === filterStatus);

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      paid: "bg-green-100 text-green-800 border-green-300",
      processed: "bg-blue-100 text-blue-800 border-blue-300",
      shipped: "bg-purple-100 text-purple-800 border-purple-300",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
      expired: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return classes[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Menunggu Pembayaran",
      paid: "Sudah Dibayar",
      processed: "Diproses",
      shipped: "Dikirim",
      completed: "Selesai",
      cancelled: "Dibatalkan",
      expired: "Kadaluarsa",
    };
    return labels[status] || status;
  };

  // Helper function to get actual order status from items
  const getOrderStatus = (order: Order): string => {
    // If order has items, use the first item's status (actual order status)
    if (order.items && order.items.length > 0) {
      return order.items[0].status;
    }
    // Fallback to checkout status
    return order.status;
  };

  const courierOptions = [
    "JNE",
    "J&T Express",
    "SiCepat",
    "Anteraja",
    "Ninja Express",
    "POS Indonesia",
    "TIKI",
    "Wahana",
    "Lion Parcel",
    "Lainnya",
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Pesanan
            </h1>
            <p className="text-gray-500 mt-1">
              Pantau dan kelola status pesanan pelanggan Anda
            </p>
          </div>
          <div className="flex items-center gap-3">
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-9 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu Pembayaran</option>
                <option value="processed">Diproses</option>
                <option value="shipped">Dikirim</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
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
              onClick={() => handleExportOrders("csv")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
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
              onClick={() => handleExportOrders("pdf")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
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
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: "Total Pesanan",
            count: orders.length,
            bgColor: "bg-slate-50",
            textColor: "text-slate-600",
          },
          {
            label: "Pending",
            count: orders.filter((o) => getOrderStatus(o) === "pending").length,
            bgColor: "bg-amber-50",
            textColor: "text-amber-600",
          },
          {
            label: "Diproses",
            count: orders.filter((o) => getOrderStatus(o) === "processed")
              .length,
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
          },
          {
            label: "Dikirim",
            count: orders.filter((o) => getOrderStatus(o) === "shipped").length,
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
          },
          {
            label: "Selesai",
            count: orders.filter((o) => getOrderStatus(o) === "completed")
              .length,
            bgColor: "bg-emerald-50",
            textColor: "text-emerald-600",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stat.count}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <svg
                  className={`w-6 h-6 ${stat.textColor}`}
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
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Memuat data pesanan...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ID & Tanggal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center text-gray-500">
                        <svg
                          className="w-16 h-16 text-gray-300 mb-4"
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
                        <p className="text-lg font-semibold text-gray-900">
                          Tidak ada pesanan
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {filterStatus !== "all"
                            ? "Coba ubah filter status untuk melihat pesanan lainnya"
                            : "Belum ada pesanan masuk saat ini"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="group hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
                      onClick={() => openDetailModal(order)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            #{order.id.substring(0, 8).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.user?.name || "-"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {order.user?.email || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const items = order.items || [];
                            const itemsArray = items as OrderItem[];

                            if (itemsArray.length === 0) {
                              return (
                                <div className="text-sm text-gray-500">
                                  Tidak ada produk
                                </div>
                              );
                            }

                            // Single item
                            if (itemsArray.length === 1) {
                              const item = itemsArray[0];
                              return (
                                <>
                                  {item.product?.image_url && (
                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                      <Image
                                        src={item.product.image_url}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                      {item.product?.name ||
                                        "Produk tidak tersedia"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {item.quantity || 0} item × Rp{" "}
                                      {(item.price_each || 0).toLocaleString(
                                        "id-ID",
                                      )}
                                    </p>
                                  </div>
                                </>
                              );
                            }

                            // Multiple items
                            return (
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                  {itemsArray.slice(0, 3).map(
                                    (item, idx) =>
                                      item.product?.image_url && (
                                        <div
                                          key={idx}
                                          className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border-2 border-white shrink-0"
                                        >
                                          <Image
                                            src={item.product.image_url}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                      ),
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {itemsArray.length} Produk
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {itemsArray.reduce(
                                      (sum, item) => sum + (item.quantity || 0),
                                      0,
                                    )}{" "}
                                    item total
                                  </p>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">
                          Rp{" "}
                          {(
                            order.checkout?.grand_total ||
                            order.grand_total ||
                            0
                          ).toLocaleString("id-ID")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
                            getOrderStatus(order),
                          )}`}
                        >
                          {getStatusLabel(getOrderStatus(order))}
                        </span>
                        {order.shipments && order.shipments[0] && (
                          <p className="text-xs text-gray-500 mt-1">
                            {order.shipments[0].courier_name}
                            {order.shipments[0].tracking_number && (
                              <span className="ml-1">
                                • {order.shipments[0].tracking_number}
                              </span>
                            )}
                          </p>
                        )}
                      </td>
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetailModal(order)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Lihat Detail"
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <select
                            value={getOrderStatus(order)}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            disabled={
                              getOrderStatus(order) === "cancelled" ||
                              getOrderStatus(order) === "completed"
                            }
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500 bg-white font-medium"
                          >
                            <option value="pending" disabled>
                              Pending
                            </option>
                            <option value="processed">Proses</option>
                            <option value="shipped">Kirim</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Batalkan</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-linear-to-r from-emerald-600 to-green-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Detail Pesanan</h2>
                <p className="text-sm text-emerald-100">
                  #{selectedOrder.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={closeDetailModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-white"
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

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Status Badge */}
              <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border shadow-sm ${getStatusBadgeClass(
                    getOrderStatus(selectedOrder),
                  )}`}
                >
                  {getStatusLabel(getOrderStatus(selectedOrder))}
                </span>
                <p className="text-sm text-gray-500">
                  {new Date(selectedOrder.created_at).toLocaleDateString(
                    "id-ID",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              </div>

              {/* Product Info */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-emerald-600"
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
                  Produk Dibeli
                </h3>
                <div className="space-y-3">
                  {(selectedOrder.items || []).map(
                    (item: OrderItem, index: number) => (
                      <div
                        key={item.id || index}
                        className={`${index > 0 ? "pt-4 mt-4 border-t border-gray-200" : ""}`}
                      >
                        <div className="flex items-start gap-4 hover:bg-gray-50 p-3 rounded-lg transition-colors">
                          {item.product?.image_url && (
                            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0 border-2 border-gray-200 shadow-sm">
                              <Image
                                src={item.product.image_url}
                                alt={item.product?.name || "Produk"}
                                fill
                                className="object-cover rounded-lg"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-base">
                              {item.product?.name || "Produk tidak tersedia"}
                            </p>
                            {item.product?.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                {item.product.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm text-gray-600">
                                {item.quantity || 0} item × Rp{" "}
                                {(item.price_each || 0).toLocaleString("id-ID")}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm text-gray-500">
                                Subtotal:
                              </span>
                              <p className="text-lg font-bold text-emerald-600">
                                Rp{" "}
                                {(item.total_price || 0).toLocaleString(
                                  "id-ID",
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                  {(selectedOrder.items || []).length === 0 && (
                    <div className="text-center py-8">
                      <svg
                        className="w-16 h-16 text-gray-300 mx-auto mb-2"
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
                      <p className="text-sm text-gray-500">
                        Tidak ada produk dalam pesanan ini
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-emerald-600"
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
                  Informasi Pelanggan
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
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
                    <span className="text-gray-900">
                      {selectedOrder.user?.name || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-900">
                      {selectedOrder.user?.email || "-"}
                    </span>
                  </div>
                  {selectedOrder.user?.phone && (
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span className="text-gray-900">
                        {selectedOrder.user.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.user?.addresses &&
                selectedOrder.user.addresses.length > 0 && (
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Alamat Pengiriman
                    </h3>
                    {(() => {
                      const address =
                        selectedOrder.user.addresses.find(
                          (a) => a.is_default,
                        ) || selectedOrder.user.addresses[0];
                      return (
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">
                            {address.recipient_name}
                            <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                              {address.label}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.phone}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.address_line}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.province}{" "}
                            {address.postal_code}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}

              {/* Shipping Info */}
              {selectedOrder.shipments &&
                selectedOrder.shipments.length > 0 && (
                  <div className="bg-white rounded-xl p-5 shadow-sm border-2 border-purple-200">
                    <h3 className="text-base font-bold text-purple-700 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-purple-600"
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
                      Informasi Pengiriman
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ekspedisi</span>
                        <span className="font-medium text-gray-900">
                          {selectedOrder.shipments[0].courier_name}
                        </span>
                      </div>
                      {selectedOrder.shipments[0].tracking_number && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nomor Resi</span>
                          <span className="font-medium text-gray-900">
                            {selectedOrder.shipments[0].tracking_number}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <span className="font-medium text-purple-600 capitalize">
                          {selectedOrder.shipments[0].status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              {/* Notes/Catatan */}
              {selectedOrder.checkout?.notes && (
                <div className="bg-white rounded-xl p-5 shadow-sm border-2 border-amber-300">
                  <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
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
                    Catatan Pelanggan
                  </h3>
                  <p className="text-sm text-gray-700 italic">
                    &ldquo;{selectedOrder.checkout.notes}&rdquo;
                  </p>
                </div>
              )}

              {/* Payment Info */}
              {selectedOrder.checkout && (
                <div className="bg-white rounded-xl p-5 shadow-md border-2 border-emerald-300">
                  <h3 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
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
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Rincian Pembayaran
                  </h3>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-sm py-2">
                      <span className="text-gray-700 font-medium">
                        Subtotal Produk
                      </span>
                      <span className="text-gray-900 font-semibold">
                        Rp{" "}
                        {(selectedOrder.items || [])
                          .reduce(
                            (sum: number, item: OrderItem) =>
                              sum + (item.total_price || 0),
                            0,
                          )
                          .toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-2">
                      <span className="text-gray-700 font-medium">
                        Ongkos Kirim
                      </span>
                      <span className="text-gray-900 font-semibold">
                        Rp{" "}
                        {(
                          selectedOrder.checkout?.shipping_price || 0
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="border-t-2 border-gray-200 my-3"></div>
                    <div className="flex justify-between items-center py-3 bg-linear-to-r from-emerald-50 to-green-50 rounded-lg px-4 shadow-sm">
                      <span className="text-gray-900 font-bold text-base">
                        Total Pembayaran
                      </span>
                      <span className="text-emerald-600 font-bold text-xl">
                        Rp{" "}
                        {(
                          selectedOrder.checkout?.grand_total || 0
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 px-6 py-4">
              <button
                onClick={closeDetailModal}
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Modal */}
      {showShippingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Kirim Pesanan</h2>
              <p className="text-sm text-gray-500">
                Masukkan informasi pengiriman untuk pesanan #
                {selectedOrder.id.substring(0, 8).toUpperCase()}
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Courier Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ekspedisi <span className="text-red-500">*</span>
                </label>
                <select
                  value={shippingData.courier_name}
                  onChange={(e) =>
                    setShippingData({
                      ...shippingData,
                      courier_name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Pilih Ekspedisi</option>
                  {courierOptions.map((courier) => (
                    <option key={courier} value={courier}>
                      {courier}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tracking Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Resi{" "}
                  <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={shippingData.tracking_number}
                  onChange={(e) =>
                    setShippingData({
                      ...shippingData,
                      tracking_number: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Contoh: JNE123456789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Anda bisa menambahkan nomor resi nanti jika belum tersedia
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <p className="text-sm text-gray-600">
                  Pesanan akan dikirim ke:
                </p>
                {selectedOrder.user?.addresses &&
                  selectedOrder.user.addresses.length > 0 && (
                    <div className="mt-2">
                      {(() => {
                        const address =
                          selectedOrder.user.addresses.find(
                            (a) => a.is_default,
                          ) || selectedOrder.user.addresses[0];
                        return (
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">
                              {address.recipient_name}
                            </p>
                            <p className="text-gray-600">
                              {address.address_line}, {address.city},{" "}
                              {address.province} {address.postal_code}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 px-6 py-4 flex gap-3">
              <button
                onClick={closeShippingModal}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleShippingSubmit}
                disabled={isSubmitting || !shippingData.courier_name}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Memproses...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Kirim Pesanan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
