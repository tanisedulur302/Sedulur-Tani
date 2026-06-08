import express, { Router } from "express";
import CartController from "../controllers/cart.controller";
import authMiddleware from "../middleware/auth";

const router: Router = express.Router();

router.post("/", authMiddleware, CartController.addToCart);
router.get("/", authMiddleware, CartController.getCart);
router.put("/:itemId", authMiddleware, CartController.updateCartItem);
router.delete("/:itemId", authMiddleware, CartController.removeCartItem);

export default router;
