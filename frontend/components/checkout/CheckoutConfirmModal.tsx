"use client";

import Image from "next/image";
import { Cart, Address } from "@/lib/types";

interface CheckoutConfirmModalProps {
  cart: Cart;
  selectedAddress: Address;
  shippingPrice: number;
  notes: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export default function CheckoutConfirmModal({
  cart,
  selectedAddress,
  shippingPrice,
  notes,
  onConfirm,
  onCancel,
  isProcessing,
}: CheckoutConfirmModalProps) {
  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + shippingPrice;
  };

  const calculateTotalWeight = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + item.product.weight * item.quantity;
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-linear-to-r from-emerald-50 to-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
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
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Konfirmasi Pesanan
              </h3>
              <p className="text-xs text-gray-600">
                Periksa kembali detail pesanan Anda
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            aria-label="Close"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Address Section */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
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
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Alamat Pengiriman
                </p>
                <p className="font-semibold text-gray-900">
                  {selectedAddress.recipient_name}
                </p>
                <p className="text-sm text-gray-600">{selectedAddress.phone}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedAddress.address_line}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedAddress.city}, {selectedAddress.province}{" "}
                  {selectedAddress.postal_code}
                </p>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Produk Pesanan ({cart.total_items} item)
            </h4>
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.product.image_url || "/placeholder-product.png"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 text-sm truncate">
                      {item.product.name}
                    </h5>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.quantity} x Rp{" "}
                      {item.product.price.toLocaleString("id-ID")}
                    </p>
                    <p className="font-bold text-emerald-600 text-sm mt-1">
                      Rp{" "}
                      {(item.product.price * item.quantity).toLocaleString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          {notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Catatan Pesanan
                  </p>
                  <p className="text-sm text-gray-600">{notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">
                Rp {calculateSubtotal().toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <span className="text-gray-600">Ongkir</span>
                <span className="text-xs text-gray-400 block">
                  {(calculateTotalWeight() / 1000).toFixed(2)} kg
                </span>
              </div>
              <span className="font-medium text-gray-900">
                Rp {shippingPrice.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="font-bold text-gray-900">Total Pembayaran</span>
              <span className="text-xl font-bold text-emerald-600">
                Rp {calculateTotal().toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kembali
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  Lanjutkan Pembayaran
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan kami
          </p>
        </div>
      </div>
    </div>
  );
}
