import express, { Router } from "express";
import AddressController from "../controllers/address.controller";
import authMiddleware from "../middleware/auth";

const router: Router = express.Router();

router.post("/", authMiddleware, AddressController.create);
router.get("/", authMiddleware, AddressController.getAll);
router.get("/:id", authMiddleware, AddressController.getById);
router.put("/:id", authMiddleware, AddressController.update);
router.delete("/:id", authMiddleware, AddressController.delete);

export default router;
