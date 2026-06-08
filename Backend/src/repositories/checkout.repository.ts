import prisma from "../database/prisma";

export const CheckoutRepository = {
  getAddressById(addressId: string) {
    return prisma.userAddress.findUnique({ where: { id: addressId } });
  },

  getCartByUserId(userId: string) {
    return prisma.cart.findUnique({
      where: { user_id: userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });
  },

  createCheckout(data: any) {
    return prisma.checkout.create({ data });
  },

  createOrder(data: any) {
    return prisma.order.create({ data });
  },

  updateProductStock(productId: string, quantity: number) {
    return prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } }
    });
  },

  clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({
      where: { cart_id: cartId }
    });
  },

  getCheckoutComplete(id: string) {
    return prisma.checkout.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                weight: true,
                image_url: true
              }
            }
          }
        }
      }
    });
  }
};
