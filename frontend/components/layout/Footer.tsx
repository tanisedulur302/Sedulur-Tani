import Link from "next/link";
import Image from "next/image";
import logo from "@/public/image/logo.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-14 h-14 shrink-0 transition-transform group-hover:scale-105">
                <Image
                  src={logo}
                  alt="Sedulur Tani Logo"
                  width={56}
                  height={56}
                  className="w-full h-full"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#308A50] group-hover:text-[#276D3F] transition-colors">
                  Sedulur Tani
                </h3>
                <p className="text-xs text-gray-500">Pupuk Berkualitas</p>
              </div>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed">
              Platform e-commerce terpercaya untuk kebutuhan pupuk dan
              perlengkapan pertanian berkualitas tinggi.
            </p>

            {/* Social Media */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Ikuti Kami
              </p>
              <div className="flex gap-2">
                <a
                  href="#"
                  className="bg-emerald-50 hover:bg-[#308A50] p-2.5 rounded-lg transition-all duration-300 hover:scale-110 group"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-5 h-5 text-[#308A50] group-hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-emerald-50 hover:bg-[#308A50] p-2.5 rounded-lg transition-all duration-300 hover:scale-110 group"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-5 h-5 text-[#308A50] group-hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-emerald-50 hover:bg-[#308A50] p-2.5 rounded-lg transition-all duration-300 hover:scale-110 group"
                  aria-label="Twitter"
                >
                  <svg
                    className="w-5 h-5 text-[#308A50] group-hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-emerald-50 hover:bg-[#308A50] p-2.5 rounded-lg transition-all duration-300 hover:scale-110 group"
                  aria-label="WhatsApp"
                >
                  <svg
                    className="w-5 h-5 text-[#308A50] group-hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-gray-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-[#308A50] rounded-full"></div>
              Navigasi
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-[#308A50] transition-colors inline-flex items-center gap-2 group"
                >
                  <svg
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all"
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
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-sm text-gray-600 hover:text-[#308A50] transition-colors inline-flex items-center gap-2 group"
                >
                  <svg
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all"
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
                  Produk
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-gray-600 hover:text-[#308A50] transition-colors inline-flex items-center gap-2 group"
                >
                  <svg
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all"
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
                  Kategori
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-gray-600 hover:text-[#308A50] transition-colors inline-flex items-center gap-2 group"
                >
                  <svg
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all"
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
                  Keranjang
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-sm text-gray-600 hover:text-[#308A50] transition-colors inline-flex items-center gap-2 group"
                >
                  <svg
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all"
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
                  Pesanan
                </Link>
              </li>
            </ul>
          </div>

          {/* Kategori Pupuk */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-gray-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-[#308A50] rounded-full"></div>
              Kategori Pupuk
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/products?category=Pupuk%20Organik"
                  className="text-sm text-gray-600 hover:text-[#308A50] transition-colors inline-flex items-center gap-2 group"
                >
                  <svg
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all"
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
                  Pupuk Organik
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=Pupuk%20Urea"
                  className="text-sm text-gray-600 hover:text-[#308A50] transition-colors inline-flex items-center gap-2 group"
                >
                  <svg
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all"
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
                  Pupuk Urea
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=Pupuk%20NPK"
                  className="text-sm text-gray-600 hover:text-[#308A50] transition-colors inline-flex items-center gap-2 group"
                >
                  <svg
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all"
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
                  Pupuk NPK
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=Pupuk%20ZA"
                  className="text-sm text-gray-600 hover:text-[#308A50] transition-colors inline-flex items-center gap-2 group"
                >
                  <svg
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all"
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
                  Pupuk ZA
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-sm text-emerald-600 hover:text-[#308A50] font-medium transition-colors inline-flex items-center gap-2 group"
                >
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  Lihat Semua
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-gray-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-[#308A50] rounded-full"></div>
              Hubungi Kami
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="bg-emerald-50 p-2 rounded-lg shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <svg
                    className="w-5 h-5 text-[#308A50]"
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
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">
                    Alamat
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Jl. Pertanian No. 123
                    <br />
                    Jakarta, Indonesia
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="bg-emerald-50 p-2 rounded-lg shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <svg
                    className="w-5 h-5 text-[#308A50]"
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
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">
                    Email
                  </p>
                  <a
                    href="mailto:info@sedulurtani.com"
                    className="text-sm text-gray-700 hover:text-[#308A50] transition-colors break-all"
                  >
                    info@sedulurtani.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="bg-emerald-50 p-2 rounded-lg shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <svg
                    className="w-5 h-5 text-[#308A50]"
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
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">
                    Telepon
                  </p>
                  <a
                    href="tel:+6281234567890"
                    className="text-sm text-gray-700 hover:text-[#308A50] transition-colors"
                  >
                    +62 812-3456-7890
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-600 text-center sm:text-left">
              © {currentYear}{" "}
              <span className="text-[#308A50] font-bold">Sedulur Tani</span>.
              All rights reserved.
            </p>
            <div className="flex gap-6 flex-wrap justify-center">
              <Link
                href="#"
                className="text-gray-600 hover:text-[#308A50] transition-colors font-medium"
              >
                Syarat & Ketentuan
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-[#308A50] transition-colors font-medium"
              >
                Kebijakan Privasi
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-[#308A50] transition-colors font-medium"
              >
                Bantuan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
