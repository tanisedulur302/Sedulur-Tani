"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import bgLogin from "@/public/image/login-bg.png";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "buyer", // Default role
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreeTerms) {
      setError("Anda harus menyetujui syarat dan ketentuan");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);

    try {
      // Call register API
      const response = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role as "buyer" | "seller",
      });

      // If registration returns token (auto-login), save it
      if (response.data.data?.token) {
        const { token, user } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Trigger auth event for other components to update
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("auth-changed"));

        // Redirect based on role
        if (user.role === "seller" || user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        // Fallback to login page if no token returned
        router.push("/login");
      }
    } catch (err: unknown) {
      console.error("Registration failed:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "Gagal mendaftar. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden mt-20">
        <div className="grid md:grid-cols-2">
          {/* Left Side - Image */}
          <div className="relative bg-linear-to-br from-emerald-600 to-emerald-800 p-12 hidden md:flex flex-col justify-between min-h-[800px]">
            <div className="absolute inset-0">
              <Image
                src={bgLogin}
                alt="Register Background"
                fill
                className="object-cover opacity-40"
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-white text-2xl font-bold">
                  Sedulur Tani
                </span>
              </div>
            </div>

            <div className="relative z-10 text-white">
              <h1 className="text-4xl font-bold mb-3 leading-tight">
                Bergabung Bersama
                <br />
                Kami Sekarang
              </h1>
              <p className="text-emerald-100 text-lg mb-6">
                Daftar dan nikmati kemudahan bertransaksi pupuk dan kebutuhan
                pertanian
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <span className="text-emerald-50">
                    Transaksi aman dan terpercaya
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <span className="text-emerald-50">
                    Produk berkualitas terjamin
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <span className="text-emerald-50">
                    Pengiriman cepat dan mudah
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex gap-2">
              <div className="w-8 h-1 bg-white/40 rounded-full"></div>
              <div className="w-8 h-1 bg-white rounded-full"></div>
              <div className="w-8 h-1 bg-white/40 rounded-full"></div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 lg:p-12 flex flex-col justify-center bg-gray-50">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Buat Akun Baru
              </h2>
              <p className="text-gray-600">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Masuk
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Phone Input */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 8 karakter"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none text-gray-900 placeholder-gray-400 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
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
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi kata sandi"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none text-gray-900 placeholder-gray-400 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
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
                    )}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-1 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  Saya menyetujui{" "}
                  <Link
                    href="/terms"
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Syarat dan Ketentuan
                  </Link>{" "}
                  serta{" "}
                  <Link
                    href="/privacy"
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Kebijakan Privasi
                  </Link>
                </label>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
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
                    Mendaftar...
                  </span>
                ) : (
                  "Daftar Sekarang"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
