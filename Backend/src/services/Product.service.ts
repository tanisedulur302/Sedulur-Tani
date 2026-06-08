import prisma from "../database/prisma";
import { CreateProductDTO, UpdateProductDTO } from "../types/product.types";

class ProductService {
  async createProduct(userId: string, data: CreateProductDTO) {
    const productData: any = {
      seller_id: userId,
      name: data.name,
      description: data.description,
      weight: data.weight,
      price: data.price,
      stock: data.stock,
    };

    if (data.category) productData.category = data.category;
    if (data.image_url) productData.image_url = data.image_url;

    return await prisma.product.create({
      data: productData
    });
  }

  async getAllProducts(
    filters: {
      seller_id?: string;
      search?: string;
      category?: string;
      min_price?: number;
      max_price?: number;
      in_stock?: boolean;
    },
    pagination?: {
      page: number;
      limit: number;
    }
  ) {
    const where: any = {};

    if (filters.seller_id) {
      where.seller_id = filters.seller_id;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.category) {
      where.category = { contains: filters.category, mode: 'insensitive' };
    }

    if (filters.min_price || filters.max_price) {
      where.price = {};
      if (filters.min_price) where.price.gte = filters.min_price;
      if (filters.max_price) where.price.lte = filters.max_price;
    }

    if (filters.in_stock) {
      where.stock = { gt: 0 };
    }

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Calculate pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 12;
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limit
    });

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  async getProductById(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  async validateProductOwnership(productId: string, userId: string, userRole?: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Seller (yang juga admin) bisa mengelola semua produk
    if (userRole === "seller") {
      return product;
    }

    if (product.seller_id !== userId) {
      throw new Error("Forbidden: You can only update your own products");
    }

    return product;
  }

  async updateProduct(productId: string, data: UpdateProductDTO) {
    return await prisma.product.update({
      where: { id: productId },
      data,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async deleteProduct(productId: string) {
    await prisma.product.delete({
      where: { id: productId }
    });
  }
}

export default new ProductService();
