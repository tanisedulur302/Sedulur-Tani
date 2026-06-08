import prisma from "../database/prisma";

class CartService {
  async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { user_id: userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id: userId },
      });
    }

    return cart;
  }

  async getCartWithItems(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { user_id: userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                seller: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id: userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  seller: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }

  async getProduct(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  async validateStock(product: any, quantity: number) {
    if (product.stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}`);
    }
  }

  async findExistingCartItem(cartId: string, productId: string) {
    return await prisma.cartItem.findUnique({
      where: {
        cart_id_product_id: {
          cart_id: cartId,
          product_id: productId,
        },
      },
    });
  }

  async addOrUpdateCartItem(
    cartId: string,
    productId: string,
    quantity: number,
    existingItem: any,
    product: any
  ) {
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      // ✅ Strict stock validation with detailed error message
      if (product.stock < newQuantity) {
        throw new Error(
          `Insufficient stock. Available: ${product.stock}, Current in cart: ${existingItem.quantity}, Requested: ${quantity}`
        );
      }

      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    } else {
      // ✅ Validate stock for new item
      if (product.stock < quantity) {
        throw new Error(
          `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`
        );
      }

      return await prisma.cartItem.create({
        data: {
          cart_id: cartId,
          product_id: productId,
          quantity: quantity,
        },
        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    }
  }

  async getCartItem(itemId: string) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    return cartItem;
  }

  async validateCartItemOwnership(cartItem: any, userId: string) {
    if (cartItem.cart.user_id !== userId) {
      throw new Error("Forbidden: You can only update your own cart items");
    }
  }

  async updateCartItemQuantity(itemId: string, quantity: number) {
    // ✅ Get cart item with product info for validation
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        product: {
          select: {
            id: true,
            stock: true,
            name: true,
            seller: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    // ✅ Validate stock availability
    if (cartItem.product.stock < quantity) {
      throw new Error(
        `Insufficient stock for ${cartItem.product.name}. Available: ${cartItem.product.stock}, Requested: ${quantity}`
      );
    }

    return await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteCartItem(itemId: string) {
    await prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  calculateCartTotals(items: any[]) {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return { totalItems, totalPrice };
  }
}

export default new CartService();
