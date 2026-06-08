import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GANTI dengan ObjectId seller yang valid
const SELLER_ID = "PUT_YOUR_SELLER_OBJECT_ID_HERE";

export const productSeeder = async () => {
  const products = [
    {
      name: "Demolis 200",
      description: "Insektisida Demolis kemasan 200 ml",
      category: "Insektisida",
      weight: 250,
      price: 85000,
      stock: 50,
    },
    {
      name: "Decis 100",
      description: "Insektisida Decis 100 ml",
      category: "Insektisida",
      weight: 120,
      price: 35000,
      stock: 100,
    },
    {
      name: "Antracol 500",
      description: "Fungisida Antracol 500 gr",
      category: "Fungisida",
      weight: 500,
      price: 85000,
      stock: 40,
    },
    {
      name: "Roundup",
      description: "Herbisida Roundup pembasmi gulma",
      category: "Herbisida",
      weight: 1000,
      price: 90000,
      stock: 30,
    },
    {
      name: "Gandasil D 500",
      description: "Pupuk daun Gandasil D 500 gr",
      category: "Pupuk Daun",
      weight: 500,
      price: 50000,
      stock: 60,
    },
    {
      name: "NPK Mutiara",
      description: "Pupuk NPK Mutiara 50 kg",
      category: "Pupuk",
      weight: 50000,
      price: 780000,
      stock: 20,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        seller_id: SELLER_ID,
        name: product.name,
        description: product.description,
        category: product.category,
        weight: product.weight,
        price: product.price,
        stock: product.stock,
        image_url: null,
      },
    });
  }

  console.log("✅ Products seeded");
};


productSeeder()  .then(async () => {
    await prisma.$disconnect();
    console.log("✨ Seeder produk selesai");
  })
  .catch(async (error) => {
    console.error("❌ Seeder produk gagal:", error);
    await prisma.$disconnect();
    process.exit(1);
  });