import { Request, Response } from "express";
import prisma from "../database/prisma";
import { UpdateUserDTO, ApiResponse, UserResponse } from "../types/user.types";

class UserController {
  // Get all users (admin/seller only)
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { role, search, page = 1, limit = 10 } = req.query;
      
      const where: any = {};
      
      if (role && role !== 'all') {
        where.role = role;
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            created_at: true,
            updated_at: true
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.user.count({ where })
      ]);

      return res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: { 
          users,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error("Get all users error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }

  // Update user role (admin/seller only)
  async updateRole(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "User ID is required"
        });
      }

      if (!role || !['buyer', 'seller'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Valid role (buyer/seller) is required"
        });
      }

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role },
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

      return res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: { user: updatedUser }
      });
    } catch (error) {
      console.error("Update user role error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }

  // Delete user (admin/seller only)
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const currentUserId = (req as any).user?.userId;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "User ID is required"
        });
      }

      if (id === currentUserId) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete your own account"
        });
      }

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      await prisma.user.delete({ where: { id } });

      return res.status(200).json({
        success: true,
        message: "User deleted successfully"
      });
    } catch (error) {
      console.error("Delete user error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "User ID is required"
        });
      }

      const user = await prisma.user.findUnique({
        where: { id },
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

      const response: ApiResponse<{ user: UserResponse }> = {
        success: true,
        message: "User retrieved successfully",
        data: { user }
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error("Get user by ID error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "User ID is required"
        });
      }

      if (userId !== id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only update your own profile"
        });
      }

      const { name, phone, email }: UpdateUserDTO = req.body;

      if (!name && !phone && !email) {
        return res.status(400).json({
          success: false,
          message: "At least one field (name, phone, or email) must be provided"
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        });

        if (emailExists) {
          return res.status(409).json({
            success: false,
            message: "Email already in use"
          });
        }
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email;

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
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

      const response: ApiResponse<{ user: UserResponse }> = {
        success: true,
        message: "Profile updated successfully",
        data: { user: updatedUser }
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
}

export default new UserController();
