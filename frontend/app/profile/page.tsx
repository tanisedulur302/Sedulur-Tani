"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi, addressApi, userApi, shippingApi } from "@/lib/api";
import { User, Address } from "@/lib/types";
import { toast } from "@/lib/toast";
import { ComingSoonCard } from "@/components/shared/ComingSoon";

type TabType = "personal" | "addresses" | "settings";

interface Province {
  id: string;
  name: string;
}

interface Regency {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Address Modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    recipient_name: "",
    phone: "",
    address_line: "",
    city: "",
    province: "",
    postal_code: "",
    is_default: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Location data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedRegencyId, setSelectedRegencyId] = useState("");
  const [loadingLocations, setLoadingLocations] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await authApi.getProfile();
      const userData = response.data.data?.user || response.data.data;

      if (!userData) {
        throw new Error("User data not found in response");
      }

      setUser(userData);
      setProfileForm({
        name: userData.name,
        phone: userData.phone || "",
        email: userData.email,
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      const err = error as { response?: { status?: number } };

      // If API fails, try to get user from localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const localUser = JSON.parse(userStr);
          setUser(localUser);
          setProfileForm({
            name: localUser.name,
            phone: localUser.phone || "",
            email: localUser.email,
          });
        } catch (e) {
          console.error("Failed to parse localStorage user:", e);
          if (err.response?.status === 401 || err.response?.status === 404) {
            router.push("/login");
          }
        }
      } else if (err.response?.status === 401 || err.response?.status === 404) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await addressApi.getAll();
      setAddresses(response.data.data.addresses || []);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchAddresses();
  }, [fetchUserData, fetchAddresses]);

  const fetchProvinces = async () => {
    try {
      setLoadingLocations(true);
      const response = await shippingApi.getProvinces();
      const provincesData = response.data.data || [];
      // Filter out invalid provinces without id
      const validProvinces = provincesData.filter(
        (p: Province) => p.id && p.name,
      );
      setProvinces(validProvinces);
      return validProvinces; // Return data for use in other functions
    } catch (error) {
      console.error("Failed to fetch provinces:", error);
      toast.error("Gagal memuat data provinsi");
      return [];
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchRegencies = async (provinceId: string) => {
    try {
      setLoadingLocations(true);
      const response = await shippingApi.getRegencies(provinceId);
      const regenciesData = response.data.data || [];
      // Filter out invalid regencies without id
      const validRegencies = regenciesData.filter(
        (r: Regency) => r.id && r.name,
      );
      setRegencies(validRegencies);
      // setDistricts([]); // Don't clear districts here as it might be needed for editing
      return validRegencies; // Return data
    } catch (error) {
      console.error("Failed to fetch regencies:", error);
      toast.error("Gagal memuat data kota/kabupaten");
      return [];
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchDistricts = async (regencyId: string) => {
    try {
      setLoadingLocations(true);
      const response = await shippingApi.getDistricts(regencyId);
      const districtsData = response.data.data || [];
      // Filter out invalid districts without id
      const validDistricts = districtsData.filter(
        (d: District) => d.id && d.name,
      );
      setDistricts(validDistricts);
      return validDistricts; // Return data
    } catch (error) {
      console.error("Failed to fetch districts:", error);
      toast.error("Gagal memuat data kecamatan");
      return [];
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSavingProfile(true);
      await userApi.updateProfile(user.id, profileForm);
      await fetchUserData();
      setIsEditingProfile(false);
      toast.success("Profil berhasil diperbarui");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenAddressModal = async (address?: Address) => {
    // Reset location states
    setSelectedProvinceId("");
    setSelectedRegencyId("");
    setRegencies([]);
    setDistricts([]);

    if (address) {
      setEditingAddress(address);
      setAddressForm({
        label: address.label,
        recipient_name: address.recipient_name,
        phone: address.phone,
        address_line: address.address_line,
        city: address.city,
        province: address.province,
        postal_code: address.postal_code,
        is_default: address.is_default,
      });

      // Pre-fill location dropdowns
      // 1. Load all provinces
      const fetchedProvinces = await fetchProvinces();

      // 2. Find province ID by name
      const currentProvince = fetchedProvinces.find(
        (p: Province) =>
          p.name.toLowerCase() === address.province.toLowerCase(),
      );

      if (currentProvince) {
        setSelectedProvinceId(currentProvince.id);

        // 3. Load regencies for this province
        const fetchedRegencies = await fetchRegencies(currentProvince.id);

        // 4. Find regency ID by name
        // Note: API might return "KABUPATEN X" or "KOTA X", but address.city might be just "X" or slightly different
        // Ideally we should store IDs, but since we store names, we try to match
        const currentRegency = fetchedRegencies.find(
          (r: Regency) => r.name.toLowerCase() === address.city.toLowerCase(),
        );

        if (currentRegency) {
          setSelectedRegencyId(currentRegency.id);

          // 5. Load districts for this regency
          await fetchDistricts(currentRegency.id);

          // 6. Set district/postal_code (which seems to be the subdistrict ID in this logic)
          // The form already has postal_code set from address.postal_code
          // Ensure it matches a valid district ID
        }
      }
    } else {
      setEditingAddress(null);
      setAddressForm({
        label: "",
        recipient_name: "",
        phone: "",
        address_line: "",
        city: "",
        province: "",
        postal_code: "",
        is_default: false,
      });
      // Load provinces when modal opens for new address
      await fetchProvinces();
    }

    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async () => {
    try {
      setSavingAddress(true);
      if (editingAddress) {
        await addressApi.update(editingAddress.id, addressForm);
        toast.success("Alamat berhasil diperbarui");
      } else {
        await addressApi.create(addressForm);
        toast.success("Alamat berhasil ditambahkan");
      }
      await fetchAddresses();
      setIsAddressModalOpen(false);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal menyimpan alamat");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await addressApi.delete(id);
      await fetchAddresses();
      toast.success("Alamat berhasil dihapus");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal menghapus alamat");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="bg-white rounded-2xl p-8 h-96"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pt-20 sm:pt-24 pb-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8">
          Profil Saya
        </h1>

        {/* Tabs */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab("personal")}
                className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "personal"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Informasi Pribadi
                </div>
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "addresses"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Alamat
                </div>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "settings"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Pengaturan
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-6 md:p-8">
            {/* Personal Information Tab */}
            {activeTab === "personal" && user && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full sm:w-auto">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {user.name}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-500 capitalize">
                        {user.role === "seller" ? "Penjual" : "Pembeli"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Profil
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium mt-1 break-all">
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">
                      Nomor Telepon
                    </label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium mt-1">
                      {user.phone || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">
                      Bergabung Sejak
                    </label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium mt-1">
                      {new Date(user.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Daftar Alamat
                  </h3>
                  <button
                    onClick={() => handleOpenAddressModal()}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Tambah Alamat
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
                    <p className="text-gray-500 font-medium">
                      Belum ada alamat tersimpan
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Tambahkan alamat untuk mempermudah pengiriman
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 transition-all ${
                          address.is_default
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 bg-white hover:border-emerald-200"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-3 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm sm:text-base text-gray-900">
                              {address.label}
                            </h4>
                            {address.is_default && (
                              <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full font-medium whitespace-nowrap">
                                Utama
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleOpenAddressModal(address)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-emerald-600 transition-colors"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-gray-600 hover:text-red-600 transition-colors"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs sm:text-sm">
                          <p className="font-medium text-gray-900">
                            {address.recipient_name}
                          </p>
                          <p className="text-gray-600 break-all">
                            {address.phone}
                          </p>
                          <p className="text-gray-600">
                            {address.address_line}
                          </p>
                          <p className="text-gray-600">
                            {address.city}, {address.province}{" "}
                            {address.postal_code}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <ComingSoonCard
                title="Pengaturan Akun"
                description="Kelola password, notifikasi, dan preferensi akun Anda dengan mudah."
              />
            )}
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsEditingProfile(false)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Edit Profil</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2 font-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    className="w-full px-4 py-2 font-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="number"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 font-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-gray-400"
                >
                  {savingProfile ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Address Modal */}
      {isAddressModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsAddressModalOpen(false)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingAddress ? "Edit Alamat" : "Tambah Alamat Baru"}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label Alamat
                    </label>
                    <input
                      type="text"
                      placeholder="Rumah, Kantor, dll"
                      value={addressForm.label}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          label: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 font-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Penerima
                    </label>
                    <input
                      type="text"
                      value={addressForm.recipient_name}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          recipient_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 font-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="number"
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 font-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Lengkap
                  </label>
                  <textarea
                    rows={3}
                    value={addressForm.address_line}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        address_line: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 font-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                    placeholder="Jalan, nomor rumah, RT/RW, dll"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provinsi
                    </label>
                    <select
                      value={selectedProvinceId}
                      onChange={(e) => {
                        const provId = e.target.value;
                        setSelectedProvinceId(provId);
                        setSelectedRegencyId("");
                        const selectedProv = provinces.find(
                          (p) => p.id === provId,
                        );
                        setAddressForm({
                          ...addressForm,
                          province: selectedProv?.name || "",
                          city: "",
                          postal_code: "",
                        });
                        if (provId) {
                          fetchRegencies(provId);
                        } else {
                          setRegencies([]);
                          setDistricts([]);
                        }
                      }}
                      className="w-full px-4 py-2 font-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      disabled={loadingLocations}
                    >
                      <option value="">Pilih Provinsi</option>
                      {provinces.map((province, index) => (
                        <option
                          key={`province-${province.id || index}`}
                          value={province.id}
                        >
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kota/Kabupaten
                    </label>
                    <select
                      value={selectedRegencyId}
                      onChange={(e) => {
                        const cityId = e.target.value;
                        setSelectedRegencyId(cityId);
                        const selectedCity = regencies.find(
                          (r) => r.id === cityId,
                        );
                        setAddressForm({
                          ...addressForm,
                          city: selectedCity?.name || "",
                          postal_code: "",
                        });
                        if (cityId) {
                          fetchDistricts(cityId);
                        } else {
                          setDistricts([]);
                        }
                      }}
                      className="w-full px-4 py-2 font-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      disabled={!selectedProvinceId || loadingLocations}
                    >
                      <option value="">Pilih Kota/Kabupaten</option>
                      {regencies.map((regency, index) => (
                        <option
                          key={`regency-${regency.id || index}`}
                          value={regency.id}
                        >
                          {regency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kecamatan
                    </label>
                    <select
                      value={addressForm.postal_code}
                      onChange={(e) => {
                        const subdistrictId = e.target.value;
                        setAddressForm({
                          ...addressForm,
                          postal_code: subdistrictId,
                        });
                      }}
                      className="w-full px-4 py-2 font-sans border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      disabled={!selectedRegencyId || loadingLocations}
                    >
                      <option value="">Pilih Kecamatan</option>
                      {districts.map((district, index) => (
                        <option
                          key={`district-${district.id || index}`}
                          value={district.id}
                        >
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={addressForm.is_default}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        is_default: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="is_default"
                    className="text-sm font-medium text-gray-700"
                  >
                    Jadikan alamat utama
                  </label>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveAddress}
                  disabled={savingAddress}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-gray-400"
                >
                  {savingAddress ? "Menyimpan..." : "Simpan Alamat"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
