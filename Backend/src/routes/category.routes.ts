import { Router } from "express";
import CategoryController from "../controllers/category.controller";
import authMiddleware from "../middleware/auth";
import { upload } from "../middleware/upload"; // Changed from utils/imageUpload to middleware/upload

const router = Router();

// Public routes
router.get("/", CategoryController.getAll);
router.get("/:id", CategoryController.getById);

// Protected routes (Seller/Admin only usually, but logic might vary)
// For now assuming any authenticated user can manage (or you can restrict role in middleware)
router.post("/", authMiddleware, upload.single("image"), CategoryController.create);
router.put("/:id", authMiddleware, upload.single("image"), CategoryController.update);
router.delete("/:id", authMiddleware, CategoryController.delete);

export default router;
