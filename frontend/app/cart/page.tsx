"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cartApi } from "@/lib/api";
import { Cart } from "@/lib/types";
import { toast } from "@/lib/toast";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<string[]>([]);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cartApi.getCart();
      setCart(response.data.data.cart);
    } catch (error: unknown) {
      console.error("Failed to fetch cart:", error);
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response &&
        error.response.status === 401
      ) {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingItems((prev) => [...prev, itemId]);
      await cartApi.updateItem(itemId, { quantity: newQuantity });

      // Update local state optimistically or refetch
      // Here we'll refetch to ensure calculations are correct from backend
      await fetchCart();

      // Notify navbar to update cart count
      window.dispatchEvent(new Event("cart-updated"));
      toast.success("Jumlah produk berhasil diperbarui");
    } catch (error: unknown) {
      console.error("Failed to update quantity:", error);
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Gagal mengupdate keranjang";
      toast.error(errorMessage);
    } finally {
      setUpdatingItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdatingItems((prev) => [...prev, itemId]);
      await cartApi.removeItem(itemId);
      await fetchCart();
    } catch (error: unknown) {
      console.error("Failed to remove item:", error);
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Gagal menghapus item";
      toast.error(errorMessage);
    } finally {
      setUpdatingItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8 pt-24 pb-16">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-80 bg-white rounded-2xl p-6 shadow-sm"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-6 pt-20 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Keranjang Belanja
          </h1>
          <p className="text-gray-600">
            Kelola produk pilihan Anda sebelum checkout
          </p>
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200 max-w-xl mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Keranjang Anda Kosong
            </h2>
            <p className="text-gray-500 mb-6">
              Yuk isi dengan produk-produk segar dari petani lokal!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Mulai Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-gray-300 transition-colors flex gap-4 group"
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={
                        item.product.image_url ||
                        "https://via.placeholder.com/150?text=No+Image"
                      }
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <Link
                          href={`/products/${item.product.id}`}
                          className="text-lg font-bold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <svg
                            className="w-3 h-3 text-gray-400"
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
                          <p className="text-xs text-gray-500">
                            {item.product.seller?.name || "Penjual"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-medium">
                            Rp {item.product.price.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={updatingItems.includes(item.id)}
                        className="ml-4 p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all disabled:opacity-50 shrink-0"
                        title="Hapus dari keranjang"
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

                    <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-medium">
                          Qty:
                        </span>
                        <div className="flex items-center border border-emerald-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={
                              item.quantity <= 1 ||
                              updatingItems.includes(item.id)
                            }
                            className="px-3 py-1 hover:bg-emerald-50 text-emerald-600 font-bold transition-colors disabled:opacity-50"
                          >
                            −
                          </button>
                          <span className="w-10 text-center text-sm font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={
                              item.quantity >= item.product.stock ||
                              updatingItems.includes(item.id)
                            }
                            className="px-3 py-1 hover:bg-emerald-50 text-emerald-600 font-bold transition-colors disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Total</p>
                        <p className="text-base font-bold text-gray-900">
                          Rp{" "}
                          {(item.product.price * item.quantity).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Ringkasan Belanja
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Total Item</span>
                    <span className="font-semibold text-gray-900">
                      {cart.total_items} produk
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">
                        Total Harga
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        Rp {cart.total_price.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
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
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.6 8M7 13v6a1 1 0 001 1h9a1 1 0 001-1v-6M7 13l-1.6-8"
                    />
                  </svg>
                  Lanjut ke Checkout
                </button>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">🔒 Pembayaran aman</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
