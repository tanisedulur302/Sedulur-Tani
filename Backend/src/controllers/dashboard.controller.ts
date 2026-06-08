import { Request, Response } from "express";
import DashboardService from "../services/dashboard.service";
import { successResponse } from "../utils/responseFormatter";
import { handleError } from "../utils/errorHandler";

class DashboardController {
  async getSellerStats(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      // Only sellers can access their dashboard
      if (user.role !== "seller") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Only sellers can access dashboard"
        });
      }

      const stats = await DashboardService.getSellerStatistics(user.userId);

      return res.status(200).json(
        successResponse("Dashboard statistics retrieved successfully", stats)
      );
    } catch (error) {
      return handleError(res, error);
    }
  }

  async getAdminStats(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      // For now, sellers act as admin
      if (user.role !== "seller") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Admin access required"
        });
      }

      const stats = await DashboardService.getAdminStatistics();

      return res.status(200).json(
        successResponse("Admin dashboard statistics retrieved successfully", stats)
      );
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new DashboardController();
