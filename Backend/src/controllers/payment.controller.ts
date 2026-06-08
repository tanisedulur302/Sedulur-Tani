import { Request, Response } from "express";
import PaymentService from "../services/payment.service";
import {
  CreatePaymentDTO,
  XenditInvoiceCallback,
} from "../types/payment.types";
import { successResponse } from "../utils/responseFormatter";
import { handleError } from "../utils/errorHandler";

class PaymentController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { checkout_id }: CreatePaymentDTO = req.body;

      if (!checkout_id) {
        return res.status(400).json({
          success: false,
          message: "checkout_id is required",
        });
      }

      console.log(
        "Creating payment for checkout:",
        checkout_id,
        "user:",
        userId
      );

      const payment = await PaymentService.createPayment(checkout_id, userId);

      return res
        .status(201)
        .json(successResponse("Payment created successfully", payment));
    } catch (error: any) {
      console.error("Payment controller error:", error);
      return handleError(res, error);
    }
  }

  async webhook(req: Request, res: Response): Promise<Response> {
    try {
      // Verify Xendit callback token
      const callbackToken = req.headers["x-callback-token"] as string;

      if (!PaymentService.verifyWebhookSignature(callbackToken)) {
        return res.status(401).json({
          success: false,
          message: "Invalid callback token",
        });
      }

      const callback: XenditInvoiceCallback = req.body;

      await PaymentService.handleWebhook(callback);

      return res.status(200).json({
        success: true,
        message: "Notification processed",
      });
    } catch (error) {
      console.error("Webhook error:", error);
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Webhook processing failed",
      });
    }
  }

  async getStatus(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { checkoutId } = req.params;

      if (!checkoutId) {
        return res.status(400).json({
          success: false,
          message: "checkoutId is required",
        });
      }

      const status = await PaymentService.getPaymentStatus(checkoutId, userId);

      return res
        .status(200)
        .json(successResponse("Payment status retrieved successfully", status));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async testXenditConfig(req: Request, res: Response): Promise<Response> {
    try {
      const config = await PaymentService.testXenditConnection();

      return res
        .status(200)
        .json(successResponse("Xendit configuration test completed", config));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async testCreateInvoice(req: Request, res: Response): Promise<Response> {
    try {
      const { amount, customer_name, customer_email, customer_phone } =
        req.body;

      if (!amount || !customer_name || !customer_email) {
        return res.status(400).json({
          success: false,
          message: "amount, customer_name, and customer_email are required",
        });
      }

      const result = await PaymentService.testCreateInvoice({
        amount: parseFloat(amount),
        customer_name,
        customer_email,
        customer_phone: customer_phone || "",
      });

      return res
        .status(200)
        .json(successResponse("Test invoice created successfully", result));
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new PaymentController();
