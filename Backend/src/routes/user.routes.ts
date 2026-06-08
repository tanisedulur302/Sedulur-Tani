import express, { Router } from "express";
import UserController from "../controllers/user.controller";
import authMiddleware from "../middleware/auth";
import { requireSeller } from "../middleware/roleCheck";

const router: Router = express.Router();

// Admin routes (seller only)
router.get("/", authMiddleware, requireSeller, UserController.getAll);
router.put("/:id/role", authMiddleware, requireSeller, UserController.updateRole);
router.delete("/:id", authMiddleware, requireSeller, UserController.delete);

// User routes
router.get("/:id", authMiddleware, UserController.getById);
router.put("/:id", authMiddleware, UserController.updateProfile);

export default router;
