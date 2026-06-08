import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding sellers...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.paymentNotification.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.shipment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.checkout.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.userAddress.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("✅ Old data cleared");

  // Create seller users
  const password = await bcrypt.hash("password123", 10);

  console.log("👤 Creating sellers...");
  const seller1 = await prisma.user.create({
    data: {
      email: "seller1@example.com",
      password_hash: password,
      name: "Toko Pupuk Tani Jaya",
      phone: "081234567890",
      role: "seller",
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: "seller2@example.com",
      password_hash: password,
      name: "Agro Pupuk Nusantara",
      phone: "081234567891",
      role: "seller",
    },
  });

  const seller3 = await prisma.user.create({
    data: {
      email: "seller3@example.com",
      password_hash: password,
      name: "Pupuk Organik Indonesia",
      phone: "081234567892",
      role: "seller",
    },
  });

  console.log("✅ 3 sellers created");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
