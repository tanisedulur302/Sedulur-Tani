import { Request, Response } from "express";
import CategoryService from "../services/category.service";
import { successResponse } from "../utils/responseFormatter";
import { handleError } from "../utils/errorHandler";

class CategoryController {
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const categories = await CategoryService.getAll();
      return res.status(200).json(successResponse("Categories fetched successfully", { categories }));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const category = await CategoryService.getById(id);
      return res.status(200).json(successResponse("Category fetched successfully", { category }));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      // Handle both JSON and FormData (though we removed image upload, frontend might send json or formdata)
      // If frontend sends JSON, req.body has fields.
      const { name, slug, description } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: "Name is required" });
      }
      
      if (!slug) {
         return res.status(400).json({ success: false, message: "Slug is required" });
      }

      const category = await CategoryService.create({ name, slug, description });
      return res.status(201).json(successResponse("Category created successfully", { category }));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, slug, description } = req.body;

      const category = await CategoryService.update(id, { 
        name, 
        slug,
        description
      });
      
      return res.status(200).json(successResponse("Category updated successfully", { category }));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await CategoryService.delete(id);
      return res.status(200).json(successResponse("Category deleted successfully"));
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new CategoryController();
