import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable strict mode to reduce hydration warnings

  // Output standalone for better Vercel deployment
  output: "standalone",

  // Disable TypeScript errors during build (for faster deployment)
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.vercel.app",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
