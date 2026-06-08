import express, { Router } from "express";
import HomeController from "../controllers/home.controller";
import AuthController from "../controllers/auth.controller";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import addressRoutes from "./address.routes";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import cartRoutes from "./cart.routes";
import checkoutRoutes from "./checkout.routes";
import paymentRoutes from "./payment.routes";
import orderRoutes from "./order.routes";
import cloudinaryRoutes from "./cloudinary.routes";
import shippingRoutes from "./shipping.routes";
import dashboardRoutes from "./dashboard.routes";
import authMiddleware from "../middleware/auth";

const router: Router = express.Router();

router.get("/", HomeController.index);
router.get("/me", authMiddleware, AuthController.getProfile);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/addresses", addressRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/cart", cartRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/payments", paymentRoutes);
router.use("/orders", orderRoutes);
router.use("/cloudinary", cloudinaryRoutes);
router.use("/shipping", shippingRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
