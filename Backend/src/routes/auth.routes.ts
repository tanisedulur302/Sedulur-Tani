import express, { Router } from "express";
import AuthController from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth";



const router: Router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authMiddleware, AuthController.getProfile);

export default router;
