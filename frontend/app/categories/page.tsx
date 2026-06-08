"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { categoryApi } from "@/lib/api";
import { Category } from "@/lib/types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
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
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kategori Produk
          </h1>
          <p className="text-gray-600">
            Temukan berbagai jenis pupuk sesuai kebutuhan pertanian Anda
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 shadow-sm animate-pulse"
              >
                <div className="w-full h-40 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Link
              href="/products"
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group border border-transparent hover:border-emerald-100 flex flex-col items-center text-center"
            >
              <div className="w-full aspect-square rounded-xl bg-emerald-50 mb-4 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-emerald-600 transition-colors">
                Semua Produk
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2">
                Lihat semua koleksi produk kami
              </p>
            </Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group border border-transparent hover:border-emerald-100 flex flex-col items-center text-center"
              >
                <div className="w-full aspect-square rounded-xl bg-gray-100 mb-4 overflow-hidden relative group-hover:scale-105 transition-transform flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl font-bold uppercase">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-emerald-600 transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
