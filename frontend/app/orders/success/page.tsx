"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    // Optional: Verify order status if needed, but basic display is fine
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 pt-24">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-10 h-10 text-emerald-600"
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
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pembayaran Berhasil!
          </h1>
          <p className="text-gray-500">
            Terima kasih telah berbelanja di Sedulur Tani. Pesanan Anda akan
            segera kami proses.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">ID Pesanan</p>
          <p className="font-mono font-bold text-gray-900 tracking-wider">
            {orderId || "-"}
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/orders"
            className="block w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
          >
            Lihat Pesanan Saya
          </Link>
          <Link
            href="/"
            className="block w-full py-3.5 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 pt-24">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
          <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
