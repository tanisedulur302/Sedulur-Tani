"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ordersApi, paymentApi } from "@/lib/api";
import { Order, OrderItem, Shipment } from "@/lib/types";
import { toast } from "@/lib/toast";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    if (params.id) {
      fetchOrderDetail(params.id as string);
    }
  }, [params.id, router]);

  const fetchOrderDetail = async (id: string) => {
    try {
      setLoading(true);
      const response = await ordersApi.getById(id);
      const orderData = response.data.data.order || response.data.data;

      // If order has items array, use the most advanced status
      if (orderData.items && orderData.items.length > 0) {
        const statusPriority = [
          "completed",
          "shipped",
          "processed",
          "pending",
          "cancelled",
        ];
        let aggregatedStatus = orderData.items[0].status;

        // Find the most advanced status among items
        for (const item of orderData.items) {
          if (
            statusPriority.indexOf(item.status) <
            statusPriority.indexOf(aggregatedStatus)
          ) {
            aggregatedStatus = item.status;
          }
        }

        // Override checkout status with aggregated item status
        orderData.status = aggregatedStatus;
      }

      setOrder(orderData);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      setError(err.response?.data?.message || "Gagal memuat detail pesanan");
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!order?.checkout_id) return;

    try {
      setProcessingPayment(true);
      setError("");

      // Create payment for existing checkout
      const response = await paymentApi.create({
        checkout_id: order.checkout_id,
      });
      const { invoice_url } = response.data.data;

      if (invoice_url) {
        // Open Xendit payment page
        const paymentWindow = window.open(invoice_url, "_blank");

        let windowClosed = false;
        let paymentCompleted = false;

        // Check if window is closed
        const windowCheckInterval = setInterval(() => {
          if (paymentWindow && paymentWindow.closed && !paymentCompleted) {
            windowClosed = true;
            clearInterval(windowCheckInterval);
            clearInterval(pollInterval);
            setProcessingPayment(false);
            toast.error("Pembayaran dibatalkan. Silakan coba lagi.");
          }
        }, 500);

        // Poll payment status
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await paymentApi.getStatus(
              order.checkout_id,
            );
            const status = statusResponse.data.data.transaction_status;

            if (status === "PAID" || status === "SETTLED") {
              paymentCompleted = true;
              clearInterval(pollInterval);
              clearInterval(windowCheckInterval);
              setProcessingPayment(false);
              if (paymentWindow && !paymentWindow.closed) {
                paymentWindow.close();
              }
              // Refresh order detail
              fetchOrderDetail(params.id as string);
              router.push("/payment/success");
            } else if (status === "EXPIRED" || status === "FAILED") {
              clearInterval(pollInterval);
              clearInterval(windowCheckInterval);
              setProcessingPayment(false);
              toast.error("Pembayaran gagal atau kadaluarsa");
            }
          } catch (error) {
            console.error("Error polling payment status:", error);
          }
        }, 3000);

        // Stop polling after 10 minutes
        setTimeout(() => {
          if (!paymentCompleted) {
            clearInterval(pollInterval);
            clearInterval(windowCheckInterval);
            setProcessingPayment(false);
            if (!windowClosed) {
              toast.error("Waktu pembayaran habis. Silakan coba lagi.");
            }
          }
        }, 600000);
      }
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      console.error("Payment error:", error);
      toast.error(
        error.response?.data?.message || "Gagal memproses pembayaran",
      );
      setProcessingPayment(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      paid: "bg-green-100 text-green-700 border-green-200",
      processed: "bg-blue-100 text-blue-700 border-blue-200",
      shipped: "bg-purple-100 text-purple-700 border-purple-200",
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return statusClasses[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Menunggu Pembayaran",
      paid: "Sudah Dibayar",
      processed: "Sedang Diproses",
      shipped: "Sedang Dikirim",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    };
    return labels[status] || status;
  };

  const getStatusDescription = (status: string) => {
    const descriptions: Record<string, string> = {
      pending:
        "Mohon segera selesaikan pembayaran Anda agar pesanan dapat diproses.",
      paid: "Pembayaran telah diterima, pesanan akan segera diproses.",
      processed: "Penjual sedang menyiapkan pesanan Anda.",
      shipped: "Pesanan Anda sedang dalam perjalanan ke alamat tujuan.",
      completed: "Pesanan telah diterima dan transaksi selesai.",
      cancelled: "Pesanan ini telah dibatalkan.",
    };
    return descriptions[status] || "";
  };

  const getStatusBannerColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-50 border-amber-200 text-amber-800",
      paid: "bg-green-50 border-green-200 text-green-800",
      processed: "bg-blue-50 border-blue-200 text-blue-800",
      shipped: "bg-purple-50 border-purple-200 text-purple-800",
      completed: "bg-emerald-50 border-emerald-200 text-emerald-800",
      cancelled: "bg-red-50 border-red-200 text-red-800",
    };
    return colors[status] || "bg-gray-50 border-gray-200 text-gray-800";
  };

  const getStatusStep = (status: string) => {
    const steps = ["pending", "processed", "shipped", "completed"];
    if (status === "cancelled") return -1;
    return steps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-2xl h-64"></div>
            <div className="bg-white rounded-2xl h-48"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8 pt-24 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Gagal Memuat Pesanan
            </h2>
            <p className="text-gray-500 mb-6">
              {error || "Pesanan tidak ditemukan"}
            </p>
            <Link
              href="/orders"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
            >
              Kembali ke Daftar Pesanan
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/orders"
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-600"
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
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan</h1>
            <p className="text-sm text-gray-500">ID: {order.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Status Banner */}
            <div
              className={`w-full p-6 rounded-2xl border flex items-start gap-4 ${getStatusBannerColor(
                order.status,
              )}`}
            >
              <div className="mt-1">
                {order.status === "pending" && (
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {order.status === "paid" && (
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {order.status === "processed" && (
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
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                )}
                {order.status === "shipped" && (
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
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                )}
                {order.status === "completed" && (
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {order.status === "cancelled" && (
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
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  {getStatusLabel(order.status)}
                </h3>
                <p className="text-sm opacity-90">
                  {getStatusDescription(order.status)}
                </p>
              </div>
            </div>

            {/* Status Tracker (Only for non-cancelled) */}
            {order.status !== "cancelled" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6">Lacak Pesanan</h3>
                <div className="relative">
                  <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full">
                    <div
                      className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(currentStep / 3) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="relative z-10 flex justify-between">
                    {[
                      {
                        label: "Menunggu",
                        icon: (
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
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ),
                      },
                      {
                        label: "Diproses",
                        icon: (
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
                        ),
                      },
                      {
                        label: "Dikirim",
                        icon: (
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
                              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                            />
                          </svg>
                        ),
                      },
                      {
                        label: "Selesai",
                        icon: (
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
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ),
                      },
                    ].map((step, index) => (
                      <div
                        key={step.label}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            index <= currentStep
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-lg  scale-110"
                              : "bg-white border-gray-200 text-gray-300"
                          }`}
                        >
                          {step.icon}
                        </div>
                        <span
                          className={`text-xs font-bold transition-colors duration-300 ${
                            index <= currentStep
                              ? "text-emerald-600"
                              : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Produk Dibeli</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                    order.status,
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              {/* Display all items in this order */}
              <div className="space-y-4">
                {(order.items || [order]).map(
                  (item: OrderItem | Order, index: number) => (
                    <div
                      key={item.id || `${order.id}-${index}`}
                      className="flex gap-4 items-start py-4 border-t border-gray-100 first:border-t-0"
                    >
                      <div className="relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                        <Image
                          src={
                            item.product?.image_url ||
                            order.product?.image_url ||
                            "https://via.placeholder.com/150?text=No+Image"
                          }
                          alt={
                            item.product?.name ||
                            order.product?.name ||
                            "Product"
                          }
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">
                          {item.product?.name || order.product?.name}
                        </h4>
                        <p className="text-gray-500 text-sm mt-1">
                          {item.quantity || order.quantity} x Rp{" "}
                          {(
                            item.price_each || order.price_each
                          )?.toLocaleString("id-ID")}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                            Berat:{" "}
                            {((item.product?.weight ||
                              order.product?.weight ||
                              0) *
                              (item.quantity || order.quantity)) /
                              1000}{" "}
                            kg
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600 text-lg">
                          Rp{" "}
                          {(
                            item.total_price || order.total_price
                          )?.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Shipping Info */}
            {(order.status === "shipped" || order.status === "completed") &&
              order.items &&
              order.items.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Informasi Pengiriman
                  </h3>
                  {/* Show shipping for first item - assuming all items in a checkout ship together */}
                  {order.items[0]?.shipments &&
                    order.items[0].shipments.length > 0 &&
                    order.items[0].shipments.map((shipment: Shipment) => (
                      <div key={shipment.id} className="space-y-4">
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Kurir</p>
                            <p className="font-bold text-gray-900">
                              {shipment.courier_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Resi</p>
                            <p className="font-mono font-bold text-gray-900">
                              {shipment.tracking_number || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 p-3 rounded-xl">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm text-blue-800">
                              <span className="font-semibold">Status: </span>
                              {shipment.status === "packing" &&
                                "Sedang Dikemas"}
                              {shipment.status === "shipping" &&
                                "Dalam Perjalanan"}
                              {shipment.status === "delivered" &&
                                "Telah Diterima"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Notes/Catatan */}
            {order.checkout?.notes && (
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-amber-600 shrink-0 mt-0.5"
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
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-900 mb-2">
                      Catatan untuk Penjual
                    </h3>
                    <p className="text-sm text-gray-700 italic leading-relaxed">
                      &ldquo;{order.checkout.notes}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
              <h3 className="font-bold text-gray-900 mb-6">Rincian Harga</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Total Harga Barang</span>
                  <span>
                    Rp {(order.total_price || 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Biaya Pengiriman</span>
                  <span>
                    Rp {(order.shipping_price || 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Biaya Layanan</span>
                  <span>Rp 0</span>
                </div>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Bayar</span>
                  <span className="text-xl font-bold text-emerald-600">
                    Rp{" "}
                    {(
                      order.grand_total ||
                      order.total_price ||
                      0
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {order.status === "pending" && (
                  <button
                    onClick={handlePayNow}
                    disabled={processingPayment}
                    className={`mt-4 inline-flex items-center px-6 py-3 align-center justify-center w-full border border-transparent text-base font-medium rounded-xl text-white transition-all shadow-lg ${
                      processingPayment
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:shadow-emerald-700/30"
                    }`}
                  >
                    {processingPayment ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
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
                        Memproses...
                      </>
                    ) : (
                      <>
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
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Bayar Sekarang
                      </>
                    )}
                  </button>
                )}
                {order.status === "completed" && (
                  <button className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 font-medium shadow-lg shadow-emerald-600/20 transition-colors">
                    Beli Lagi
                  </button>
                )}
                <button className="w-full bg-white text-emerald-600 border border-emerald-600 py-3 rounded-xl hover:bg-emerald-50 font-medium transition-colors">
                  Hubungi Penjual
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
