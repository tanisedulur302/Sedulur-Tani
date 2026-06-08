"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWeatherApi } from "openmeteo";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  locationName: string;
}

interface CachedWeatherData {
  data: WeatherData;
  date: string; // Format: YYYY-MM-DD
  timestamp: number;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Helper function to check if cached data is still valid
  const isCacheValid = useCallback((cachedData: CachedWeatherData): boolean => {
    const today = getTodayDate();
    return cachedData.date === today;
  }, []);

  // Helper function to get cached weather data
  const getCachedWeather = useCallback((): WeatherData | null => {
    try {
      const cached = localStorage.getItem("weatherData");
      if (!cached) return null;

      const cachedData: CachedWeatherData = JSON.parse(cached);

      // Check if cache is still valid (same day)
      if (isCacheValid(cachedData)) {
        console.log("Using cached weather data");
        return cachedData.data;
      } else {
        console.log("Cache expired, clearing old data");
        localStorage.removeItem("weatherData");
        return null;
      }
    } catch (err) {
      console.error("Error reading cached weather:", err);
      localStorage.removeItem("weatherData");
      return null;
    }
  }, [isCacheValid]);

  // Helper function to save weather data to cache
  const saveWeatherToCache = useCallback((data: WeatherData) => {
    try {
      const cacheData: CachedWeatherData = {
        data,
        date: getTodayDate(),
        timestamp: Date.now(),
      };
      localStorage.setItem("weatherData", JSON.stringify(cacheData));
      console.log("Weather data cached successfully");
    } catch (err) {
      console.error("Error saving weather to cache:", err);
    }
  }, []);

  const getWeatherData = async () => {
    setLoading(true);
    setError(null);
    setLocationDenied(false);

    // Clear cache before refetching
    localStorage.removeItem("weatherData");

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung oleh browser Anda");
      setLoading(false);
      return;
    }

    // Request user location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Fetch weather data from Open-Meteo API
          const params = {
            latitude: latitude,
            longitude: longitude,
            current: [
              "temperature_2m",
              "relative_humidity_2m",
              "precipitation",
              "weather_code",
              "wind_speed_10m",
            ],
            timezone: "Asia/Jakarta",
          };

          const url = "https://api.open-meteo.com/v1/forecast";
          const responses = await fetchWeatherApi(url, params);
          const response = responses[0];

          // Get current weather data
          const current = response.current()!;

          // Get location name using reverse geocoding
          let locationName = "Lokasi Anda";
          try {
            const geoResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            const geoData = await geoResponse.json();
            locationName =
              geoData.address?.city ||
              geoData.address?.county ||
              geoData.address?.state ||
              "Lokasi Anda";
          } catch (err) {
            console.error("Error fetching location name:", err);
          }

          const weatherData: WeatherData = {
            temperature: Math.round(current.variables(0)!.value()),
            humidity: Math.round(current.variables(1)!.value()),
            precipitation: Math.round(current.variables(2)!.value()),
            weatherCode: current.variables(3)!.value(),
            windSpeed: Math.round(current.variables(4)!.value()),
            locationName,
          };

          // Save to cache
          saveWeatherToCache(weatherData);
          setWeather(weatherData);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching weather:", err);
          setError("Gagal mengambil data cuaca");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLocationDenied(true);
        setError(
          "Akses lokasi ditolak. Silakan izinkan akses lokasi untuk melihat cuaca."
        );
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    const fetchInitialWeatherData = async () => {
      setLoading(true);
      setError(null);
      setLocationDenied(false);

      // First, try to get cached data
      const cachedWeather = getCachedWeather();
      if (cachedWeather) {
        setWeather(cachedWeather);
        setLoading(false);
        return;
      }

      // If no cache, check if geolocation is supported
      if (!navigator.geolocation) {
        setError("Geolocation tidak didukung oleh browser Anda");
        setLoading(false);
        return;
      }

      // Request user location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Fetch weather data from Open-Meteo API
            const params = {
              latitude: latitude,
              longitude: longitude,
              current: [
                "temperature_2m",
                "relative_humidity_2m",
                "precipitation",
                "weather_code",
                "wind_speed_10m",
              ],
              timezone: "Asia/Jakarta",
            };

            const url = "https://api.open-meteo.com/v1/forecast";
            const responses = await fetchWeatherApi(url, params);
            const response = responses[0];

            // Get current weather data
            const current = response.current()!;

            // Get location name using reverse geocoding
            let locationName = "Lokasi Anda";
            try {
              const geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
              );
              const geoData = await geoResponse.json();
              locationName =
                geoData.address?.city ||
                geoData.address?.county ||
                geoData.address?.state ||
                "Lokasi Anda";
            } catch (err) {
              console.error("Error fetching location name:", err);
            }

            const weatherData: WeatherData = {
              temperature: Math.round(current.variables(0)!.value()),
              humidity: Math.round(current.variables(1)!.value()),
              precipitation: Math.round(current.variables(2)!.value()),
              weatherCode: current.variables(3)!.value(),
              windSpeed: Math.round(current.variables(4)!.value()),
              locationName,
            };

            // Save to cache
            saveWeatherToCache(weatherData);
            setWeather(weatherData);
            setLoading(false);
          } catch (err) {
            console.error("Error fetching weather:", err);
            setError("Gagal mengambil data cuaca");
            setLoading(false);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLocationDenied(true);
          setError(
            "Akses lokasi ditolak. Silakan izinkan akses lokasi untuk melihat cuaca."
          );
          setLoading(false);
        }
      );
    };

    fetchInitialWeatherData();
  }, [getCachedWeather, saveWeatherToCache]);

  // Update current time on client side only
  useEffect(() => {
    setCurrentTime(
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [weather]);

  const getWeatherIcon = (code: number): string => {
    // WMO Weather interpretation codes
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 48) return "🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "🌨️";
    if (code <= 82) return "🌦️";
    if (code <= 86) return "🌨️";
    if (code <= 99) return "⛈️";
    return "☁️";
  };

  const getWeatherDescription = (code: number): string => {
    if (code === 0) return "Cerah";
    if (code <= 3) return "Berawan Cerah";
    if (code <= 48) return "Berkabut";
    if (code <= 67) return "Hujan";
    if (code <= 77) return "Salju";
    if (code <= 82) return "Hujan Ringan";
    if (code <= 86) return "Hujan Salju";
    if (code <= 99) return "Badai Petir";
    return "Berawan";
  };

  const getFertilizationRecommendation = () => {
    if (!weather) return null;

    const isGoodCondition =
      weather.precipitation < 30 && weather.windSpeed < 20;

    return {
      isGood: isGoodCondition,
      type: isGoodCondition ? "Pemupukan Butiran" : "Tunda Pemupukan",
      subtitle: isGoodCondition ? "(NPK / Urea)" : "(Tunggu Cuaca Membaik)",
      tips: [
        {
          icon: isGoodCondition ? "check" : "warning",
          text: isGoodCondition
            ? "Cuaca stabil, minim angin kencang"
            : "Angin kencang atau hujan, tunda pemupukan",
        },
        {
          icon: weather.precipitation > 30 ? "warning" : "check",
          text:
            weather.precipitation > 30
              ? "Peluang hujan tinggi, hindari pemupukan"
              : "Hindari pupuk cair jika hujan",
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="mb-10 ">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Informasi Cuaca Hari Ini
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          {/* Main Weather Card Skeleton */}
          <div className="lg:col-span-2 bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-40 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-32"></div>
              </div>
              <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <div className="h-16 bg-gray-300 rounded w-24"></div>
                <div className="h-10 bg-gray-300 rounded w-12"></div>
              </div>
              <div className="h-6 bg-gray-300 rounded w-36"></div>
            </div>

            {/* Weather Details Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-4"
                >
                  <div className="w-6 h-6 bg-gray-300 rounded mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-5 bg-gray-300 rounded w-12 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation Card Skeleton */}
          <div className="bg-[#308A50] text-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full"></div>
              <div className="h-6 bg-white/20 rounded w-32"></div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <div className="h-4 bg-white/20 rounded w-28 mb-2"></div>
              <div className="h-5 bg-white/20 rounded w-36 mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-24"></div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-white/20 rounded shrink-0"></div>
                <div className="h-4 bg-white/20 rounded flex-1"></div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-white/20 rounded shrink-0"></div>
                <div className="h-4 bg-white/20 rounded flex-1"></div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="h-3 bg-white/20 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Informasi Cuaca Hari Ini
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-red-700 mb-4">{error}</p>
          {locationDenied && (
            <button
              onClick={getWeatherData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Coba Lagi
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const recommendation = getFertilizationRecommendation();

  return (
    <div className="mb-12 mt-10 animate-fade-in">
      {/* Header with Icon */}
      <div className="flex items-center gap-3 mb-8 animate-slide-left">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            Prakiraan Cuaca
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Data real-time dari lokasi Anda
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Weather Card - Enhanced */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-500 animate-scale-in">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-linear-to-br from-blue-400 via-blue-500 to-blue-600"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjYSkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-30"></div>

          {/* Content */}
          <div className="relative z-10 p-8">
            {/* Location & Time */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-3 animate-slide-right">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl hover:bg-white/30 transition-all duration-300">
                  <svg
                    className="w-5 h-5 text-white"
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
                  <p className="text-white font-bold text-lg">
                    {weather.locationName}
                  </p>
                  <p className="text-white/80 text-sm flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {currentTime || "--:--"} WIB
                  </p>
                </div>
              </div>

              {/* Animated Weather Icon */}
              <div className="relative animate-float">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="text-8xl relative z-10 drop-shadow-2xl animate-bounce-in">
                  {getWeatherIcon(weather.weatherCode)}
                </div>
              </div>
            </div>

            {/* Temperature Display */}
            <div className="mb-8">
              <div className="flex items-start gap-3">
                <div className="flex items-baseline">
                  <span className="text-7xl lg:text-8xl font-black text-white drop-shadow-lg">
                    {weather.temperature}
                  </span>
                  <span className="text-4xl font-bold text-white/90 ml-1">
                    °C
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="h-1 w-16 bg-white/40 rounded-full"></div>
                <p className="text-xl text-white font-semibold tracking-wide">
                  {getWeatherDescription(weather.weatherCode)}
                </p>
              </div>
            </div>

            {/* Weather Details Grid - Enhanced Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/25 backdrop-blur-md rounded-2xl p-5 text-center transform hover:scale-105 transition-all duration-300 hover:bg-white/30 border border-white/30">
                <div className="bg-white/30 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </div>
                <p className="text-xs text-white/70 mb-1.5 font-medium">
                  Kelembapan
                </p>
                <p className="text-2xl font-black text-white">
                  {weather.humidity}%
                </p>
              </div>

              <div className="bg-white/25 backdrop-blur-md rounded-2xl p-5 text-center transform hover:scale-105 transition-all duration-300 hover:bg-white/30 border border-white/30">
                <div className="bg-white/30 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
                <p className="text-xs text-white/70 mb-1.5 font-medium">
                  Angin
                </p>
                <p className="text-2xl font-black text-white">
                  {weather.windSpeed}{" "}
                  <span className="text-sm font-semibold">km/h</span>
                </p>
              </div>

              <div className="bg-white/25 backdrop-blur-md rounded-2xl p-5 text-center transform hover:scale-105 transition-all duration-300 hover:bg-white/30 border border-white/30">
                <div className="bg-white/30 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                    />
                  </svg>
                </div>
                <p className="text-xs text-white/70 mb-1.5 font-medium">
                  Curah Hujan
                </p>
                <p className="text-2xl font-black text-white">
                  {weather.precipitation}%
                </p>
              </div>

              <div className="bg-white/25 backdrop-blur-md rounded-2xl p-5 text-center transform hover:scale-105 transition-all duration-300 hover:bg-white/30 border border-white/30">
                <div className="bg-white/30 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-xs text-white/70 mb-1.5 font-medium">
                  Kondisi
                </p>
                <p className="text-lg font-bold text-white">
                  {recommendation?.isGood ? "✓ Baik" : "⚠ Kurang"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation Card - Enhanced */}
        {recommendation && (
          <div
            className="relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-500 animate-scale-in"
            style={{ animationDelay: "200ms" }}
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-linear-to-br from-[#308A50] via-[#3FA865] to-[#308A50]"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zMCAzMG0tMTAgMGExMCAxMCAwIDEgMCAyMCAwYTEwIDEwIDAgMSAwLTIwIDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2EpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-40"></div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float"></div>
            <div
              className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-float"
              style={{ animationDelay: "1s" }}
            ></div>

            {/* Content */}
            <div className="relative z-10 p-8 flex flex-col h-full">
              {/* Header */}
              <div
                className="flex items-center gap-4 mb-6 animate-slide-left"
                style={{ animationDelay: "300ms" }}
              >
                <div className="bg-white/25 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    Saran Pemupukan
                  </h3>
                  <p className="text-white/80 text-sm mt-0.5">
                    Berdasarkan kondisi cuaca
                  </p>
                </div>
              </div>

              {/* Main Recommendation Box */}
              <div className="flex-1">
                <div
                  className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 mb-5 border-2 border-white/30 shadow-xl hover:bg-white/20 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: "400ms" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        recommendation.isGood ? "bg-green-300" : "bg-yellow-300"
                      } animate-pulse`}
                    ></div>
                    <p className="text-sm text-white/90 font-semibold uppercase tracking-wider">
                      {recommendation.isGood
                        ? "✓ Kondisi Ideal"
                        : "⚠ Perhatian"}
                    </p>
                  </div>
                  <p className="font-black text-2xl lg:text-3xl text-white mb-2 leading-tight">
                    {recommendation.type}
                  </p>
                  <p className="text-base text-white/90 font-medium">
                    {recommendation.subtitle}
                  </p>
                </div>

                {/* Tips */}
                <div className="space-y-3 mb-5">
                  {recommendation.tips.map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all"
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          tip.icon === "check"
                            ? "bg-green-400/30"
                            : "bg-yellow-400/30"
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 ${
                            tip.icon === "check"
                              ? "text-green-200"
                              : "text-yellow-200"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {tip.icon === "check" ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M12 9v2m0 4h.01"
                            />
                          )}
                        </svg>
                      </div>
                      <p className="text-sm text-white font-medium leading-relaxed">
                        {tip.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-white/80"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-white/70 font-medium">
                      Waktu Optimal
                    </p>
                    <p className="text-sm text-white font-bold">
                      Pagi (06:00-09:00) atau Sore (15:00-17:00)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
