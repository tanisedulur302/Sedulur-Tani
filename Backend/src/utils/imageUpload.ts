import cloudinary from '../config/cloudinary';
import streamifier from 'streamifier';

interface UploadApiResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

/**
 * Upload image buffer ke Cloudinary
 * @param buffer - Buffer dari file image
 * @param folder - Folder di Cloudinary
 * @returns Promise dengan URL gambar yang ter-upload
 */
export const uploadImageBuffer = (
  buffer: Buffer,
  folder: string = 'products'
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `ecommerce_pupuk/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error: any, result: any) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('Upload failed without error'));
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Hapus gambar dari Cloudinary
 * @param publicId - Public ID dari gambar di Cloudinary
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Extract public ID dari Cloudinary URL
 * @param imageUrl - URL lengkap dari Cloudinary
 * @returns Public ID
 */
export const extractPublicId = (imageUrl: string): string => {
  try {
    const parts = imageUrl.split('/');
    const uploadIndex = parts.indexOf('upload');
    
    if (uploadIndex !== -1) {
      // Get everything after 'upload' and version (v1234567890)
      const relevantParts = parts.slice(uploadIndex + 2); // Skip 'upload' and version
      const fullPath = relevantParts.join('/');
      // Remove file extension
      return fullPath.substring(0, fullPath.lastIndexOf('.'));
    }
    
    // Fallback method
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    
    const folderIndex = parts.indexOf('ecommerce_pupuk');
    if (folderIndex !== -1) {
      const folderPath = parts.slice(folderIndex, parts.length - 1).join('/');
      return `${folderPath}/${publicId}`;
    }
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    throw new Error('Invalid Cloudinary URL');
  }
};
