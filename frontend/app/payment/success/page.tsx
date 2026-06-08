"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const [countdown, setCountdown] = useState(5);

  // Trigger cart update when payment is successful
  useEffect(() => {
    if (status === "success") {
      // Dispatch event to update cart badge in navbar
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart-updated"));
      }
    }
  }, [status]);

  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status]);

  useEffect(() => {
    if (status === "success" && countdown === 0) {
      router.push("/orders");
    }
  }, [countdown, status, router]);

  if (status === "success") {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Success Animation */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg
                className="w-12 h-12 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Pembayaran Berhasil!
            </h1>
            <p className="text-gray-600 mb-8">
              Terima kasih telah melakukan pembayaran. Pesanan Anda sedang
              diproses dan akan segera dikirim.
            </p>

            {/* Order Info */}
            <div className="bg-emerald-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center gap-2 text-emerald-700 mb-2">
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
                <span className="font-semibold">Status Pembayaran</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">Lunas</p>
            </div>

            {/* Next Steps */}
            <div className="text-left mb-6 bg-gray-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Langkah Selanjutnya
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">1.</span>
                  <span>Pesanan akan diproses oleh penjual</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">2.</span>
                  <span>Barang akan dikemas dan dikirim</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">3.</span>
                  <span>Lacak pesanan melalui halaman Orders</span>
                </li>
              </ul>
            </div>

            {/* Auto Redirect Info */}
            <div className="text-sm text-gray-500 mb-6">
              Otomatis dialihkan ke halaman pesanan dalam{" "}
              <span className="font-bold text-emerald-600">{countdown}</span>{" "}
              detik
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/orders"
                className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Lihat Pesanan
              </Link>
              <Link
                href="/"
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
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
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-amber-600"
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
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Menunggu Pembayaran
            </h1>
            <p className="text-gray-600 mb-8">
              Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran
              sesuai instruksi yang diberikan.
            </p>

            <div className="bg-amber-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-semibold">Status Pembayaran</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">Pending</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/orders"
                className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
              >
                Lihat Status Pesanan
              </Link>
              <Link
                href="/"
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default/Error state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Status Tidak Diketahui
          </h1>
          <p className="text-gray-600 mb-8">
            Silakan cek status pesanan Anda di halaman Orders.
          </p>

          <Link
            href="/orders"
            className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Lihat Pesanan Saya
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
