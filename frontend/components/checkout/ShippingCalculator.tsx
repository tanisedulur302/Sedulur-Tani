"use client";

import { useState, useEffect, useCallback } from "react";
import { shippingApi, ShippingCost } from "@/lib/api/addresses";

interface ShippingCalculatorProps {
  weight: number; // in grams
  originCityId?: string; // Default origin (seller's city)
  destinationCity?: string; // User's selected address city
  onShippingSelected: (
    cost: number,
    courier: string,
    service: string,
    etd: string,
  ) => void;
}

interface DestinationData {
  id?: string;
  code?: string;
  name?: string;
  city_name?: string;
}

export default function ShippingCalculator({
  weight,
  originCityId = "Surabaya", // Default origin: Surabaya (toko)
  destinationCity,
  onShippingSelected,
}: ShippingCalculatorProps) {
  const [destinations, setDestinations] = useState<DestinationData[]>([]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedCourier, setSelectedCourier] = useState("jne");
  const [shippingCosts, setShippingCosts] = useState<ShippingCost[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");
  const [fromCache, setFromCache] = useState(false);

  const loadDestinations = useCallback(async () => {
    try {
      const data = await shippingApi.getDestinations();

      // Transform data based on Komerce API response structure
      if (data && Array.isArray(data)) {
        setDestinations(data);
      } else if (data && "destinations" in data) {
        setDestinations(data.destinations as DestinationData[]);
      }
    } catch (err) {
      console.error("Failed to load destinations:", err);
      setError("Gagal memuat daftar tujuan");
    }
  }, []);

  const calculateShipping = useCallback(async () => {
    if (!selectedDestination || !selectedCourier || weight <= 0) return;

    try {
      setCalculating(true);
      setError("");
      setShippingCosts([]);
      setSelectedService("");

      const result = await shippingApi.calculateCost({
        origin: originCityId,
        destination: selectedDestination,
        weight: weight,
        courier: selectedCourier,
      });

      setShippingCosts(result.costs);
      setFromCache(result.fromCache);

      // Auto-select REG (regular) service if available, otherwise first service
      if (result.costs.length > 0) {
        const regService = result.costs.find((s) =>
          s.service.toLowerCase().includes("reg"),
        );
        const defaultService = regService || result.costs[0];
        setSelectedService(defaultService.service);
        onShippingSelected(
          defaultService.cost,
          selectedCourier.toUpperCase(),
          defaultService.service,
          defaultService.etd,
        );
      }
    } catch (err) {
      console.error("Failed to calculate shipping:", err);
      const errorMessage =
        err instanceof Error && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Gagal menghitung ongkir";
      setError(errorMessage || "Gagal menghitung ongkir");
      setShippingCosts([]);
    } finally {
      setCalculating(false);
    }
  }, [
    selectedDestination,
    selectedCourier,
    weight,
    originCityId,
    onShippingSelected,
  ]);

  // Load destinations on mount
  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  // Set destination from user's address
  useEffect(() => {
    if (destinationCity && destinations.length > 0) {
      // Find matching destination by city name
      const matchingDest = destinations.find((dest) => {
        const destName = (dest.name || dest.city_name)?.toLowerCase();
        if (!destName) return false;
        return (
          destName.includes(destinationCity.toLowerCase()) ||
          destinationCity.toLowerCase().includes(destName)
        );
      });

      if (matchingDest) {
        setSelectedDestination(
          matchingDest.id || matchingDest.code || matchingDest.name || "",
        );
      }
    }
  }, [destinationCity, destinations]);

  // Auto-calculate when destination and courier are selected
  useEffect(() => {
    if (selectedDestination && selectedCourier && weight > 0) {
      calculateShipping();
    }
  }, [selectedDestination, selectedCourier, weight, calculateShipping]);

  // Auto-calculate shipping when destination city is set (from user's address)
  useEffect(() => {
    if (selectedDestination && weight > 0 && destinationCity) {
      // Auto-select JNE as default courier
      setSelectedCourier("jne");
    }
  }, [selectedDestination, weight, destinationCity]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Informasi Pengiriman
        </h3>
        {fromCache && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            📦 Dari cache
          </span>
        )}
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
            <span className="font-medium">Dikirim dari:</span> {originCityId}
          </span>
        </div>
      </div>

      {/* Destination Info - Read Only */}
      {destinationCity && (
        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tujuan Pengiriman</p>
              <p className="font-medium text-gray-900">{destinationCity}</p>
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

      {/* Loading State */}
      {calculating && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <svg
              className="animate-spin h-5 w-5 text-emerald-600"
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
            <span className="text-gray-600">Menghitung ongkir...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Auto-calculated Shipping Info */}
      {shippingCosts.length > 0 && selectedService && (
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
                  {selectedCourier.toUpperCase()} - {selectedService}
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {
                    shippingCosts.find((s) => s.service === selectedService)
                      ?.description
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Estimasi:{" "}
                  {
                    shippingCosts.find((s) => s.service === selectedService)
                      ?.etd
                  }{" "}
                  hari
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Biaya</p>
              <p className="font-bold text-emerald-600 text-lg">
                Rp{" "}
                {shippingCosts
                  .find((s) => s.service === selectedService)
                  ?.cost.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Weight Info */}
      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
        <p>
          📦 Total berat:{" "}
          <span className="font-semibold">{(weight / 1000).toFixed(2)} kg</span>
        </p>
      </div>
    </div>
  );
}
