import prisma from "../database/prisma";

interface CreateCategoryDTO {
  name: string;
  slug: string;
  description?: string;
}

interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  description?: string;
}

class CategoryService {
  async getAll() {
    return await prisma.category.findMany({
      orderBy: { created_at: "desc" },
    });
  }

  async getById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) throw new Error("Category not found");

    return category;
  }

  async create(data: CreateCategoryDTO) {
    // Check if exists
    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existing) throw new Error("Category with this name already exists");

    const existingSlug = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) throw new Error("Category with this slug already exists");

    return await prisma.category.create({
      data,
    });
  }

  async update(id: string, data: UpdateCategoryDTO) {
    // Check exists
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) throw new Error("Category not found");

    // Check name conflict if changing name
    if (data.name && data.name !== category.name) {
      const existing = await prisma.category.findUnique({
        where: { name: data.name },
      });
      if (existing) throw new Error("Category name already taken");
    }

    // Check slug conflict
    if (data.slug && data.slug !== category.slug) {
      const existingSlug = await prisma.category.findUnique({
        where: { slug: data.slug },
      });
      if (existingSlug) throw new Error("Category slug already taken");
    }

    return await prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    // Check exists
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) throw new Error("Category not found");

    return await prisma.category.delete({
      where: { id },
    });
  }
}

export default new CategoryService();
