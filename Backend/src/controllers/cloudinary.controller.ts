import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';

class CloudinaryTestController {
  static async testConfig(req: Request, res: Response) {
    try {
      // Test connection by getting account details
      const result = await cloudinary.api.ping();
      
      return res.status(200).json({
        success: true,
        message: 'Cloudinary configuration is working correctly',
        data: {
          status: result.status,
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary configuration failed',
        error: error.message || 'Unknown error occurred'
      });
    }
  }

  static async testUpload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please upload an image file.'
        });
      }

      // Upload test image to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'test',
            resource_type: 'auto'
          },
          (error: any, result: any) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file!.buffer);
      });

      return res.status(200).json({
        success: true,
        message: 'File uploaded successfully to Cloudinary',
        data: result
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Upload failed',
        error: error.message || 'Unknown error occurred'
      });
    }
  }
}

export default CloudinaryTestController;
