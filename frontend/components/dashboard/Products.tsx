import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { productsApi, cartApi } from "@/lib/api";
import { Product } from "@/lib/types";
import { useRouter } from "next/navigation";
import Alert from "@/components/shared/Alert";

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error'
  });
  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsApi.getAll({ in_stock: true });
        // Get first 4 products for dashboard
        const productsList = response.data.data?.products || [];
        setProducts(productsList.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setAddingToCart(productId);
      await cartApi.addToCart({
        productId: productId,
        quantity: 1,
      });
      setAlertConfig({ title: 'Berhasil', message: 'Produk berhasil ditambahkan ke keranjang!', type: 'success' });
      setShowAlert(true);
      // Trigger cart update event
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error: unknown) {
      console.error("Failed to add to cart:", error);
      let errorMessage = 'Gagal menambahkan ke keranjang';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        errorMessage = response?.data?.message || 'Gagal menambahkan ke keranjang';
      }
      
      setAlertConfig({ title: 'Gagal', message: errorMessage, type: 'error' });
      setShowAlert(true);
    } finally {
      setAddingToCart(null);
    }
  };
  return (
    <section className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="animate-slide-left">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Produk Pilihan
          </h2>
          <p className="text-gray-600">
            Pilihan terbaik untuk kebutuhan pertanian Anda
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700 transition-all duration-300 group animate-slide-right hover:gap-3"
        >
          Lihat Semua Produk
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
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
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-3 sm:p-4 lg:p-5 space-y-2 lg:space-y-3">
                <div className="h-3 lg:h-4 bg-gray-200 rounded"></div>
                <div className="h-2 lg:h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-5 lg:h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 lg:h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-500 overflow-hidden group hover:-translate-y-2 animate-scale-in"
              style={{animationDelay: `${index * 150}ms`}}
            >
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <Image
                  src={
                    product.image_url ||
                    "https://via.placeholder.com/300?text=No+Image"
                  }
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-3 sm:p-4 lg:p-5">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 mb-1 sm:mb-2 line-clamp-2 min-h-10 sm:min-h-12 lg:min-h-14 group-hover:text-emerald-700 transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 lg:mb-4 line-clamp-2 min-h-8 sm:min-h-10 lg:min-h-10">
                  {product.description}
                </p>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-3 lg:mb-4 gap-1 sm:gap-2">
                  <span className="text-emerald-600 text-base sm:text-lg lg:text-xl font-bold group-hover:scale-105 transition-transform duration-300">
                    Rp {product.price.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all duration-300">
                    Stok: {product.stock}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={addingToCart === product.id || product.stock === 0}
                  className="w-full bg-emerald-600 text-white py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-emerald-700 transition-all duration-300 text-xs sm:text-sm lg:text-base font-medium shadow-sm hover:shadow-lg hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-sm transform active:scale-95"
                >
                  {addingToCart === product.id
                    ? "Menambahkan..."
                    : product.stock === 0
                    ? "Stok Habis"
                    : "Tambah ke Keranjang"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Belum ada produk tersedia</p>
        </div>
      )}

      {/* Alert Component */}
      {showAlert && (
        <Alert
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setShowAlert(false)}
        />
      )}
    </section>
  );
}
