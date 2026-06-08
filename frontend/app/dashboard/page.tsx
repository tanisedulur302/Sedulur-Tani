"use client";

import dynamic from "next/dynamic";
import BannerSlider from "@/components/dashboard/BannerSlider";
import Products from "@/components/dashboard/Products";
import Testimonials from "@/components/dashboard/Testimonials";
import Features from "@/components/dashboard/Features";

// Dynamic import WeatherWidget to avoid hydration issues
const WeatherWidget = dynamic(
  () => import("@/components/dashboard/WeatherWidget"),
  { ssr: false }
);

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-50 animate-fade-in">
      {/* Hero Banner */}
      <div className="animate-slide-down">
        <BannerSlider />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Section */}
        <div className="animate-slide-up-delay-1">
          <Features />
        </div>

        {/* Weather Widget Section */}
        <section className="animate-slide-up-delay-2">
          <WeatherWidget />
        </section>

        {/* Products Section */}
        <div className="animate-slide-up-delay-3">
          <Products />
        </div>

        {/* Testimonials Section */}
        <div className="animate-slide-up-delay-4">
          <Testimonials />
        </div>
      </div>
    </div>
  );
}
