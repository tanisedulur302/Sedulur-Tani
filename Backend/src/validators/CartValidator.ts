import { AddToCartDTO, UpdateCartItemDTO } from "../types/cart.types";

class CartValidator {
  validateAddToCart(data: AddToCartDTO) {
    const errors: string[] = [];

    if (!data.product_id) {
      errors.push("Product ID is required");
    }

    if (data.quantity === undefined) {
      errors.push("Quantity is required");
    }

    if (data.quantity !== undefined && data.quantity <= 0) {
      errors.push("Quantity must be greater than 0");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }
  }

  validateUpdateCartItem(data: UpdateCartItemDTO) {
    const errors: string[] = [];

    if (data.quantity === undefined) {
      errors.push("Quantity is required");
    }

    if (data.quantity !== undefined && data.quantity <= 0) {
      errors.push("Quantity must be greater than 0");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }
  }
}

export default new CartValidator();
