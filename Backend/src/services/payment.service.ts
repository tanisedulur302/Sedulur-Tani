import prisma from "../database/prisma";
import {
  CreatePaymentResponse,
  XenditInvoiceCallback,
} from "../types/payment.types";
import * as crypto from "crypto";

const { Xendit } = require("xendit-node");

class PaymentService {
  private xenditClient: any;

  constructor() {
    this.initializeXendit();
  }

  private initializeXendit() {
    const apiKey = process.env.XENDIT_API_KEY;
    if (!apiKey) {
      throw new Error("XENDIT_API_KEY is not configured");
    }
    this.xenditClient = new Xendit({ secretKey: apiKey });
  }

  async getCheckout(checkoutId: string, userId: string) {
    const checkout = await prisma.checkout.findUnique({
      where: { id: checkoutId },
      include: {
        user: true,
        orders: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!checkout) {
      throw new Error("Checkout not found");
    }

    if (checkout.user_id !== userId) {
      throw new Error("Forbidden: You can only access your own checkout");
    }

    return checkout;
  }

  async createPayment(
    checkoutId: string,
    userId: string
  ): Promise<CreatePaymentResponse> {
    try {
      const checkout = await this.getCheckout(checkoutId, userId);

      if (checkout.status === "paid") {
        throw new Error("Checkout has already been paid");
      }

      if (checkout.status === "expired") {
        throw new Error("Checkout has expired");
      }

      const externalId = `ORDER-${checkoutId}-${Date.now()}`;

      // Prepare item details
      const items = checkout.orders.map((order) => ({
        name: order.product.name,
        quantity: order.quantity,
        price: order.price_each,
        category: order.product.category || "Other",
      }));

      // Add shipping as separate item
      if (checkout.shipping_price > 0) {
        items.push({
          name: "Biaya Pengiriman",
          quantity: 1,
          price: checkout.shipping_price,
          category: "Shipping",
        });
      }

      const invoiceData = {
        externalId: externalId,
        amount: checkout.grand_total,
        payerEmail: checkout.user.email,
        description: `Payment for order ${externalId}`,
        customer: {
          givenNames: checkout.user.name || "Customer",
          email: checkout.user.email,
          mobileNumber: checkout.user.phone || "+628123456789",
        },
        customerNotificationPreference: {
          invoiceCreated: ["email"],
          invoicePaid: ["email"],
        },
        items: items,
        currency: "IDR",
        invoiceDuration: 86400, // 24 hours
        successRedirectUrl: `${process.env.FRONTEND_URL}/orders`,
        failureRedirectUrl: `${process.env.FRONTEND_URL}/checkout`,
      };

      console.log(
        "Creating Xendit invoice with params:",
        JSON.stringify(invoiceData, null, 2)
      );

      const { Invoice } = this.xenditClient;
      const invoice = await Invoice.createInvoice({
        data: invoiceData,
      });

      const payment = await prisma.payment.create({
        data: {
          checkout_id: checkoutId,
          xendit_invoice_id: invoice.id,
          transaction_id: externalId,
          gross_amount: checkout.grand_total,
          transaction_status: "pending",
        },
      });

      return {
        invoice_url: invoice.invoiceUrl,
        invoice_id: invoice.id,
        transaction_id: payment.id,
      };
    } catch (error: any) {
      console.error("Payment creation error:", error);
      throw new Error(
        `Failed to create payment: ${error.message || error.toString()}`
      );
    }
  }

  verifyWebhookSignature(token: string, webhookId?: string): boolean {
    const xenditCallbackToken = process.env.XENDIT_WEBHOOK_TOKEN || "";
    if (!xenditCallbackToken) {
      console.warn(
        "XENDIT_WEBHOOK_TOKEN not configured, skipping verification"
      );
      return true; // Allow for development
    }
    return token === xenditCallbackToken;
  }

  async handleWebhook(callback: XenditInvoiceCallback): Promise<void> {
    // For Xendit, signature verification is done via callback token in headers
    // This should be verified in the controller/route middleware

    console.log("Processing Xendit callback:", callback);

    const payment = await prisma.payment.findUnique({
      where: { xendit_invoice_id: callback.id },
      include: {
        checkout: {
          include: {
            orders: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error("Payment not found for this Xendit invoice ID");
    }

    // ✅ IDEMPOTENCY CHECK - Prevent duplicate callback processing
    const existingCallback = await prisma.paymentNotification.findFirst({
      where: {
        payment_id: payment.id,
        raw_body: JSON.stringify(callback),
      },
    });

    if (existingCallback) {
      console.log("Duplicate callback detected, skipping processing");
      return; // Callback already processed
    }

    // Save notification callback
    await prisma.paymentNotification.create({
      data: {
        payment_id: payment.id,
        raw_body: JSON.stringify(callback),
      },
    });

    const invoiceStatus = callback.status.toUpperCase();

    let checkoutStatus: "pending" | "paid" | "expired" = "pending";
    let orderStatus:
      | "pending"
      | "processed"
      | "shipped"
      | "completed"
      | "cancelled" = "pending";

    // Xendit invoice statuses: PENDING, PAID, EXPIRED, SETTLED
    if (invoiceStatus === "PAID" || invoiceStatus === "SETTLED") {
      checkoutStatus = "paid";
      orderStatus = "processed";
    } else if (invoiceStatus === "EXPIRED") {
      checkoutStatus = "expired";
      orderStatus = "cancelled";
    } else if (invoiceStatus === "PENDING") {
      checkoutStatus = "pending";
      orderStatus = "pending";
    }

    // ✅ USE TRANSACTION for atomic operations
    try {
      await prisma.$transaction(async (tx) => {
        // Update payment status
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            transaction_status: invoiceStatus.toLowerCase(),
            payment_method: callback.payment_method,
            transaction_time: callback.paid_at
              ? new Date(callback.paid_at)
              : null,
          },
        });

        // Update checkout status
        await tx.checkout.update({
          where: { id: payment.checkout_id },
          data: {
            status: checkoutStatus,
          },
        });

        // Update orders status
        await tx.order.updateMany({
          where: { checkout_id: payment.checkout_id },
          data: {
            status: orderStatus,
          },
        });

        // Clear cart and update stock ONLY if payment successful
        if (checkoutStatus === "paid") {
          const checkout = await tx.checkout.findUnique({
            where: { id: payment.checkout_id },
            select: { user_id: true },
          });

          if (checkout) {
            const cart = await tx.cart.findUnique({
              where: { user_id: checkout.user_id },
            });

            if (cart) {
              await tx.cartItem.deleteMany({
                where: { cart_id: cart.id },
              });
            }
          }

          // ✅ UPDATE STOCK with ATOMIC DECREMENT
          for (const order of payment.checkout.orders) {
            // Validate stock available before decrement
            const product = await tx.product.findUnique({
              where: { id: order.product_id },
              select: { id: true, stock: true, name: true },
            });

            if (!product) {
              throw new Error(`Product not found: ${order.product_id}`);
            }

            if (product.stock < order.quantity) {
              throw new Error(
                `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${order.quantity}`
              );
            }

            // Atomic decrement - prevents race condition
            await tx.product.update({
              where: { id: order.product_id },
              data: {
                stock: {
                  decrement: order.quantity,
                },
              },
            });
          }
        }
      });

      console.log("Payment callback processed successfully");
    } catch (error) {
      console.error("Error processing payment callback:", error);
      throw error;
    }
  }

  async getPaymentStatus(checkoutId: string, userId: string) {
    const checkout = await this.getCheckout(checkoutId, userId);

    const payment = await prisma.payment.findFirst({
      where: { checkout_id: checkoutId },
      orderBy: { created_at: "desc" },
    });

    if (!payment) {
      throw new Error("Payment not found for this checkout");
    }

    return {
      checkout_id: checkoutId,
      transaction_id: payment.id,
      transaction_status: payment.transaction_status,
      payment_method: payment.payment_method || undefined,
      gross_amount: payment.gross_amount,
      transaction_time: payment.transaction_time || undefined,
    };
  }

  async testXenditConnection() {
    const apiKey = process.env.XENDIT_API_KEY;

    if (!apiKey) {
      throw new Error("XENDIT_API_KEY is not configured");
    }

    if (!apiKey.startsWith("xnd_")) {
      throw new Error(
        "Invalid Xendit API Key format. Expected to start with 'xnd_'"
      );
    }

    try {
      const testClient = new Xendit({ secretKey: apiKey });
      const { Balance } = testClient;

      // Test API connection by checking balance
      const balance = await Balance.getBalance({ accountType: "CASH" });

      return {
        configured: true,
        environment: apiKey.includes("development")
          ? "development"
          : "production",
        api_key_prefix: apiKey.substring(0, 15) + "...",
        api_key_length: apiKey.length,
        client_initialized: !!this.xenditClient,
        validation: "API Key format is valid",
        balance: balance,
      };
    } catch (error: any) {
      throw new Error(`Xendit initialization failed: ${error.message}`);
    }
  }

  async testCreateInvoice(data: {
    amount: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  }) {
    // Reinitialize client with current env vars to ensure latest keys are used
    this.initializeXendit();

    const externalId = `TEST-ORDER-${Date.now()}`;

    const invoiceData = {
      externalId: externalId,
      amount: data.amount,
      payerEmail: data.customer_email,
      description: "Test invoice",
      customer: {
        givenNames: data.customer_name,
        email: data.customer_email,
        mobileNumber: data.customer_phone,
      },
      currency: "IDR",
      invoiceDuration: 86400,
    };

    try {
      const { Invoice } = this.xenditClient;
      const invoice = await Invoice.createInvoice({
        data: invoiceData,
      });

      return {
        external_id: externalId,
        invoice_id: invoice.id,
        invoice_url: invoice.invoiceUrl,
        message:
          "Test invoice created successfully. Use invoice_url for payment.",
      };
    } catch (error: any) {
      throw new Error(`Failed to create test invoice: ${error.message}`);
    }
  }
}

export default new PaymentService();
