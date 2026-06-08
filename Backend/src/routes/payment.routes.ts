import express, { Router } from "express";
import PaymentController from "../controllers/payment.controller";
import authMiddleware from "../middleware/auth";

const router: Router = express.Router();

// Test routes for Xendit
router.get("/test-config", PaymentController.testXenditConfig);
router.post("/test-invoice", PaymentController.testCreateInvoice);

// Test webhook with sample data
router.post("/test-webhook", PaymentController.webhook);

// Production routes
router.post("/create", authMiddleware, PaymentController.create);
router.post("/webhook", PaymentController.webhook);
router.get("/:checkoutId", authMiddleware, PaymentController.getStatus);

export default router;
