import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sedulur Tani - Marketplace Pupuk",
  description: "Platform jual beli pupuk pertanian",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50`}
        suppressHydrationWarning
      >
        <Toaster richColors closeButton />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
