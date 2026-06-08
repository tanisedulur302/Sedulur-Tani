import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../types/auth.types";

dotenv.config();

interface AuthRequest extends Request {
  user?: JWTPayload;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing"
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing"
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "default-secret";
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    req.user = decoded;
    
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: errorMessage
    });
  }
};

export default authMiddleware;
