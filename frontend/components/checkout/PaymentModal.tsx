"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PaymentModalProps {
  invoiceUrl: string;
  checkoutId: string;
  onClose: () => void;
}

export default function PaymentModal({
  invoiceUrl,
  checkoutId,
  onClose,
}: PaymentModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for payment completion message from iframe
    const handleMessage = (event: MessageEvent) => {
      // Security: Only accept messages from Xendit domains
      if (!event.origin.includes("xendit.co")) return;

      // Xendit sends messages when payment is completed
      if (
        event.data?.status === "PAID" ||
        event.data?.type === "payment.success"
      ) {
        // Payment successful, redirect to orders
        setTimeout(() => {
          router.push("/orders");
        }, 1500);
      }
    };

    window.addEventListener("message", handleMessage);

    // Poll payment status every 5 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/${checkoutId}/status`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === "PAID" || data.status === "SETTLED") {
            clearInterval(pollInterval);
            setTimeout(() => {
              router.push("/orders");
            }, 1500);
          }
        }
      } catch (error) {
        console.error("Error polling payment status:", error);
      }
    }, 5000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(pollInterval);
    };
  }, [checkoutId, router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
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
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Pembayaran</h3>
              <p className="text-xs text-gray-600">
                Selesaikan pembayaran Anda dengan aman
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-90">
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 text-emerald-600 mx-auto mb-4"
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
              <p className="text-gray-600 font-medium">
                Memuat halaman pembayaran...
              </p>
            </div>
          </div>
        )}

        {/* Iframe Container */}
        <div className="relative bg-gray-50">
          <iframe
            src={invoiceUrl}
            className="w-full h-[600px] border-0"
            onLoad={() => setIsLoading(false)}
            title="Payment Gateway"
            allow="payment"
          />
        </div>

        {/* Footer Info */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-start gap-3 text-sm">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <div className="text-gray-600">
              <p className="font-medium text-gray-900 mb-1">Pembayaran Aman</p>
              <p className="text-xs leading-relaxed">
                Transaksi Anda dilindungi dengan enkripsi SSL 256-bit. Setelah
                pembayaran berhasil, Anda akan diarahkan ke halaman pesanan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
