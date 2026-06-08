import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ProductRow {
  category: string;
  name: string;
  price_idr: string | number;
  weight_grams: string | number;
  stock: string | number;
  description: string;
}

interface CategoryMapping {
  [key: string]: string; // category name -> category id
}

function parseCsv(content: string): ProductRow[] {
  const lines = content.split("\n").map((line) => line.trim());
  const headers = lines[0]
    .split(",")
    .map((h) => h.toLowerCase().trim());

  // Map dari kategori CSV ke kategori database
  const categoryMap: Record<string, string> = {
    insektisida: "Insektisida",
    fungisida: "Fungisida",
    herbisida: "Herbisida",
    "pupuk daun": "Pupuk Daun",
    pupuk: "Pupuk",
    alat: "Alat",
  };

  const rows: ProductRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;

    // Simple CSV parsing (handles quoted fields)
    const values = lines[i]
      .split(",")
      .map((v) => v.replace(/^"|"$/g, "").trim());

    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = values[idx] || "";
    });

    if (record["name"]) {
      const csvCategory = (record["category"] || "").toLowerCase().trim();
      const mappedCategory = categoryMap[csvCategory] || record["category"];

      rows.push({
        category: mappedCategory,
        name: record["name"] || "",
        price_idr: record["price_idr"] || "0",
        weight_grams: record["weight_grams"] || "0",
        stock: record["stock"] || "0",
        description: record["description"] || "",
      });
    }
  }

  return rows;
}

async function seedProductsFromCsv() {
  console.log("🌱 Start seeding products from CSV...\n");

  try {
    // Delete all related data first (cart items, checkouts, orders, etc.)
    console.log("🗑️  Deleting related data...");
    await prisma.paymentNotification.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.shipment.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.checkout.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    console.log("✅ Deleted checkouts, orders, carts, and shipments\n");

    // Delete all existing products
    console.log("🗑️  Deleting existing products...");
    await prisma.product.deleteMany({});
    console.log("✅ Existing products deleted\n");

    // Read CSV file - resolve from project root
    const csvPath = path.join(__dirname, "../../itemData/Pendataan-Produk.cleaned.csv");
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const records = parseCsv(csvContent);

    console.log(`📄 Loaded ${records.length} products from CSV\n`);

    // Get first seller
    console.log("👤 Fetching seller...");
    const seller = await prisma.user.findFirst({
      where: { role: "seller" },
      select: { id: true, name: true },
    });

    if (!seller) {
      throw new Error("No sellers found. Please run seed.ts first to create sellers.");
    }
    console.log(`✅ Using seller: ${seller.name}\n`);

    // Category ID mapping
    const categoryIdMap: CategoryMapping = {
        "Insektisida": "693d252093cde1dc31484b90",
    "Fungisida": "693d252093cde1dc31484b91",
    "Herbisida": "693d252093cde1dc31484b92",
    "Pupuk Daun": "693d252093cde1dc31484b93",
    "Pupuk": "693d252093cde1dc31484b94",
    "Alat": "693d252093cde1dc31484b95",
    };
    console.log("📂 Category ID mappings loaded\n");

    // Group products by category
    const byCategory = new Map<string, ProductRow[]>();
    for (const record of records) {
      if (!byCategory.has(record.category)) {
        byCategory.set(record.category, []);
      }
      byCategory.get(record.category)!.push(record);
    }

    // Seed products using single seller
    let productCount = 0;

    for (const [category, products] of byCategory) {
      console.log(`📦 Seeding ${products.length} products in category: ${category}`);

      const categoryId = categoryIdMap[category];
      if (!categoryId) {
        console.warn(`⚠️  Category "${category}" not found in mapping, skipping...`);
        continue;
      }

      for (const product of products) {
        await prisma.product.create({
          data: {
            seller_id: seller.id,
            name: product.name,
            description: product.description,
            category: categoryId,
            weight: parseInt(String(product.weight_grams), 10),
            price: parseFloat(String(product.price_idr)),
            stock: parseInt(String(product.stock), 10),
            image_url: null, // Empty for now, to be added later
          },
        });

        productCount++;
      }

      console.log(`✅ ${products.length} products added\n`);
    }

    console.log(`\n🎉 Seeding complete! Total products: ${productCount}`);
  } catch (error) {
    console.error("❌ Error seeding products from CSV:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProductsFromCsv()
  .then(() => {
    console.log("✨ Products seeded successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed to seed products:", error);
    process.exit(1);
  });
