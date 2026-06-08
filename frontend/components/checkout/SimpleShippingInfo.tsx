"use client";

import { useEffect, useCallback } from "react";

interface SimpleShippingInfoProps {
  weight: number; // in grams
  destinationProvince?: string; // Province from user's address
  onShippingCalculated: (cost: number) => void;
}

// Base shipping cost per kg for each province (simplified)
const PROVINCE_SHIPPING_RATES: Record<string, number> = {
  // Jawa
  "DKI JAKARTA": 10000,
  "JAWA BARAT": 15000,
  "JAWA TENGAH": 20000,
  "DI YOGYAKARTA": 20000,
  "JAWA TIMUR": 25000,
  BANTEN: 15000,

  // Sumatera
  ACEH: 55000,
  "SUMATERA UTARA": 40000,
  "SUMATERA BARAT": 35000,
  RIAU: 35000,
  JAMBI: 35000,
  "SUMATERA SELATAN": 30000,
  BENGKULU: 40000,
  LAMPUNG: 30000,
  "KEPULAUAN BANGKA BELITUNG": 40000,
  "KEPULAUAN RIAU": 40000,

  // Kalimantan
  "KALIMANTAN BARAT": 45000,
  "KALIMANTAN TENGAH": 45000,
  "KALIMANTAN SELATAN": 45000,
  "KALIMANTAN TIMUR": 50000,
  "KALIMANTAN UTARA": 55000,

  // Sulawesi
  "SULAWESI UTARA": 55000,
  "SULAWESI TENGAH": 50000,
  "SULAWESI SELATAN": 45000,
  "SULAWESI TENGGARA": 55000,
  GORONTALO: 50000,
  "SULAWESI BARAT": 50000,

  // Bali & Nusa Tenggara
  BALI: 35000,
  "NUSA TENGGARA BARAT": 40000,
  "NUSA TENGGARA TIMUR": 50000,

  // Maluku & Papua
  MALUKU: 80000,
  "MALUKU UTARA": 85000,
  "PAPUA BARAT": 100000,
  PAPUA: 100000,
};

export default function SimpleShippingInfo({
  weight,
  destinationProvince,
  onShippingCalculated,
}: SimpleShippingInfoProps) {
  // Calculate shipping cost function
  const calculateShipping = useCallback(() => {
    if (!destinationProvince) return;

    // Normalize province name
    const province = destinationProvince.toUpperCase().trim();

    // Get base cost per kg for province
    const baseCostPerKg = PROVINCE_SHIPPING_RATES[province] || 50000; // Default if not found

    // Calculate weight in kg (rounded up)
    const weightInKg = Math.ceil(weight / 1000);
    const finalWeight = weightInKg < 1 ? 1 : weightInKg;

    // Calculate total shipping cost
    const shippingCost = baseCostPerKg * finalWeight;

    // Send calculated cost back to parent
    onShippingCalculated(shippingCost);
  }, [destinationProvince, weight, onShippingCalculated]);

  // Calculate shipping cost when dependencies change
  useEffect(() => {
    if (destinationProvince && weight > 0) {
      calculateShipping();
    }
  }, [destinationProvince, weight, calculateShipping]);

  const getWeightDisplay = () => {
    return (weight / 1000).toFixed(2);
  };

  const getShippingCost = () => {
    if (!destinationProvince) return 0;

    const province = destinationProvince.toUpperCase().trim();
    const baseCostPerKg = PROVINCE_SHIPPING_RATES[province] || 50000;
    const weightInKg = Math.ceil(weight / 1000);
    const finalWeight = weightInKg < 1 ? 1 : weightInKg;

    return baseCostPerKg * finalWeight;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Informasi Pengiriman
        </h3>
      </div>

      {/* Origin Info */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm">
          <svg
            className="w-4 h-4 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-gray-700">
            <span className="font-medium">Dikirim dari:</span> Surabaya, Jawa
            Timur
          </span>
        </div>
      </div>

      {/* Destination Info */}
      {destinationProvince && (
        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tujuan Pengiriman</p>
              <p className="font-medium text-gray-900">{destinationProvince}</p>
            </div>
            <svg
              className="w-5 h-5 text-emerald-600"
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
        </div>
      )}

      {/* Shipping Cost Info */}
      {destinationProvince && (
        <div className="bg-white border-2 border-emerald-600 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Pengiriman Standar
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  Estimasi 3-7 hari kerja
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  *Kurir akan ditentukan oleh penjual
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Biaya</p>
              <p className="font-bold text-emerald-600 text-lg">
                Rp {getShippingCost().toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Weight Info */}
      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
        <p>
          📦 Total berat:{" "}
          <span className="font-semibold">{getWeightDisplay()} kg</span>
        </p>
      </div>
    </div>
  );
}
