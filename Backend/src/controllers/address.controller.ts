import { Request, Response } from "express";
import AddressService from "../services/address.service";
import { CreateAddressDTO, UpdateAddressDTO, ApiResponse, AddressResponse } from "../types/address.types";

class AddressController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      const data: CreateAddressDTO = req.body;
      const address = await AddressService.createAddress(userId, data);

      const response: ApiResponse<{ address: AddressResponse }> = {
        success: true,
        message: "Address created successfully",
        data: { address }
      };

      return res.status(201).json(response);
    } catch (error: any) {
      console.error("Create address error:", error);
      return res.status(error.message.includes("required") ? 400 : 500).json({
        success: false,
        message: error.message || "Internal server error"
      });
    }
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      const addresses = await AddressService.getAllAddresses(userId);

      const response: ApiResponse<{ addresses: AddressResponse[] }> = {
        success: true,
        message: "Addresses retrieved successfully",
        data: { addresses }
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error("Get all addresses error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Address ID is required"
        });
      }

      const address = await AddressService.getAddressById(id, userId);

      const response: ApiResponse<{ address: AddressResponse }> = {
        success: true,
        message: "Address retrieved successfully",
        data: { address }
      };

      return res.status(200).json(response);
    } catch (error: any) {
      console.error("Get address by ID error:", error);
      
      const statusCode = error.message === "Address not found" ? 404 :
                         error.message.includes("Forbidden") ? 403 : 500;

      return res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error"
      });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Address ID is required"
        });
      }

      const data: UpdateAddressDTO = req.body;
      const updatedAddress = await AddressService.updateAddress(id, userId, data);

      const response: ApiResponse<{ address: AddressResponse }> = {
        success: true,
        message: "Address updated successfully",
        data: { address: updatedAddress }
      };

      return res.status(200).json(response);
    } catch (error: any) {
      console.error("Update address error:", error);
      
      const statusCode = error.message === "Address not found" ? 404 :
                         error.message.includes("Forbidden") ? 403 :
                         error.message.includes("At least one field") ? 400 : 500;

      return res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error"
      });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Address ID is required"
        });
      }

      await AddressService.deleteAddress(id, userId);

      const response: ApiResponse<null> = {
        success: true,
        message: "Address deleted successfully"
      };

      return res.status(200).json(response);
    } catch (error: any) {
      console.error("Delete address error:", error);
      
      const statusCode = error.message === "Address not found" ? 404 :
                         error.message.includes("Forbidden") ? 403 : 500;

      return res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error"
      });
    }
  }
}

export default new AddressController();
