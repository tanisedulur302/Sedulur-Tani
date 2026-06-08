import { Request, Response } from "express";
import { CreateProductDTO, UpdateProductDTO } from "../types/product.types";
import ProductService from "../services/Product.service";
import ProductValidator from "../validators/ProductValidator";
import { successResponse } from "../utils/responseFormatter";
import { handleError } from "../utils/errorHandler";
import { uploadImageBuffer } from "../utils/imageUpload";

class ProductController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      console.log("Create Product Request:");
      console.log("Body:", req.body);
      console.log("File:", req.file);

      // Parse numbers from string inputs (multipart/form-data sends strings)
      const rawBody = req.body;
      const productData: CreateProductDTO = {
        ...rawBody,
        price: rawBody.price ? parseFloat(rawBody.price) : undefined,
        weight: rawBody.weight ? parseFloat(rawBody.weight) : undefined,
        stock: rawBody.stock ? parseInt(rawBody.stock) : undefined,
      };
      
      // Remove 'image' field if it exists in rawBody as it's not in the schema
      delete (productData as any).image;

      // Handle image upload if exists
      if (req.file) {
        try {
          const uploadResult = await uploadImageBuffer(req.file.buffer, 'products');
          productData.image_url = uploadResult.secure_url;
        } catch (error: any) {
          console.error("Cloudinary upload error:", error);
          return res.status(400).json({
            success: false,
            message: `Failed to upload image: ${error.message || "Unknown error"}`
          });
        }
      }

      ProductValidator.validateCreateProduct(productData);

      const product = await ProductService.createProduct(userId, productData);

      return res.status(201).json(
        successResponse("Product created successfully", { product })
      );
    } catch (error) {
      return handleError(res, error);
    }
  }


  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { seller_id, search, category, min_price, max_price, in_stock, page, limit } = req.query;

      const filters = {
        seller_id: seller_id as string | undefined,
        search: search as string | undefined,
        category: category as string | undefined,
        min_price: min_price ? parseFloat(min_price as string) : undefined,
        max_price: max_price ? parseFloat(max_price as string) : undefined,
        in_stock: in_stock === 'true'
      };

      const pagination = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 12
      };

      const result = await ProductService.getAllProducts(filters, pagination);

      return res.status(200).json(
        successResponse("Products retrieved successfully", result)
      );
    } catch (error) {
      return handleError(res, error);
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required"
        });
      }

      const product = await ProductService.getProductById(id);

      return res.status(200).json(
        successResponse("Product retrieved successfully", { product })
      );
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      console.log("Update Product Request:");
      console.log("ID:", id);
      console.log("Body:", req.body);
      console.log("File:", req.file);

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required"
        });
      }

      // Parse numbers from string inputs
      const rawBody = req.body;
      const updateData: UpdateProductDTO = {
        ...rawBody,
        price: rawBody.price ? parseFloat(rawBody.price) : undefined,
        weight: rawBody.weight ? parseFloat(rawBody.weight) : undefined,
        stock: rawBody.stock ? parseInt(rawBody.stock) : undefined,
      };

      // Remove 'image' field if it exists in rawBody as it's not in the schema
      delete (updateData as any).image;

      // Handle image upload if exists
      if (req.file) {
        try {
          const uploadResult = await uploadImageBuffer(req.file.buffer, 'products');
          updateData.image_url = uploadResult.secure_url;
        } catch (error: any) {
          console.error("Cloudinary upload error:", error);
          return res.status(400).json({
            success: false,
            message: `Failed to upload image: ${error.message || "Unknown error"}`
          });
        }
      }

      ProductValidator.validateUpdateProduct(updateData);

      await ProductService.validateProductOwnership(id, userId, userRole);

      const updatedProduct = await ProductService.updateProduct(id, updateData);

      return res.status(200).json(
        successResponse("Product updated successfully", { product: updatedProduct })
      );
    } catch (error) {
      return handleError(res, error);
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required"
        });
      }

      await ProductService.validateProductOwnership(id, userId, userRole);
      await ProductService.deleteProduct(id);

      return res.status(200).json(
        successResponse("Product deleted successfully")
      );
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new ProductController();
