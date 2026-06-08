"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import Image from "next/image";
import { api } from "@/lib/api/client";
import ComingSoon from "@/components/shared/ComingSoon";

interface StoreSettings {
  storeName: string;
  storeDescription: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeLogo: string;
}

interface AccountSettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserData {
  name?: string;
  email?: string;
  role?: string;
}

// Helper function to get initial user data
function getInitialUser(): UserData | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

// Helper function to get initial settings
function getInitialSettings<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
}

const defaultStoreSettings: StoreSettings = {
  storeName: "Sedulur Tani",
  storeDescription: "Marketplace pupuk dan kebutuhan pertanian terlengkap",
  storeEmail: "info@sedulurtani.com",
  storePhone: "081234567890",
  storeAddress: "Jl. Pertanian No. 123, Yogyakarta",
  storeLogo: "",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("store");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [storeSettings, setStoreSettings] =
    useState<StoreSettings>(defaultStoreSettings);
  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "success" | "warning" | "error",
  });

  // Load data on mount (client-side only)
  useEffect(() => {
    startTransition(() => {
      setUser(getInitialUser());
      setStoreSettings(
        getInitialSettings("storeSettings", defaultStoreSettings),
      );
    });
  }, []);

  // Handle logo upload to Cloudinary
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setAlertConfig({
        title: "Format File Salah",
        message: "File harus berupa gambar!",
        type: "error",
      });
      setShowAlert(true);
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setAlertConfig({
        title: "File Terlalu Besar",
        message: "Ukuran file maksimal 2MB!",
        type: "error",
      });
      setShowAlert(true);
      return;
    }

    setUploadingLogo(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/cloudinary/test-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        const logoUrl = response.data.data.secure_url;
        setStoreSettings((prev) => ({ ...prev, storeLogo: logoUrl }));
        // Auto save to localStorage
        const updatedSettings = { ...storeSettings, storeLogo: logoUrl };
        localStorage.setItem("storeSettings", JSON.stringify(updatedSettings));
      } else {
        setAlertConfig({
          title: "Upload Gagal",
          message: "Gagal mengupload logo!",
          type: "error",
        });
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setAlertConfig({
        title: "Terjadi Kesalahan",
        message: "Terjadi kesalahan saat mengupload logo!",
        type: "error",
      });
      setShowAlert(true);
    } finally {
      setUploadingLogo(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle remove logo
  const handleRemoveLogo = () => {
    setStoreSettings((prev) => ({ ...prev, storeLogo: "" }));
    const updatedSettings = { ...storeSettings, storeLogo: "" };
    localStorage.setItem("storeSettings", JSON.stringify(updatedSettings));
  };

  const handleSave = async () => {
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Save to localStorage (in real app, this would be API call)
    localStorage.setItem("storeSettings", JSON.stringify(storeSettings));

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = async () => {
    if (accountSettings.newPassword !== accountSettings.confirmPassword) {
      setAlertConfig({
        title: "Password Tidak Cocok",
        message: "Password baru dan konfirmasi tidak cocok!",
        type: "error",
      });
      setShowAlert(true);
      return;
    }
    if (accountSettings.newPassword.length < 6) {
      setAlertConfig({
        title: "Password Terlalu Pendek",
        message: "Password minimal 6 karakter!",
        type: "error",
      });
      setShowAlert(true);
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);

    setAlertConfig({
      title: "Berhasil",
      message: "Password berhasil diubah!",
      type: "success",
    });
    setShowAlert(true);
    setAccountSettings({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const tabs = [
    {
      id: "store",
      name: "Profil Toko",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    },
    {
      id: "account",
      name: "Akun",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
    {
      id: "shipping",
      name: "Pengiriman",
      icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
    },
    {
      id: "notifications",
      name: "Notifikasi",
      icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    },
    {
      id: "appearance",
      name: "Tampilan",
      icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Pengaturan
        </h1>
        <p className="text-gray-600 mt-1">
          Kelola pengaturan toko dan akun Anda
        </p>
      </div>

      {/* Success Toast */}
      {saved && (
        <div className="fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-top">
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
          Pengaturan berhasil disimpan!
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/50">
            <nav className="p-4 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-5 h-5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={tab.icon}
                    />
                  </svg>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 lg:p-8">
            {/* Store Settings */}
            {activeTab === "store" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Profil Toko
                  </h2>
                  <p className="text-sm text-gray-500">
                    Informasi dasar tentang toko Anda
                  </p>
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Toko
                    </label>
                    <input
                      type="text"
                      value={storeSettings.storeName}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          storeName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi Toko
                    </label>
                    <textarea
                      rows={3}
                      value={storeSettings.storeDescription}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          storeDescription: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Toko
                      </label>
                      <input
                        type="email"
                        value={storeSettings.storeEmail}
                        onChange={(e) =>
                          setStoreSettings({
                            ...storeSettings,
                            storeEmail: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        value={storeSettings.storePhone}
                        onChange={(e) =>
                          setStoreSettings({
                            ...storeSettings,
                            storePhone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Toko
                    </label>
                    <textarea
                      rows={2}
                      value={storeSettings.storeAddress}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          storeAddress: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo Toko
                    </label>
                    <div className="flex items-center gap-4">
                      {/* Logo Preview */}
                      <div className="relative w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                        {storeSettings.storeLogo ? (
                          <>
                            <Image
                              src={storeSettings.storeLogo}
                              alt="Store Logo"
                              fill
                              className="object-cover"
                            />
                            {/* Remove button */}
                            <button
                              onClick={handleRemoveLogo}
                              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                              title="Hapus Logo"
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Upload Button */}
                      <div className="flex flex-col gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-2 ${
                            uploadingLogo
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          }`}
                        >
                          {uploadingLogo ? (
                            <>
                              <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                              Mengupload...
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
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                              </svg>
                              Upload Logo
                            </>
                          )}
                        </label>
                        <p className="text-xs text-gray-500">
                          PNG, JPG max 2MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Menyimpan...
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
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Account Settings */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Pengaturan Akun
                  </h2>
                  <p className="text-sm text-gray-500">
                    Kelola kredensial dan keamanan akun
                  </p>
                </div>

                {/* Profile Info */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name?.charAt(0) || "A"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user?.name || "Admin User"}
                      </h3>
                      <p className="text-gray-500">
                        {user?.email || "admin@sedulurtani.com"}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full capitalize">
                        {user?.role || "seller"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="border-t pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Ubah Password
                  </h3>
                  <div className="grid gap-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Saat Ini
                      </label>
                      <input
                        type="password"
                        value={accountSettings.currentPassword}
                        onChange={(e) =>
                          setAccountSettings({
                            ...accountSettings,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Baru
                      </label>
                      <input
                        type="password"
                        value={accountSettings.newPassword}
                        onChange={(e) =>
                          setAccountSettings({
                            ...accountSettings,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konfirmasi Password Baru
                      </label>
                      <input
                        type="password"
                        value={accountSettings.confirmPassword}
                        onChange={(e) =>
                          setAccountSettings({
                            ...accountSettings,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <button
                      onClick={handlePasswordChange}
                      disabled={
                        loading ||
                        !accountSettings.currentPassword ||
                        !accountSettings.newPassword
                      }
                      className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50 w-fit"
                    >
                      Ubah Password
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t pt-6">
                  <h3 className="font-medium text-red-600 mb-4">
                    Zona Berbahaya
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-red-800">Hapus Akun</h4>
                        <p className="text-sm text-red-600 mt-1">
                          Setelah dihapus, semua data akan hilang permanen dan
                          tidak dapat dikembalikan.
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium whitespace-nowrap">
                        Hapus Akun
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Settings */}
            {activeTab === "shipping" && (
              <ComingSoon
                title="Pengaturan Pengiriman"
                description="Fitur pengaturan pengiriman seperti gratis ongkir dan kurir default sedang dalam pengembangan"
              >
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      Pengaturan Pengiriman
                    </h2>
                    <p className="text-sm text-gray-500">
                      Atur preferensi pengiriman toko
                    </p>
                  </div>

                  <div className="grid gap-6">
                    {/* Free Shipping Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Aktifkan Gratis Ongkir
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Berikan gratis ongkir untuk pembelian minimum tertentu
                        </p>
                      </div>
                      <button className="relative w-14 h-8 rounded-full bg-emerald-500">
                        <span className="absolute top-1 w-6 h-6 bg-white rounded-full shadow translate-x-7" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Pembelian Gratis Ongkir
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          Rp
                        </span>
                        <input
                          type="number"
                          defaultValue={500000}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl"
                          readOnly
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kurir Default
                      </label>
                      <select
                        defaultValue="jne"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                        disabled
                      >
                        <option value="jne">JNE</option>
                        <option value="jnt">J&T Express</option>
                      </select>
                    </div>

                    {/* Available Couriers */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Kurir Tersedia
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {["JNE", "J&T Express", "SiCepat"].map((courier) => (
                          <label
                            key={courier}
                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl"
                          >
                            <input
                              type="checkbox"
                              defaultChecked
                              className="w-5 h-5 text-emerald-500 rounded"
                              disabled
                            />
                            <span className="font-medium text-gray-700">
                              {courier}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ComingSoon>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <ComingSoon
                title="Pengaturan Notifikasi"
                description="Fitur notifikasi email untuk pesanan baru, pembayaran, dan pengiriman sedang dalam pengembangan"
              >
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      Pengaturan Notifikasi
                    </h2>
                    <p className="text-sm text-gray-500">
                      Atur notifikasi email yang ingin Anda terima
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        title: "Pesanan Baru",
                        description: "Terima email saat ada pesanan baru masuk",
                        enabled: true,
                      },
                      {
                        title: "Pembayaran Diterima",
                        description:
                          "Terima email saat pembayaran berhasil dikonfirmasi",
                        enabled: true,
                      },
                      {
                        title: "Status Pengiriman",
                        description:
                          "Terima email saat status pengiriman berubah",
                        enabled: false,
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
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
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <button
                          className={`relative w-14 h-8 rounded-full ${item.enabled ? "bg-emerald-500" : "bg-gray-300"}`}
                        >
                          <span
                            className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow ${item.enabled ? "translate-x-7" : "translate-x-1"}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </ComingSoon>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <ComingSoon
                title="Pengaturan Tampilan"
                description="Fitur kustomisasi tema, warna, dan layout dashboard sedang dalam pengembangan"
              >
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      Pengaturan Tampilan
                    </h2>
                    <p className="text-sm text-gray-500">
                      Sesuaikan tampilan dashboard admin
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Theme */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tema
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { name: "Terang", bg: "bg-white", selected: true },
                          { name: "Gelap", bg: "bg-gray-900", selected: false },
                          {
                            name: "Sistem",
                            bg: "bg-linear-to-r from-white to-gray-900",
                            selected: false,
                          },
                        ].map((theme) => (
                          <button
                            key={theme.name}
                            className={`p-4 rounded-xl border-2 ${theme.selected ? "border-emerald-500" : "border-gray-200"}`}
                          >
                            <div
                              className={`w-full h-16 rounded-lg ${theme.bg} mb-3 border border-gray-200`}
                            ></div>
                            <span className="font-medium text-gray-700">
                              {theme.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Primary Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Warna Utama
                      </label>
                      <div className="flex gap-3">
                        {[
                          "bg-emerald-500",
                          "bg-blue-500",
                          "bg-purple-500",
                          "bg-orange-500",
                          "bg-red-500",
                        ].map((color, i) => (
                          <button
                            key={color}
                            className={`w-10 h-10 rounded-full ${color} ${i === 0 ? "ring-4 ring-offset-2 ring-emerald-500/50" : ""}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Sidebar Position */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Posisi Sidebar
                      </label>
                      <div className="flex gap-4">
                        <button className="flex-1 p-4 rounded-xl border-2 border-emerald-500">
                          <div className="flex gap-2 mb-2">
                            <div className="w-4 h-8 bg-emerald-500 rounded"></div>
                            <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Kiri
                          </span>
                        </button>
                        <button className="flex-1 p-4 rounded-xl border-2 border-gray-200">
                          <div className="flex gap-2 mb-2">
                            <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                            <div className="w-4 h-8 bg-gray-400 rounded"></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Kanan
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </ComingSoon>
            )}
          </div>
        </div>
      </div>

      {/* Alert Component */}
      {showAlert && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            alertConfig.type === "success"
              ? "bg-green-500 text-white"
              : alertConfig.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{alertConfig.title}</h3>
              <p className="text-sm">{alertConfig.message}</p>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
