import prisma from "../database/prisma";
import { OrderStatus, UserRole } from "@prisma/client";
import { OrderResponse } from "../types/order.types";

class OrderService {
  async getAllOrders(userId: string, role: UserRole): Promise<any[]> {
    const whereClause: Record<string, unknown> = {};

    // Buyer hanya bisa lihat pesanan mereka sendiri
    if (role === "buyer") {
      whereClause.user_id = userId;
    }
    // Seller bisa lihat SEMUA pesanan dari semua buyer
    // (tidak ada filter untuk seller)

    // Get checkouts with orders grouped
    const checkouts = await prisma.checkout.findMany({
      where: role === "buyer" ? { user_id: userId } : {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            addresses: {
              where: { is_default: true },
              take: 1,
              select: {
                id: true,
                label: true,
                recipient_name: true,
                phone: true,
                address_line: true,
                city: true,
                province: true,
                postal_code: true,
              },
            },
          },
        },
        orders: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                image_url: true,
                seller: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            shipments: {
              select: {
                id: true,
                order_id: true,
                courier_name: true,
                tracking_number: true,
                status: true,
                created_at: true,
                updated_at: true,
              },
              orderBy: {
                created_at: "desc",
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Transform data to group orders by checkout
    const result = checkouts.map((checkout) => ({
      id: checkout.id,
      checkout_id: checkout.id,
      user_id: checkout.user_id,
      status: checkout.status,
      total_price: checkout.total_price,
      shipping_price: checkout.shipping_price,
      grand_total: checkout.grand_total,
      created_at: checkout.created_at,
      updated_at: checkout.updated_at,
      user: checkout.user,
      checkout: {
        id: checkout.id,
        status: checkout.status,
        grand_total: checkout.grand_total,
        shipping_price: checkout.shipping_price,
      },
      items: checkout.orders.map((order) => ({
        id: order.id,
        product_id: order.product_id,
        quantity: order.quantity,
        price_each: order.price_each,
        total_price: order.total_price,
        status: order.status,
        product: order.product,
        shipments: order.shipments,
      })),
    }));

    return result;
  }

  async getOrderById(
    orderId: string,
    userId: string,
    role: UserRole,
  ): Promise<any> {
    // Try to find by checkout_id first (new format)
    let checkout = await prisma.checkout.findUnique({
      where: { id: orderId },
      select: { id: true, user_id: true },
    });

    // If not found as checkout, try to find as order (old format compatibility)
    if (!checkout) {
      const singleOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: { checkout_id: true, user_id: true },
      });

      if (!singleOrder) {
        throw new Error("Order not found");
      }

      // Buyer hanya bisa akses pesanan mereka sendiri
      if (role === "buyer" && singleOrder.user_id !== userId) {
        throw new Error("Forbidden: You can only access your own orders");
      }

      // Use the checkout_id from order
      checkout = await prisma.checkout.findUnique({
        where: { id: singleOrder.checkout_id },
        select: { id: true, user_id: true },
      });
    } else {
      // Buyer hanya bisa akses pesanan mereka sendiri
      if (role === "buyer" && checkout.user_id !== userId) {
        throw new Error("Forbidden: You can only access your own orders");
      }
    }

    if (!checkout) {
      throw new Error("Checkout not found");
    }

    // Get the full checkout with all its orders
    const fullCheckout = await prisma.checkout.findUnique({
      where: { id: checkout.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            addresses: {
              select: {
                id: true,
                label: true,
                recipient_name: true,
                phone: true,
                address_line: true,
                city: true,
                province: true,
                postal_code: true,
                is_default: true,
              },
            },
          },
        },
        orders: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                image_url: true,
                seller_id: true,
                seller: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            shipments: {
              select: {
                id: true,
                order_id: true,
                courier_name: true,
                tracking_number: true,
                status: true,
                created_at: true,
                updated_at: true,
              },
              orderBy: {
                created_at: "desc",
              },
            },
          },
        },
      },
    });

    if (!fullCheckout) {
      throw new Error("Checkout not found");
    }

    // Transform data to match expected format
    return {
      id: fullCheckout.id,
      checkout_id: fullCheckout.id,
      user_id: fullCheckout.user_id,
      status: fullCheckout.status,
      total_price: fullCheckout.total_price,
      shipping_price: fullCheckout.shipping_price,
      grand_total: fullCheckout.grand_total,
      created_at: fullCheckout.created_at,
      updated_at: fullCheckout.updated_at,
      user: fullCheckout.user,
      checkout: {
        id: fullCheckout.id,
        status: fullCheckout.status,
        grand_total: fullCheckout.grand_total,
        shipping_price: fullCheckout.shipping_price,
        notes: fullCheckout.notes,
      },
      items: fullCheckout.orders.map((order) => ({
        id: order.id,
        product_id: order.product_id,
        quantity: order.quantity,
        price_each: order.price_each,
        total_price: order.total_price,
        status: order.status,
        product: order.product,
        shipments: order.shipments,
      })),
    };
  }

  validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ["processed", "cancelled"],
      processed: ["shipped", "cancelled"],
      shipped: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    const allowedStatuses = validTransitions[currentStatus];

    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}. Allowed: ${allowedStatuses.join(", ")}`,
      );
    }
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    userId: string,
    userRole: UserRole,
    courierName?: string,
    trackingNumber?: string,
  ): Promise<OrderResponse> {
    // Try to find as checkout_id first (new format - grouped orders)
    let checkout = await prisma.checkout.findUnique({
      where: { id: orderId },
      include: {
        orders: true,
      },
    });

    let isCheckoutId = !!checkout;
    let checkoutId = orderId;
    let ordersToUpdate: any[] = [];

    if (checkout) {
      // This is a checkout_id, update all orders in this checkout
      ordersToUpdate = checkout.orders;
      checkoutId = checkout.id;
    } else {
      // Try to find as individual order_id (old format compatibility)
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          product: true,
          checkout: true,
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      ordersToUpdate = [order];
      checkoutId = order.checkout_id;
    }

    if (ordersToUpdate.length === 0) {
      throw new Error("No orders found to update");
    }

    // Seller bisa update semua order (seller = admin di sistem ini)
    // Buyer tidak bisa update order status
    if (userRole !== UserRole.seller) {
      throw new Error("Forbidden: Only sellers can update order status");
    }

    const currentStatus = ordersToUpdate[0].status;

    // Only validate status transition if status is actually changing
    if (currentStatus !== newStatus) {
      this.validateStatusTransition(currentStatus, newStatus);
    }

    // Always update order status (even if same, to ensure consistency)
    await prisma.order.updateMany({
      where: {
        checkout_id: checkoutId,
      },
      data: { status: newStatus },
    });

    // Handle shipment records for shipped status
    if (newStatus === "shipped" && courierName) {
      for (const order of ordersToUpdate) {
        // Check if shipment already exists for this order
        const existingShipment = await prisma.shipment.findFirst({
          where: { order_id: order.id },
        });

        if (existingShipment) {
          // Update existing shipment with new courier/tracking info
          await prisma.shipment.update({
            where: { id: existingShipment.id },
            data: {
              courier_name: courierName,
              tracking_number:
                trackingNumber || existingShipment.tracking_number,
              updated_at: new Date(),
            },
          });
        } else {
          // Create new shipment record
          await prisma.shipment.create({
            data: {
              order_id: order.id,
              courier_name: courierName,
              tracking_number: trackingNumber || null,
              status: "shipping",
            },
          });
        }
      }
    }

    // Get the updated first order with full details
    const updatedOrder = await prisma.order.findFirst({
      where: { checkout_id: checkoutId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            addresses: {
              where: { is_default: true },
              take: 1,
              select: {
                id: true,
                label: true,
                recipient_name: true,
                phone: true,
                address_line: true,
                city: true,
                province: true,
                postal_code: true,
              },
            },
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            stock: true,
            image_url: true,
          },
        },
        checkout: {
          select: {
            id: true,
            status: true,
            grand_total: true,
            shipping_price: true,
          },
        },
        shipments: {
          select: {
            id: true,
            order_id: true,
            courier_name: true,
            tracking_number: true,
            status: true,
            created_at: true,
            updated_at: true,
          },
          orderBy: {
            created_at: "desc",
          },
          take: 1,
        },
      },
    });

    if (!updatedOrder) {
      throw new Error("Failed to retrieve updated order");
    }

    // Update checkout status based on order statuses
    const checkoutOrders = await prisma.order.findMany({
      where: { checkout_id: checkoutId },
    });

    const allCompleted = checkoutOrders.every((o) => o.status === "completed");
    const anyCancelled = checkoutOrders.some((o) => o.status === "cancelled");

    if (allCompleted) {
      await prisma.checkout.update({
        where: { id: checkoutId },
        data: { status: "paid" },
      });
    } else if (
      anyCancelled &&
      checkoutOrders.every((o) => o.status === "cancelled")
    ) {
      await prisma.checkout.update({
        where: { id: checkoutId },
        data: { status: "expired" },
      });
    }

    return updatedOrder as unknown as OrderResponse;
  }
}

export default new OrderService();
