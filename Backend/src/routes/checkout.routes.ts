import express, { Router } from "express";
import CheckoutController from "../controllers/checkout.controller";
import authMiddleware from "../middleware/auth";

const router: Router = express.Router();

router.post("/", authMiddleware, CheckoutController.create);
router.get("/:id", authMiddleware, CheckoutController.getById);

export default router;
