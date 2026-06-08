import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export const requireSeller = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Response | void => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Authentication required",
      });
    }

    if (user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only sellers can perform this action",
      });
    }

    next();
  } catch (error) {
    console.error("Role check error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const requireBuyer = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Response | void => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Authentication required",
      });
    }

    if (user.role !== "buyer") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only buyers can perform this action",
      });
    }

    next();
  } catch (error) {
    console.error("Role check error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
