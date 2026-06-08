"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import bgLogin from "@/public/image/login-bg.png";
import { Eye, EyeOff } from "lucide-react";
import Alert from "@/components/shared/Alert";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPasswordAlert, setShowForgotPasswordAlert] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!email || !password) {
      setError("Email dan password harus diisi");
      return;
    }

    if (!email.includes("@")) {
      setError("Format email tidak valid");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting login with:", { email, password: "***" });
      const response = await authApi.login({ email, password });
      console.log("Login response:", response.data);

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
    } catch (err: unknown) {
      console.error("Login failed:", err);
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      console.error("Error response:", error.response?.data);

      if (error.response?.status === 400) {
        setError(
          "Email atau password tidak valid. Pastikan semua field terisi dengan benar.",
        );
      } else if (error.response?.status === 401) {
        setError("Email atau password salah.");
      } else {
        setError(
          error.response?.data?.message ||
            "Gagal masuk. Periksa email dan kata sandi Anda.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left Side - Image */}
          <div className="relative bg-linear-to-br from-emerald-600 to-emerald-800 p-12 hidden md:flex flex-col justify-between min-h-[500px]">
            <div className="absolute inset-0">
              <Image
                src={bgLogin}
                alt="Login Background"
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
                Kelola Bisnis
                <br />
                Pertanian Anda
              </h1>
              <p className="text-emerald-100 text-lg">
                Platform terpercaya untuk kebutuhan pupuk dan pertanian
              </p>
            </div>

            <div className="relative z-10 flex gap-2">
              <div className="w-8 h-1 bg-white rounded-full"></div>
              <div className="w-8 h-1 bg-white/40 rounded-full"></div>
              <div className="w-8 h-1 bg-white/40 rounded-full"></div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-12 flex flex-col justify-center bg-gray-50">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Masuk ke Akun
              </h2>
              <p className="text-gray-600">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Daftar
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none text-gray-900 placeholder-gray-400 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Ingat saya</span>
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForgotPasswordAlert(true);
                  }}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Lupa kata sandi?
                </button>
              </div>

              {/* Login Button */}
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
                    Memproses...
                  </span>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Forgot Password Alert */}
      {showForgotPasswordAlert && (
        <Alert
          title="Segera Hadir"
          message="Fitur reset password sedang dalam pengembangan.&#10;&#10;Silakan hubungi admin untuk bantuan reset password."
          type="warning"
          onClose={() => setShowForgotPasswordAlert(false)}
        />
      )}
    </div>
  );
}
