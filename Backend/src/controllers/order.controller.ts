import { Request, Response } from "express";
import OrderService from "../services/order.service";
import { UpdateOrderStatusDTO } from "../types/order.types";
import { successResponse } from "../utils/responseFormatter";
import { handleError } from "../utils/errorHandler";
import { OrderStatus } from "@prisma/client";

class OrderController {
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      const orders = await OrderService.getAllOrders(user.userId, user.role);

      return res.status(200).json(
        successResponse("Orders retrieved successfully", {
          orders,
          total: orders.length
        })
      );
    } catch (error) {
      return handleError(res, error);
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required"
        });
      }

      const order = await OrderService.getOrderById(id, user.userId, user.role);

      return res.status(200).json(
        successResponse("Order retrieved successfully", { order })
      );
    } catch (error) {
      return handleError(res, error);
    }
  }

  async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      const { id } = req.params;
      const { status, courier_name, tracking_number }: UpdateOrderStatusDTO = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required"
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required"
        });
      }

      const validStatuses: OrderStatus[] = ["pending", "processed", "shipped", "completed", "cancelled"];
      if (!validStatuses.includes(status as OrderStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Valid statuses: ${validStatuses.join(", ")}`
        });
      }

      // Validate courier info when shipping
      if (status === "shipped" && !courier_name) {
        return res.status(400).json({
          success: false,
          message: "Courier name is required when shipping"
        });
      }

      const updatedOrder = await OrderService.updateOrderStatus(
        id,
        status as OrderStatus,
        user.userId,
        user.role,
        courier_name,
        tracking_number
      );

      return res.status(200).json(
        successResponse("Order status updated successfully", { order: updatedOrder })
      );
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new OrderController();
