import { Router } from "express";
import authMiddleware from "../middleware/auth";
import DashboardController from "../controllers/dashboard.controller";

const router = Router();

router.use(authMiddleware);

router.get("/seller", DashboardController.getSellerStats);
router.get("/admin", DashboardController.getAdminStats);

export default router;
