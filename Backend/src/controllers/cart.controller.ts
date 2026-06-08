import { Request, Response } from "express";
import { AddToCartDTO, UpdateCartItemDTO, CartItemResponse, CartResponse } from "../types/cart.types";
import CartService from "../services/Cart.service";
import CartValidator from "../validators/CartValidator";
import { successResponse } from "../utils/responseFormatter";
import { handleError } from "../utils/errorHandler";

class CartController {
  async addToCart(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      const { product_id, quantity }: AddToCartDTO = req.body;

      CartValidator.validateAddToCart({ product_id, quantity });

      const product = await CartService.getProduct(product_id);
      await CartService.validateStock(product, quantity);

      const cart = await CartService.getOrCreateCart(userId);
      const existingItem = await CartService.findExistingCartItem(cart.id, product_id);

      const cartItem = await CartService.addOrUpdateCartItem(
        cart.id,
        product_id,
        quantity,
        existingItem,
        product
      );

      const itemResponse: CartItemResponse = {
        id: cartItem.id,
        cart_id: cartItem.cart_id,
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        product: cartItem.product,
        subtotal: cartItem.product.price * cartItem.quantity
      };

      const message = existingItem ? "Cart item quantity updated" : "Product added to cart";

      return res.status(200).json(
        successResponse(message, { item: itemResponse })
      );
    } catch (error) {
      return handleError(res, error);
    }
  }

  async getCart(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      const cart = await CartService.getCartWithItems(userId);

      const items: CartItemResponse[] = cart.items.map(item => ({
        id: item.id,
        cart_id: item.cart_id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.product,
        subtotal: item.product.price * item.quantity
      }));

      const { totalItems, totalPrice } = CartService.calculateCartTotals(items);

      const cartResponse: CartResponse = {
        id: cart.id,
        user_id: cart.user_id,
        items: items,
        total_items: totalItems,
        total_price: totalPrice,
        created_at: cart.created_at,
        updated_at: cart.updated_at
      };

      return res.status(200).json(
        successResponse("Cart retrieved successfully", { cart: cartResponse })
      );
    } catch (error) {
      return handleError(res, error);
    }
  }

  async updateCartItem(req: Request, res: Response): Promise<Response> {
    try {
      const { itemId } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      if (!itemId) {
        return res.status(400).json({
          success: false,
          message: "Cart item ID is required"
        });
      }

      const { quantity }: UpdateCartItemDTO = req.body;

      CartValidator.validateUpdateCartItem({ quantity });

      const cartItem = await CartService.getCartItem(itemId);
      await CartService.validateCartItemOwnership(cartItem, userId);
      await CartService.validateStock(cartItem.product, quantity);

      const updatedCartItem = await CartService.updateCartItemQuantity(itemId, quantity);

      const itemResponse: CartItemResponse = {
        id: updatedCartItem.id,
        cart_id: updatedCartItem.cart_id,
        product_id: updatedCartItem.product_id,
        quantity: updatedCartItem.quantity,
        product: updatedCartItem.product,
        subtotal: updatedCartItem.product.price * updatedCartItem.quantity
      };

      return res.status(200).json(
        successResponse("Cart item updated successfully", { item: itemResponse })
      );
    } catch (error) {
      return handleError(res, error);
    }
  }

  async removeCartItem(req: Request, res: Response): Promise<Response> {
    try {
      const { itemId } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      if (!itemId) {
        return res.status(400).json({
          success: false,
          message: "Cart item ID is required"
        });
      }

      const cartItem = await CartService.getCartItem(itemId);
      await CartService.validateCartItemOwnership(cartItem, userId);
      await CartService.deleteCartItem(itemId);

      return res.status(200).json(
        successResponse("Cart item removed successfully")
      );
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new CartController();
