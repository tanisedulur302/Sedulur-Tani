import cloudinary from '../config/cloudinary';

interface UploadApiResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

/**
 * Upload gambar ke Cloudinary
 * @param file - File path atau base64 string
 * @param folder - Folder di Cloudinary (default: 'products')
 * @returns Promise dengan URL gambar yang ter-upload
 */
export const uploadImage = async (
  file: string,
  folder: string = 'products'
): Promise<UploadApiResponse> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `ecommerce_pupuk/${folder}`,
      resource_type: 'image',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
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
  const parts = imageUrl.split('/');
  const filename = parts[parts.length - 1];
  const publicId = filename.split('.')[0];
  
  // Include folder path if exists
  const folderIndex = parts.indexOf('ecommerce_pupuk');
  if (folderIndex !== -1) {
    const folderPath = parts.slice(folderIndex, parts.length - 1).join('/');
    return `${folderPath}/${publicId}`;
  }
  
  return publicId;
};
