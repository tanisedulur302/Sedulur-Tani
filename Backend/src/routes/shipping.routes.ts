import { Router } from "express";
import shippingController from "../controllers/shipping.controller";
import authMiddleware from "../middleware/auth";
import { requireSeller } from "../middleware/roleCheck";

const router = Router();

/**
 * @route   GET /api/shipping/destinations
 * @desc    Get list of domestic destinations
 * @access  Public
 */
router.get("/destinations", shippingController.getDestinations);

/**
 * @route   GET /api/shipping/provinces
 * @desc    Get list of provinces
 * @access  Public
 */
router.get("/provinces", shippingController.getProvinces);

/**
 * @route   GET /api/shipping/regencies
 * @desc    Get list of regencies/cities by province
 * @access  Public
 * @query   province_id (optional)
 */
router.get("/regencies", shippingController.getRegencies);

/**
 * @route   GET /api/shipping/districts
 * @desc    Get list of districts (kecamatan)
 * @access  Public
 * @query   regency_id (optional)
 */
router.get("/districts", shippingController.getDistricts);

/**
 * @route   POST /api/shipping/cost
 * @desc    Calculate shipping cost with caching
 * @access  Public
 * @body    { origin, destination, weight, courier }
 */
router.post("/cost", shippingController.calculateCost);

/**
 * @route   DELETE /api/shipping/cache/expired
 * @desc    Clear expired cache entries
 * @access  Private (Seller only)
 */
router.delete(
  "/cache/expired",
  authMiddleware,
  requireSeller,
  shippingController.clearExpiredCache
);

/**
 * @route   DELETE /api/shipping/cache/all
 * @desc    Clear all cache entries (for testing)
 * @access  Private (Seller only)
 */
router.delete(
  "/cache/all",
  authMiddleware,
  requireSeller,
  shippingController.clearAllCache
);

export default router;
