"use client";

import { useEffect, useState } from "react";
import { userApi } from "@/lib/api";
import { User } from "@/lib/types";
import Toast from "@/components/shared/Toast";
import { exportToCSV, exportToPDF } from "@/lib/utils/export";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await userApi.getAll({
          role: filterRole !== "all" ? filterRole : undefined,
          search: searchQuery || undefined,
          page: pagination.page,
          limit: pagination.limit,
        });
        setUsers(response.data.data.users || []);
        if (response.data.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            ...response.data.data.pagination,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setToast({ message: "Gagal memuat data pengguna", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [filterRole, pagination.page, pagination.limit, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);  
      const response = await userApi.getAll({
        role: filterRole !== "all" ? filterRole : undefined,
        search: searchQuery || undefined,
        page: pagination.page,
        limit: pagination.limit,
      });
      setUsers(response.data.data.users || []);
      if (response.data.data.pagination) {
        setPagination((prev) => ({
          ...prev,
          ...response.data.data.pagination,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setToast({ message: "Gagal memuat data pengguna", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    setIsSubmitting(true);
    try {
      await userApi.updateRole(selectedUser.id, newRole);
      setToast({ message: "Role pengguna berhasil diubah", type: "success" });
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole("");
      fetchUsers();
    } catch (error) {
      console.error("Failed to update role:", error);
      setToast({ message: "Gagal mengubah role pengguna", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await userApi.delete(selectedUser.id);
      setToast({ message: "Pengguna berhasil dihapus", type: "success" });
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      setToast({ message: "Gagal menghapus pengguna", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openDetailModal = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleExportUsers = (format: "csv" | "pdf") => {
    if (users.length === 0) {
      setToast({ message: "Tidak ada data untuk diekspor", type: "error" });
      return;
    }

    try {
      const exportData = users.map((user, index) => ({
        no: index + 1,
        nama: user.name,
        email: user.email,
        telepon: user.phone || "-",
        role: getRoleLabel(user.role),
        bergabung: formatDate(user.created_at),
      }));

      if (format === "csv") {
        exportToCSV(exportData, `pengguna-${filterRole}-${new Date().toISOString().split("T")[0]}`, [
          { key: "no", label: "No" },
          { key: "nama", label: "Nama" },
          { key: "email", label: "Email" },
          { key: "telepon", label: "Telepon" },
          { key: "role", label: "Role" },
          { key: "bergabung", label: "Bergabung" },
        ]);
      } else {
        exportToPDF(
          `Data Pengguna - ${filterRole === "all" ? "Semua" : getRoleLabel(filterRole)}`,
          exportData,
          [
            { key: "nama", label: "Nama" },
            { key: "email", label: "Email" },
            { key: "telepon", label: "Telepon" },
            { key: "role", label: "Role" },
            { key: "bergabung", label: "Bergabung" },
          ],
          [
            { label: "Total Pengguna", value: users.length.toString() },
            { label: "Pembeli", value: users.filter(u => u.role === "buyer").length.toString() },
            { label: "Penjual", value: users.filter(u => u.role === "seller").length.toString() },
          ]
        );
      }

      setToast({ message: `Data pengguna berhasil diekspor ke ${format.toUpperCase()}`, type: "success" });
    } catch (error) {
      console.error("Export error:", error);
      setToast({ message: "Gagal mengekspor data", type: "error" });
    }
  };

  const getRoleBadgeClass = (role: string) => {
    const classes: Record<string, string> = {
      seller: "bg-purple-50 text-purple-700 border-purple-200",
      buyer: "bg-blue-50 text-blue-700 border-blue-200",
      admin: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return classes[role] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      seller: "Penjual",
      buyer: "Pembeli",
      admin: "Admin",
    };
    return labels[role] || role;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Pengguna
            </h1>
            <p className="text-gray-500 mt-1">
              Kelola akun dan hak akses pengguna platform
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-64"
              />
            </form>
            {/* Filter */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="pl-9 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white cursor-pointer"
              >
                <option value="all">Semua Role</option>
                <option value="buyer">Pembeli</option>
                <option value="seller">Penjual</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {/* Export Buttons */}
            <button
              onClick={() => handleExportUsers("csv")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV
            </button>
            <button
              onClick={() => handleExportUsers("pdf")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Pengguna",
            count: pagination.total,
            bgColor: "bg-slate-50",
            textColor: "text-slate-600",
            icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
          },
          {
            label: "Pembeli",
            count: users.filter((u) => u.role === "buyer").length,
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
            icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
          },
          {
            label: "Penjual",
            count: users.filter((u) => u.role === "seller").length,
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
            icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
          },
          {
            label: "Baru Bulan Ini",
            count: users.filter((u) => {
              const created = new Date(u.created_at);
              const now = new Date();
              return (
                created.getMonth() === now.getMonth() &&
                created.getFullYear() === now.getFullYear()
              );
            }).length,
            bgColor: "bg-emerald-50",
            textColor: "text-emerald-600",
            icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stat.count}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <svg
                  className={`w-6 h-6 ${stat.textColor}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={stat.icon}
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Memuat data pengguna...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Telepon
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Bergabung
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center text-gray-500">
                        <svg
                          className="w-16 h-16 text-gray-300 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        <p className="text-lg font-medium">
                          Tidak ada pengguna
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Belum ada pengguna yang terdaftar
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => openDetailModal(user)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {user.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {user.phone || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${getRoleBadgeClass(user.role)}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {formatDate(user.created_at)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="flex items-center justify-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => openRoleModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ubah Role"
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
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              dari {pagination.total} pengguna
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={pagination.page === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg">
                {pagination.page}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(prev.totalPages, prev.page + 1),
                  }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detail Pengguna
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
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
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl mb-3">
                  {selectedUser.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <h4 className="text-xl font-semibold text-gray-900">
                  {selectedUser.name}
                </h4>
                <span
                  className={`mt-2 inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getRoleBadgeClass(selectedUser.role)}`}
                >
                  {getRoleLabel(selectedUser.role)}
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Telepon</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.phone || "Belum diisi"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg
                    className="w-5 h-5 text-gray-400"
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
                  <div>
                    <p className="text-xs text-gray-500">Bergabung</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(selectedUser.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  openRoleModal(selectedUser);
                }}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Ubah Role
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Ubah Role</h3>
              <p className="text-sm text-gray-500 mt-1">
                Ubah role untuk {selectedUser.name}
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    newRole === "buyer"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={newRole === "buyer"}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      newRole === "buyer" ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 ${newRole === "buyer" ? "text-white" : "text-gray-500"}`}
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
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Pembeli</p>
                    <p className="text-xs text-gray-500">
                      Dapat membeli produk
                    </p>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    newRole === "seller"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={newRole === "seller"}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      newRole === "seller" ? "bg-purple-500" : "bg-gray-200"
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 ${newRole === "seller" ? "text-white" : "text-gray-500"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Penjual</p>
                    <p className="text-xs text-gray-500">
                      Dapat menjual dan mengelola produk
                    </p>
                  </div>
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleUpdateRole}
                disabled={isSubmitting || newRole === selectedUser.role}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setNewRole("");
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Hapus Pengguna?
                </h3>
                <p className="text-sm text-gray-500">
                  Anda akan menghapus akun{" "}
                  <span className="font-medium text-gray-700">
                    {selectedUser.name}
                  </span>
                  . Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
