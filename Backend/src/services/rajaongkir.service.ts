import crypto from "crypto";
import ShippingCache from "../../models/ShippingCache";
import {
  getCities,
  findCityByName,
  calculateShippingCost,
  City,
} from "../data/shipping-rates";

const CACHE_DURATION_DAYS = 30; // Cache selama 30 hari

interface CostParams {
  origin: string;
  destination: string;
  weight: number;
  courier: string;
}

interface ShippingCost {
  service: string;
  description: string;
  cost: number;
  etd: string;
}

export class KomerceShippingService {
  /**
   * Generate cache key dari parameter
   */
  private generateCacheKey(params: CostParams): string {
    const { origin, destination, weight, courier } = params;
    const dataString = `${origin}-${destination}-${weight}-${courier}`;
    return crypto.createHash("md5").update(dataString).digest("hex");
  }

  /**
   * Get domestic destinations (static data)
   */
  async getDomesticDestinations() {
    try {
      const cities = getCities();

      return {
        success: true,
        data: cities.map((city) => ({
          id: city.id,
          code: city.id,
          name: city.name,
          city_name: city.name,
          province: city.province,
          type: city.type || "Kota",
        })),
      };
    } catch (error: any) {
      console.error("Error fetching destinations:", error.message);
      throw new Error("Failed to fetch destinations");
    }
  }

  /**
   * Get shipping cost dengan caching
   */
  async getCost(params: CostParams) {
    const { origin, destination, weight, courier } = params;

    // Validasi input
    if (!origin || !destination || !weight || !courier) {
      throw new Error("Missing required parameters");
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(params);

    console.log("🔍 Checking cache for key:", cacheKey);

    // Check cache
    const cachedData = await ShippingCache.findOne({
      cache_key: cacheKey,
      expires_at: { $gt: new Date() },
    });

    if (cachedData) {
      console.log("✅ Cache HIT - Returning cached data");
      return {
        fromCache: true,
        data: cachedData.costs,
        cachedAt: cachedData.created_at,
        expiresAt: cachedData.expires_at,
      };
    }

    console.log("❌ Cache MISS - Calculating shipping cost");

    // Calculate shipping cost from static data
    try {
      const costs = calculateShippingCost(destination, weight, courier);

      // Save to cache
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + CACHE_DURATION_DAYS);

      await ShippingCache.findOneAndUpdate(
        { cache_key: cacheKey },
        {
          cache_key: cacheKey,
          origin,
          destination,
          weight,
          courier,
          costs,
          expires_at: expiresAt,
        },
        { upsert: true, new: true }
      );

      console.log("💾 Data saved to cache");

      return {
        fromCache: false,
        data: costs,
        cachedAt: new Date(),
        expiresAt,
      };
    } catch (error: any) {
      console.error("Error calculating shipping cost:", error.message);
      throw new Error("Failed to get shipping cost");
    }
  }

  /**
   * Clear expired cache (optional - untuk manual cleanup)
   */
  async clearExpiredCache() {
    const result = await ShippingCache.deleteMany({
      expires_at: { $lt: new Date() },
    });

    console.log(`🗑️ Cleared ${result.deletedCount} expired cache entries`);
    return result.deletedCount;
  }

  /**
   * Clear all cache (untuk testing/debugging)
   */
  async clearAllCache() {
    const result = await ShippingCache.deleteMany({});
    console.log(`🗑️ Cleared all cache (${result.deletedCount} entries)`);
    return result.deletedCount;
  }
}

export default new KomerceShippingService();
