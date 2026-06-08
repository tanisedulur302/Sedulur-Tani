import prisma from "../database/prisma";
import { CreateCheckoutDTO } from "../types/checkout.types";
import { calculateShippingCost } from "./shipping.service";

class CheckoutService {
  async validateAddress(addressId: string, userId: string) {
    const address = await prisma.userAddress.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new Error("Address not found");
    }

    if (address.user_id !== userId) {
      throw new Error("Forbidden: You can only use your own addresses");
    }

    return address;
  }

  async getCartWithItems(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { user_id: userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty. Add products before checkout");
    }

    return cart;
  }

  async validateStock(cart: any) {
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}`
        );
      }
    }
  }

  calculateTotals(cartItems: any[], provinceId: string) {
    let totalPrice = 0;
    let totalWeight = 0;

    for (const item of cartItems) {
      totalPrice += item.product.price * item.quantity;
      totalWeight += item.product.weight * item.quantity;
    }

    const weightInKg = totalWeight / 1000;
    const shippingPrice = calculateShippingCost(provinceId, weightInKg);
    const grandTotal = totalPrice + shippingPrice;

    return { totalPrice, shippingPrice, grandTotal, totalWeight };
  }

  async createCheckoutTransaction(
    userId: string,
    cart: any,
    totals: { totalPrice: number; shippingPrice: number; grandTotal: number },
    notes?: string
  ) {
    // ✅ Use transaction for checkout creation to ensure consistency
    return await prisma.$transaction(async (tx) => {
      // Re-validate stock within transaction for consistency
      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.product_id },
          select: { id: true, stock: true, name: true },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.product.name}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }
      }

      // Create checkout
      const checkout = await tx.checkout.create({
        data: {
          user_id: userId,
          total_price: totals.totalPrice,
          shipping_price: totals.shippingPrice,
          grand_total: totals.grandTotal,
          notes: notes || null,
          status: "pending",
        },
      });

      // Create orders
      const orderPromises = cart.items.map((item: any) =>
        tx.order.create({
          data: {
            checkout_id: checkout.id,
            user_id: userId,
            product_id: item.product_id,
            quantity: item.quantity,
            price_each: item.product.price,
            total_price: item.product.price * item.quantity,
            status: "pending",
          },
        })
      );

      await Promise.all(orderPromises);

      // Don't decrement stock here - will be done after successful payment
      // Don't clear cart yet - will be cleared after successful payment

      return checkout;
    });
  }

  async getCheckoutWithOrders(checkoutId: string) {
    return await prisma.checkout.findUnique({
      where: { id: checkoutId },
      include: {
        orders: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                weight: true,
                image_url: true,
              },
            },
          },
        },
      },
    });
  }

  async getCheckoutById(checkoutId: string, userId: string) {
    const checkout = await prisma.checkout.findUnique({
      where: { id: checkoutId },
      include: {
        orders: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                weight: true,
                image_url: true,
              },
            },
          },
        },
      },
    });

    if (!checkout) {
      throw new Error("Checkout not found");
    }

    if (checkout.user_id !== userId) {
      throw new Error("Forbidden: You can only view your own checkouts");
    }

    return checkout;
  }

  async getUserAddress(userId: string) {
    const address = await prisma.userAddress.findFirst({
      where: { user_id: userId },
      orderBy: [{ is_default: "desc" }, { created_at: "desc" }],
    });

    if (!address) {
      throw new Error("Address not found");
    }

    return address;
  }
}

export default new CheckoutService();
