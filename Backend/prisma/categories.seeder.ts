import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const categorySeeder = async () => {
  const categories = [
    {
      name: "Insektisida",
      slug: "insektisida",
      description: "Produk pembasmi hama serangga",
    },
    {
      name: "Fungisida",
      slug: "fungisida",
      description: "Produk pembasmi jamur tanaman",
    },
    {
      name: "Herbisida",
      slug: "herbisida",
      description: "Produk pembasmi gulma",
    },
    {
      name: "Pupuk Daun",
      slug: "pupuk-daun",
      description: "Pupuk cair untuk daun",
    },
    {
      name: "Pupuk",
      slug: "pupuk",
      description: "Pupuk padat dan kimia",
    },
    {
      name: "Alat",
      slug: "alat",
      description: "Alat pertanian",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log("✅ Categories seeded");
};

// Jalankan seeder secara langsung jika file ini dieksekusi
categorySeeder()
  .then(async () => {
    await prisma.$disconnect();
    console.log("✨ Seeder kategori selesai");
  })
  .catch(async (error) => {
    console.error("❌ Seeder kategori gagal:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
