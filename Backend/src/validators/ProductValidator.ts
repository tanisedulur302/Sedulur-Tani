import { CreateProductDTO, UpdateProductDTO } from "../types/product.types";

class ProductValidator {
  validateCreateProduct(data: CreateProductDTO) {
    const errors: string[] = [];

    if (!data.name) {
      errors.push("Name is required");
    }

    if (!data.description) {
      errors.push("Description is required");
    }

    if (data.weight === undefined) {
      errors.push("Weight is required");
    }

    if (data.price === undefined) {
      errors.push("Price is required");
    }

    if (data.stock === undefined) {
      errors.push("Stock is required");
    }

    if (data.weight !== undefined && data.weight <= 0) {
      errors.push("Weight must be greater than 0");
    }

    if (data.price !== undefined && data.price <= 0) {
      errors.push("Price must be greater than 0");
    }

    if (data.stock !== undefined && data.stock < 0) {
      errors.push("Stock cannot be negative");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }
  }

  validateUpdateProduct(data: UpdateProductDTO) {
    const errors: string[] = [];

    if (!data.name && !data.description && data.weight === undefined && 
        data.price === undefined && data.stock === undefined && data.image_url === undefined) {
      errors.push("At least one field must be provided for update");
    }

    if (data.weight !== undefined && data.weight <= 0) {
      errors.push("Weight must be greater than 0");
    }

    if (data.price !== undefined && data.price <= 0) {
      errors.push("Price must be greater than 0");
    }

    if (data.stock !== undefined && data.stock < 0) {
      errors.push("Stock cannot be negative");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }
  }
}

export default new ProductValidator();
