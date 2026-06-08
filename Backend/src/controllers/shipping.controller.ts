import { Request, Response } from "express";
import komerceShippingService from "../services/rajaongkir.service";
import locationService from "../services/location.service";

export class ShippingController {
  /**
   * Get list of domestic destinations
   */
  async getDestinations(req: Request, res: Response) {
    try {
      const result = await komerceShippingService.getDomesticDestinations();

      res.status(200).json({
        success: true,
        message: "Destinations retrieved successfully",
        data: result.data, // Extract the data array directly
      });
    } catch (error: any) {
      console.error("Error in getDestinations:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get destinations",
      });
    }
  }

  /**
   * Get list of provinces
   */
  async getProvinces(req: Request, res: Response) {
    try {
      const provinces = locationService.getProvinces();

      res.status(200).json({
        success: true,
        message: "Provinces retrieved successfully",
        data: provinces.map((p) => ({
          id: p.id,
          province_id: p.id,
          name: p.name,
          province: p.name,
        })),
      });
    } catch (error: any) {
      console.error("Error in getProvinces:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get provinces",
      });
    }
  }

  /**
   * Get list of regencies/cities by province
   */
  async getRegencies(req: Request, res: Response) {
    try {
      const { province_id } = req.query;
      const regencies = locationService.getRegencies(
        province_id as string | undefined
      );

      // Format as regencies
      const formattedRegencies = regencies.map((regency) => ({
        id: regency.id,
        city_id: regency.id,
        province_id: regency.province_id,
        province:
          locationService.getProvinceById(regency.province_id)?.name || "",
        type: regency.type === "KOTA" ? "Kota" : "Kabupaten",
        name: regency.name,
        city_name: regency.name,
        postal_code: "",
      }));

      res.status(200).json({
        success: true,
        message: "Regencies retrieved successfully",
        data: formattedRegencies,
      });
    } catch (error: any) {
      console.error("Error in getRegencies:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get regencies",
      });
    }
  }

  /**
   * Get list of districts (kecamatan)
   */
  async getDistricts(req: Request, res: Response) {
    try {
      const { regency_id } = req.query;
      const districts = locationService.getDistricts(
        regency_id as string | undefined
      );

      const formattedDistricts = districts.map((district) => ({
        id: district.id,
        district_id: district.id,
        regency_id: district.regency_id,
        name: district.name,
        district_name: district.name,
      }));

      res.status(200).json({
        success: true,
        message: "Districts retrieved successfully",
        data: formattedDistricts,
      });
    } catch (error: any) {
      console.error("Error in getDistricts:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get districts",
      });
    }
  }

  /**
   * Calculate shipping cost with caching
   */
  async calculateCost(req: Request, res: Response) {
    try {
      const { origin, destination, weight, courier } = req.body;

      // Validasi input
      if (!origin || !destination || !weight || !courier) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: origin, destination, weight, courier",
        });
      }

      // Validasi weight (minimal 1 gram)
      if (weight < 1) {
        return res.status(400).json({
          success: false,
          message: "Weight must be at least 1 gram",
        });
      }

      const result = await komerceShippingService.getCost({
        origin,
        destination,
        weight: parseInt(weight),
        courier: courier.toLowerCase(),
      });

      res.status(200).json({
        success: true,
        message: "Shipping cost calculated successfully",
        data: {
          costs: result.data,
          fromCache: result.fromCache,
          cachedAt: result.cachedAt,
          expiresAt: result.expiresAt,
        },
      });
    } catch (error: any) {
      console.error("Error in calculateCost:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to calculate shipping cost",
      });
    }
  }

  /**
   * Clear expired cache (admin only)
   */
  async clearExpiredCache(req: Request, res: Response) {
    try {
      const deletedCount = await komerceShippingService.clearExpiredCache();

      res.status(200).json({
        success: true,
        message: `Cleared ${deletedCount} expired cache entries`,
        data: { deletedCount },
      });
    } catch (error: any) {
      console.error("Error in clearExpiredCache:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to clear cache",
      });
    }
  }

  /**
   * Clear all cache (admin only - for testing)
   */
  async clearAllCache(req: Request, res: Response) {
    try {
      const deletedCount = await komerceShippingService.clearAllCache();

      res.status(200).json({
        success: true,
        message: `Cleared all cache (${deletedCount} entries)`,
        data: { deletedCount },
      });
    } catch (error: any) {
      console.error("Error in clearAllCache:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to clear cache",
      });
    }
  }
}

export default new ShippingController();
