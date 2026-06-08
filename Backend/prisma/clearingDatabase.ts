import process from "node:process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log("🗑️  Mulai menghapus semua data dari database...\n");

  try {
    // Hapus data dalam urutan yang benar untuk menghindari foreign key constraint errors
    
    console.log("⏳ Menghapus Payment Notifications...");
    const deletedPaymentNotifications = await prisma.paymentNotification.deleteMany();
    console.log(`✅ ${deletedPaymentNotifications.count} Payment Notifications dihapus\n`);

    console.log("⏳ Menghapus Payments...");
    const deletedPayments = await prisma.payment.deleteMany();
    console.log(`✅ ${deletedPayments.count} Payments dihapus\n`);

    console.log("⏳ Menghapus Shipments...");
    const deletedShipments = await prisma.shipment.deleteMany();
    console.log(`✅ ${deletedShipments.count} Shipments dihapus\n`);

    console.log("⏳ Menghapus Orders...");
    const deletedOrders = await prisma.order.deleteMany();
    console.log(`✅ ${deletedOrders.count} Orders dihapus\n`);

    console.log("⏳ Menghapus Checkouts...");
    const deletedCheckouts = await prisma.checkout.deleteMany();
    console.log(`✅ ${deletedCheckouts.count} Checkouts dihapus\n`);

    console.log("⏳ Menghapus Cart Items...");
    const deletedCartItems = await prisma.cartItem.deleteMany();
    console.log(`✅ ${deletedCartItems.count} Cart Items dihapus\n`);

    console.log("⏳ Menghapus Carts...");
    const deletedCarts = await prisma.cart.deleteMany();
    console.log(`✅ ${deletedCarts.count} Carts dihapus\n`);

    console.log("⏳ Menghapus Products...");
    const deletedProducts = await prisma.product.deleteMany();
    console.log(`✅ ${deletedProducts.count} Products dihapus\n`);

    console.log("⏳ Menghapus User Addresses...");
    const deletedAddresses = await prisma.userAddress.deleteMany();
    console.log(`✅ ${deletedAddresses.count} User Addresses dihapus\n`);

    console.log("⏳ Menghapus Categories...");
    const deletedCategories = await prisma.category.deleteMany();
    console.log(`✅ ${deletedCategories.count} Categories dihapus\n`);

    console.log("⏳ Menghapus Users...");
    const deletedUsers = await prisma.user.deleteMany();
    console.log(`✅ ${deletedUsers.count} Users dihapus\n`);

    console.log("🎉 Semua data berhasil dihapus dari database!\n");
    console.log("📊 Ringkasan:");
    console.log(`   - Payment Notifications: ${deletedPaymentNotifications.count}`);
    console.log(`   - Payments: ${deletedPayments.count}`);
    console.log(`   - Shipments: ${deletedShipments.count}`);
    console.log(`   - Orders: ${deletedOrders.count}`);
    console.log(`   - Checkouts: ${deletedCheckouts.count}`);
    console.log(`   - Cart Items: ${deletedCartItems.count}`);
    console.log(`   - Carts: ${deletedCarts.count}`);
    console.log(`   - Products: ${deletedProducts.count}`);
    console.log(`   - User Addresses: ${deletedAddresses.count}`);
    console.log(`   - Categories: ${deletedCategories.count}`);
    console.log(`   - Users: ${deletedUsers.count}`);
    console.log(`   ────────────────────────────────`);
    const total = 
      deletedPaymentNotifications.count +
      deletedPayments.count +
      deletedShipments.count +
      deletedOrders.count +
      deletedCheckouts.count +
      deletedCartItems.count +
      deletedCarts.count +
      deletedProducts.count +
      deletedAddresses.count +
      deletedCategories.count +
      deletedUsers.count;
    console.log(`   TOTAL: ${total} records dihapus\n`);

  } catch (error) {
    console.error("❌ Error saat menghapus data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan fungsi clear database
clearDatabase()
  .then(() => {
    console.log("✨ Database berhasil dikosongkan!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Gagal mengosongkan database:", error);
    process.exit(1);
  });