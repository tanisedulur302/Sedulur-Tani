"use client";

import { useState, useEffect } from "react";
import { categoryApi } from "@/lib/api";
import { Category } from "@/lib/types";
import { toast } from "@/lib/toast";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getAll();
      if (
        response.data &&
        response.data.data &&
        response.data.data.categories
      ) {
        setCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Gagal mengambil data kategori");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setSelectedCategory(null);
    setIsEditing(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    resetForm();
    setSelectedCategory(category);
    setName(category.name);
    setSlug(category.slug || ""); // handle potential missing slug in existing data
    setDescription(category.description || "");
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && selectedCategory) {
        // For update, we might need to send FormData if the API wrapper forces it,
        // but let's assume we updated API or the backend handles JSON now.
        // The current `api.ts` uses FormData for categories create/update.
        // So we must use FormData.

        const formData = new FormData();
        formData.append("name", name);
        formData.append("slug", slug);
        formData.append("description", description);

        await categoryApi.update(selectedCategory.id, formData);
        toast.success("Kategori berhasil diperbarui");
      } else {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("slug", slug);
        formData.append("description", description);

        await categoryApi.create(formData);
        toast.success("Kategori berhasil dibuat");
      }

      setIsModalOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error("Gagal menyimpan kategori");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      try {
        await categoryApi.delete(id);
        toast.success("Kategori berhasil dihapus");
        fetchCategories();
      } catch (error) {
        console.error("Failed to delete category:", error);
        toast.error("Gagal menghapus kategori");
      }
    }
  };

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isEditing) {
      setSlug(generateSlug(newName));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Kategori</h1>
        <button
          onClick={openCreateModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
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
          Tambah Kategori
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nama Kategori
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {category.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
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
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Belum ada kategori. Silakan tambah kategori baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 ">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  placeholder="Contoh: Pupuk Urea"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-gray-50"
                  placeholder="contoh-pupuk-urea"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL ramah mesin pencari (contoh: pupuk-urea)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  placeholder="Deskripsi singkat kategori..."
                  rows={3}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  {isEditing ? "Simpan Perubahan" : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
