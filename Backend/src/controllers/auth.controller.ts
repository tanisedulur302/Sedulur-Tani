import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import prisma from "../database/prisma";
import { RegisterDTO, LoginDTO, AuthResponse, JWTPayload } from "../types/auth.types";
import { UserRole } from "@prisma/client";

class AuthController {
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password, phone, role }: RegisterDTO = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: "Name, email, password, and role are required"
        });
      }

      if (!Object.values(UserRole).includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Must be 'buyer' or 'seller'"
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password_hash: hashedPassword,
          phone,
          role
        }
      });

      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const jwtSecret = process.env.JWT_SECRET || "default-secret";
      const token = jwt.sign(payload, jwtSecret, { expiresIn: "7d" });

      const response: AuthResponse = {
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
          },
          token
        }
      };

      return res.status(201).json(response);
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during registration"
      });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password }: LoginDTO = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required"
        });
      }

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const jwtSecret = process.env.JWT_SECRET || "default-secret";
      const token = jwt.sign(payload, jwtSecret, { expiresIn: "7d" });

      const response: AuthResponse = {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
          },
          token
        }
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during login"
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          created_at: true,
          updated_at: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: { user }
      });
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
}

export default new AuthController();
