"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { productsApi, cartApi } from "@/lib/api";
import { Product } from "@/lib/types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Toast from "@/components/shared/Toast";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    fetchProductDetail();
    fetchRelatedProducts();
  }, [productId]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getById(productId);
      setProduct(response.data.data.product);
    } catch (error) {
      console.error("Failed to fetch product:", error);
      setToast({ message: "Gagal memuat detail produk", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await productsApi.getAll({ in_stock: true });
      const allProducts = response.data.data?.products || [];
      const filtered = allProducts
        .filter((p: Product) => p.id !== productId)
        .slice(0, 4);
      setRelatedProducts(filtered);
    } catch (error) {
      console.error("Failed to fetch related products:", error);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!product) return;

    if (quantity > (product.stock || 0)) {
      setToast({
        message: `Stok tidak mencukupi. Stok tersedia: ${product.stock || 0}`,
        type: "error",
      });
      return;
    }

    try {
      setAddingToCart(true);
      await cartApi.addToCart({
        productId: product.id,
        quantity: quantity,
      });
      setToast({
        message: "Produk berhasil ditambahkan ke keranjang!",
        type: "success",
      });
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
      setToast({
        message:
          error.response?.data?.message || "Gagal menambahkan ke keranjang",
        type: "error",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    setTimeout(() => {
      router.push("/cart");
    }, 500);
  };

  const increaseQuantity = () => {
    if (product && quantity < (product.stock || 0)) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-2xl"></div>
              <div className="space-y-6">
                <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="flex gap-4">
                  <div className="h-12 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-12 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Produk tidak ditemukan
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Maaf, produk yang Anda cari mungkin sudah dihapus atau tidak
              tersedia saat ini.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 transition-all font-medium shadow-lg shadow-emerald-600/20"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali ke Produk
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            Beranda
          </Link>
          <svg
            className="w-4 h-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <Link
            href="/products"
            className="hover:text-emerald-600 transition-colors"
          >
            Produk
          </Link>
          <svg
            className="w-4 h-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-gray-900 font-medium truncate">
            {product.name}
          </span>
        </nav>

        {/* Product Detail Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 p-6 md:p-8 lg:p-10">
            {/* Product Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                <Image
                  src={
                    product.image_url ||
                    "https://via.placeholder.com/500?text=No+Image"
                  }
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  priority
                />
                {(product.stock || 0) === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg transform -rotate-12">
                      STOK HABIS
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info & Actions */}
            <div className="flex flex-col">
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl font-bold text-emerald-600">
                    Rp {(product.price || 0).toLocaleString("id-ID")}
                  </div>
                  {(product.stock || 0) > 0 ? (
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-100">
                      Tersedia: {product.stock}
                    </span>
                  ) : (
                    <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-semibold border border-red-100">
                      Habis
                    </span>
                  )}
                </div>
              </div>

              {/* Seller Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-8 hover:border-emerald-200 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 border border-gray-100 group-hover:border-emerald-200">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">
                    Penjual
                  </p>
                  <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {product.seller?.name || "Sedulur Tani Seller"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-emerald max-w-none mb-8 text-gray-600">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Deskripsi Produk
                </h3>
                <p className="whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-auto border-t border-gray-100 pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-300 rounded-xl w-fit bg-white">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1 || (product.stock || 0) === 0}
                      className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors rounded-l-xl disabled:opacity-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val >= 1 && val <= (product.stock || 0)) {
                          setQuantity(val);
                        }
                      }}
                      className="w-16 text-center border-x border-gray-300 py-3 outline-none font-semibold text-gray-900"
                      min="1"
                      max={product.stock || 0}
                      disabled={(product.stock || 0) === 0}
                    />
                    <button
                      onClick={increaseQuantity}
                      disabled={
                        quantity >= (product.stock || 0) ||
                        (product.stock || 0) === 0
                      }
                      className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors rounded-r-xl disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  {/* Buttons */}
                  <div className="flex-1 flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || (product.stock || 0) === 0}
                      className="flex-1 bg-white border-2 border-emerald-600 text-emerald-600 py-3 px-6 rounded-xl hover:bg-emerald-50 transition-all font-bold shadow-sm disabled:border-gray-300 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {addingToCart ? (
                        <svg
                          className="animate-spin h-5 w-5"
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
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          + Keranjang
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={addingToCart || (product.stock || 0) === 0}
                      className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-xl hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                      Beli Sekarang
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Produk Terkait
              </h2>
              <Link
                href="/products"
                className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 group"
              >
                Lihat Semua
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 overflow-hidden group flex flex-col h-full"
                >
                  <div className="relative aspect-4/5 bg-gray-100 overflow-hidden">
                    <Image
                      src={
                        relatedProduct.image_url ||
                        "https://via.placeholder.com/300?text=No+Image"
                      }
                      alt={relatedProduct.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {(relatedProduct.stock || 0) === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-sm tracking-wider border border-white px-2 py-1">
                          HABIS
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col grow">
                    <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                      {relatedProduct.seller?.name || "Penjual"}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-lg font-bold text-emerald-600">
                        Rp {(relatedProduct.price || 0).toLocaleString("id-ID")}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

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
