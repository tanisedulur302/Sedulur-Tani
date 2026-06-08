import express, { Router } from "express";
import OrderController from "../controllers/order.controller";
import authMiddleware from "../middleware/auth";
import { requireSeller } from "../middleware/roleCheck";

const router: Router = express.Router();

router.get("/", authMiddleware, OrderController.getAll);
router.get("/:id", authMiddleware, OrderController.getById);
router.put(
  "/:id/status",
  authMiddleware,
  requireSeller,
  OrderController.updateStatus,
);

export default router;
