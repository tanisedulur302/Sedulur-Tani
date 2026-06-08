"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ordersApi, paymentApi } from "@/lib/api";
import { Order } from "@/lib/types";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingPayment, setProcessingPayment] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getAll();
      setOrders(response.data.data.orders || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat data pesanan");
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (checkoutId: string) => {
    try {
      setProcessingPayment(checkoutId);
      setError("");

      // Create payment for existing checkout
      const response = await paymentApi.create({ checkout_id: checkoutId });
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
            setProcessingPayment(null);
            setError("Pembayaran dibatalkan. Silakan coba lagi.");
          }
        }, 500);

        // Poll payment status
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await paymentApi.getStatus(checkoutId);
            const status = statusResponse.data.data.transaction_status;

            if (status === "PAID" || status === "SETTLED") {
              paymentCompleted = true;
              clearInterval(pollInterval);
              clearInterval(windowCheckInterval);
              setProcessingPayment(null);
              fetchOrders(); // Refresh orders
              if (paymentWindow && !paymentWindow.closed) {
                paymentWindow.close();
              }
              router.push("/payment/success");
            } else if (status === "EXPIRED" || status === "FAILED") {
              clearInterval(pollInterval);
              clearInterval(windowCheckInterval);
              setProcessingPayment(null);
              setError("Pembayaran gagal atau kadaluarsa");
            }
          } catch (error) {
            console.error("Error polling payment status:", error);
          }
        }, 3000); // Poll every 3 seconds

        // Stop polling after 10 minutes
        setTimeout(() => {
          if (!paymentCompleted) {
            clearInterval(pollInterval);
            clearInterval(windowCheckInterval);
            setProcessingPayment(null);
            if (!windowClosed) {
              setError("Waktu pembayaran habis. Silakan coba lagi.");
            }
          }
        }, 600000);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || "Gagal memproses pembayaran");
      setProcessingPayment(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      processed: "bg-blue-100 text-blue-700 border-blue-200",
      shipped: "bg-purple-100 text-purple-700 border-purple-200",
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
      paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return statusClasses[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Menunggu Pembayaran",
      processed: "Diproses",
      shipped: "Dikirim",
      completed: "Selesai",
      cancelled: "Dibatalkan",
      paid: "Dibayar",
    };
    return labels[status] || status;
  };

  // Helper function to get actual order status from items
  const getOrderStatus = (order: any): string => {
    // If order has items, use the first item's status (actual order status)
    if (order.items && order.items.length > 0) {
      return order.items[0].status;
    }
    // Fallback to checkout status
    return order.status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-48"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Pesanan</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
            <svg
              className="w-5 h-5 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Info for pending orders */}
        {orders.some((o: any) => getOrderStatus(o) === "pending") && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
            <svg
              className="w-5 h-5 mt-0.5 shrink-0"
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
            <div>
              <p className="font-medium">Pesanan menunggu pembayaran</p>
              <p className="text-sm mt-1">
                Segera selesaikan pembayaran untuk memproses pesanan Anda. Klik
                tombol &quot;Bayar Sekarang&quot; untuk melanjutkan pembayaran.
              </p>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Belum ada pesanan
            </h2>
            <p className="text-gray-500 mb-8">
              Mulai belanja sayur dan buah segar sekarang.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          {new Date(order.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <span className="hidden md:inline">•</span>
                      <span>ID: {order.id}</span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(getOrderStatus(order))}`}
                    >
                      {getStatusLabel(getOrderStatus(order))}
                    </span>
                  </div>

                  {/* Display all items in this order */}
                  <div className="space-y-4">
                    {(order.items || [order]).map(
                      (item: any, index: number) => (
                        <div
                          key={item.id || `${order.id}-${index}`}
                          className="flex gap-4 items-center"
                        >
                          <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
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
                              className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                              {item.product?.name || order.product?.name}
                            </h3>
                            <p className="text-gray-500 text-sm mb-2">
                              {item.quantity || order.quantity} barang x Rp{" "}
                              {(
                                item.price_each || order.price_each
                              )?.toLocaleString("id-ID")}
                            </p>
                            <p className="text-gray-700 text-sm font-medium">
                              Subtotal: Rp{" "}
                              {(
                                item.total_price || order.total_price
                              )?.toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">
                        Total Produk:
                      </span>
                      <span className="text-sm font-medium">
                        Rp {(order.total_price || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    {order.shipping_price && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">
                          Ongkos Kirim:
                        </span>
                        <span className="text-sm font-medium">
                          Rp{" "}
                          {(order.shipping_price || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                      <span className="text-base font-medium text-gray-900">
                        Total Pembayaran:
                      </span>
                      <span className="text-lg font-bold text-emerald-600">
                        Rp{" "}
                        {(
                          order.grand_total ||
                          order.total_price ||
                          0
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2 justify-end">
                    {getOrderStatus(order) === "pending" && (
                      <button
                        onClick={() =>
                          handlePayNow(order.checkout_id || order.id)
                        }
                        disabled={
                          processingPayment === (order.checkout_id || order.id)
                        }
                        className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {processingPayment ===
                        (order.checkout_id || order.id) ? (
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
                            Memproses...
                          </>
                        ) : (
                          <>
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
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                            Bayar Sekarang
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Lihat Detail
                    </button>
                    {getOrderStatus(order) === "completed" && (
                      <button className="px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                        Beli Lagi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
