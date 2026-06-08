import { Request, Response } from "express";
import { CreateCheckoutDTO, CheckoutResponse } from "../types/checkout.types";
import CheckoutService from "../services/checkout.service";
import CheckoutValidator from "../validators/CheckoutValidator";
import { successResponse } from "../utils/responseFormatter";
import { handleError } from "../utils/errorHandler";

class CheckoutController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      const { address_id, shipping_method, notes }: CreateCheckoutDTO = req.body;

      CheckoutValidator.validateCreateCheckout({ address_id, shipping_method, notes });

      const address = await CheckoutService.validateAddress(address_id, userId);
      const cart = await CheckoutService.getCartWithItems(userId);
      await CheckoutService.validateStock(cart);

      const totals = CheckoutService.calculateTotals(cart.items, address.province);
      const checkout = await CheckoutService.createCheckoutTransaction(userId, cart, totals, notes);
      const completeCheckout = await CheckoutService.getCheckoutWithOrders(checkout.id);

      const checkoutResponse: CheckoutResponse = {
        id: checkout.id,
        user_id: checkout.user_id,
        address: {
          id: address.id,
          label: address.label,
          recipient_name: address.recipient_name,
          phone: address.phone,
          address_line: address.address_line,
          city: address.city,
          province: address.province,
          postal_code: address.postal_code
        },
        orders: completeCheckout!.orders.map(order => ({
          id: order.id,
          checkout_id: order.checkout_id,
          user_id: order.user_id,
          product_id: order.product_id,
          quantity: order.quantity,
          price_each: order.price_each,
          total_price: order.total_price,
          status: order.status,
          product: order.product
        })),
        total_price: checkout.total_price,
        shipping_price: checkout.shipping_price,
        grand_total: checkout.grand_total,
        shipping_method: shipping_method || "Standard",
        notes: notes || null,
        status: checkout.status,
        created_at: checkout.created_at,
        updated_at: checkout.updated_at
      };

      return res.status(201).json(
        successResponse("Checkout created successfully", { checkout: checkoutResponse })
      );
    } catch (error) {
      return handleError(res, error);
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Checkout ID is required"
        });
      }

      const checkout = await CheckoutService.getCheckoutById(id, userId);
      const address = await CheckoutService.getUserAddress(userId);

      const checkoutResponse: CheckoutResponse = {
        id: checkout.id,
        user_id: checkout.user_id,
        address: {
          id: address.id,
          label: address.label,
          recipient_name: address.recipient_name,
          phone: address.phone,
          address_line: address.address_line,
          city: address.city,
          province: address.province,
          postal_code: address.postal_code
        },
        orders: checkout.orders.map(order => ({
          id: order.id,
          checkout_id: order.checkout_id,
          user_id: order.user_id,
          product_id: order.product_id,
          quantity: order.quantity,
          price_each: order.price_each,
          total_price: order.total_price,
          status: order.status,
          product: order.product
        })),
        total_price: checkout.total_price,
        shipping_price: checkout.shipping_price,
        grand_total: checkout.grand_total,
        shipping_method: "Standard",
        notes: null,
        status: checkout.status,
        created_at: checkout.created_at,
        updated_at: checkout.updated_at
      };

      return res.status(200).json(
        successResponse("Checkout retrieved successfully", { checkout: checkoutResponse })
      );
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new CheckoutController();
