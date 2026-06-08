"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface BannerSlide {
  image: string;
  title: string;
  description: string;
}

const bannerSlides: BannerSlide[] = [
  {
    image: "/image/banner1.jpg",
    title: "Pupuk Berkualitas untuk Hasil Panen Maksimal",
    description:
      "Dapatkan berbagai jenis pupuk organik dan kimia terbaik untuk meningkatkan produktivitas pertanian Anda",
  },
  {
    image: "/image/banner2.jpg",
    title: "Gratis Ongkir untuk Pembelian Pertama",
    description:
      "Nikmati promo spesial gratis ongkir ke seluruh Indonesia untuk pembelian pupuk pertama Anda",
  },
  {
    image: "/image/banner3.jpg",
    title: "Konsultasi Gratis dengan Ahli Pertanian",
    description:
      "Dapatkan rekomendasi pupuk terbaik sesuai kebutuhan lahan Anda dari para ahli berpengalaman",
  },
];

// Fallback linears if images not available
const fallbacklinears = [
  "linear-linear(135deg, #308A50 0%, #276D3F 100%)",
  "linear-linear(135deg, #3FA865 0%, #308A50 100%)",
  "linear-linear(135deg, #276D3F 0%, #1F5A32 100%)",
];

export default function BannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<boolean[]>(
    new Array(bannerSlides.length).fill(false),
  );

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleImageError = (index: number) => {
    setImageErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length,
    );
  };

  return (
    <div className="relative w-full h-[600px] md:h-[1000px] overflow-hidden bg-gray-900">
      {/* Slides */}
      {bannerSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 z-0 ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {!imageErrors[index] ? (
            <>
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                onError={() => handleImageError(index)}
                priority={index === 0}
                sizes="100vw"
              />
              {/* Dark Overlay for readability */}
              <div className="absolute inset-0 bg-black/40"></div>
            </>
          ) : (
            <>
              {/* Fallback linear Background */}
              <div
                className="absolute inset-0"
                style={{
                  background: fallbacklinears[index % fallbacklinears.length],
                }}
              ></div>
              {/* Dark Overlay for readability */}
              <div className="absolute inset-0 bg-black/30"></div>
            </>
          )}

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4 md:px-8 lg:px-20">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl text-white mb-8 drop-shadow-md">
                  {slide.description}
                </p>
                <Link
                  href="/products"
                  className="inline-block bg-[#308A50] hover:bg-[#276D3F] text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                  suppressHydrationWarning
                >
                  Belanja Sekarang
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 z-20 hidden md:block hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110"
        aria-label="Previous slide"
        suppressHydrationWarning
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 z-20 hidden md:block hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110"
        aria-label="Next slide"
        suppressHydrationWarning
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
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all rounded-full ${
              index === currentSlide
                ? "bg-white w-8 h-3"
                : "bg-white/50 w-3 h-3 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            suppressHydrationWarning
          />
        ))}
      </div>
    </div>
  );
}
