import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📦 Start seeding orders...");

  // 1. Get Buyer (Pastikan sudah menjalankan seed utama)
  const buyer = await prisma.user.findFirst({
    where: { role: "buyer" },
  });

  if (!buyer) {
    console.error(
      "❌ No buyer found. Please run 'npm run seed' first to create users."
    );
    return;
  }

  // 2. Get Products
  const products = await prisma.product.findMany();
  if (products.length === 0) {
    console.error(
      "❌ No products found. Please run 'npm run seed' first to create products."
    );
    return;
  }

  console.log(`Found Buyer: ${buyer.name}`);
  console.log(`Found ${products.length} Products`);

  // 3. Create Random Orders
  const TOTAL_CHECKOUTS = 15;
  const CHECKOUT_STATUSES = ["pending", "paid", "expired"];
  const ORDER_STATUSES = [
    "pending",
    "processed",
    "shipped",
    "completed",
    "cancelled",
  ];
  const SHIPMENT_STATUSES = ["packing", "shipping", "delivered"];

  for (let i = 0; i < TOTAL_CHECKOUTS; i++) {
    // A. Select 1-3 random products for this checkout
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = [];
    for (let j = 0; j < itemCount; j++) {
      selectedProducts.push(
        products[Math.floor(Math.random() * products.length)]
      );
    }

    // B. Calculate totals
    let subtotal = 0;
    const orderItemsData = selectedProducts.map((product) => {
      const qty = Math.floor(Math.random() * 5) + 1;
      subtotal += product.price * qty;
      return { product, qty };
    });

    const shippingCost = Math.floor(Math.random() * 5) * 10000 + 10000; // 10k, 20k, etc.
    const grandTotal = subtotal + shippingCost;

    // C. Determine status logic (Consistency)
    // Randomly pick a checkout status
    const checkoutStatus =
      CHECKOUT_STATUSES[Math.floor(Math.random() * CHECKOUT_STATUSES.length)];

    let orderStatus = "pending";
    let shipmentStatus = "packing";
    let paymentStatus = "pending";
    let paymentType = null;
    let transactionTime = null;

    // Random date in the last 30 days
    const createdDate = new Date(
      Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
    );

    if (checkoutStatus === "paid") {
      // If paid, order can be processed, shipped, or completed (rarely cancelled)
      // We exclude 'pending' for orders if checkout is paid to make it realistic
      const validOrderStatuses = ["processed", "shipped", "completed"];
      orderStatus =
        validOrderStatuses[
          Math.floor(Math.random() * validOrderStatuses.length)
        ];

      paymentStatus = "settlement";
      paymentType = "bank_transfer";
      transactionTime = createdDate;

      if (orderStatus === "shipped" || orderStatus === "completed") {
        shipmentStatus =
          SHIPMENT_STATUSES[
            Math.floor(Math.random() * SHIPMENT_STATUSES.length)
          ];
      }
    } else if (checkoutStatus === "expired") {
      orderStatus = "cancelled";
      paymentStatus = "expire";
      paymentType = "bank_transfer";
    } else {
      // Pending
      orderStatus = "pending";
      paymentStatus = "pending";
    }

    // D. Create Checkout
    const checkout = await prisma.checkout.create({
      data: {
        user_id: buyer.id,
        total_price: subtotal,
        shipping_price: shippingCost,
        grand_total: grandTotal,
        status: checkoutStatus as any,
        created_at: createdDate,
        updated_at: createdDate,
      },
    });

    // E. Create Payment Record
    await prisma.payment.create({
      data: {
        checkout_id: checkout.id,
        xendit_invoice_id: `ORDER-${checkout.id}-${Math.floor(
          Math.random() * 99999
        )}`,
        transaction_id: `TRX-${checkout.id}-${Date.now()}-${Math.floor(
          Math.random() * 1000
        )}`,
        gross_amount: grandTotal,
        transaction_status: paymentStatus,
        payment_method: paymentType,
        transaction_time: transactionTime,
        created_at: createdDate,
        updated_at: createdDate,
      },
    });

    // F. Create Orders (Items)
    for (const item of orderItemsData) {
      const order = await prisma.order.create({
        data: {
          checkout_id: checkout.id,
          user_id: buyer.id,
          product_id: item.product.id,
          quantity: item.qty,
          price_each: item.product.price,
          total_price: item.product.price * item.qty,
          status: orderStatus as any,
          created_at: createdDate,
          updated_at: createdDate,
        },
      });

      // G. Create Shipment (only if processed/shipped/completed)
      if (["processed", "shipped", "completed"].includes(orderStatus)) {
        // Logic: if processed, maybe tracking number is null? let's assume tracking exists for simplicity or based on status
        const hasTracking = orderStatus !== "processed"; // Only shipped/completed have tracking

        await prisma.shipment.create({
          data: {
            order_id: order.id,
            courier_name: ["JNE", "J&T", "SiCepat", "Pos Indonesia"][
              Math.floor(Math.random() * 4)
            ],
            tracking_number: hasTracking
              ? `JP${Math.floor(Math.random() * 10000000000)}`
              : null,
            status: shipmentStatus as any,
            created_at: createdDate,
            updated_at: createdDate,
          },
        });
      }
    }
  }

  console.log(
    `✅ Successfully created ${TOTAL_CHECKOUTS} checkouts with related orders, payments, and shipments.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
