import multer from 'multer';
import path from 'path';

// Konfigurasi Multer untuk menyimpan file di memory
const storage = multer.memoryStorage();

// Filter file - hanya accept image
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept image files only
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Konfigurasi upload
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

// Middleware untuk single file upload dengan error handling
export const uploadSingle = (req: any, res: any, next: any) => {
  upload.single('image')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 5MB limit'
        });
      }
      if (err.message === 'Field name missing') {
        return res.status(400).json({
          success: false,
          message: 'Please provide an image file with field name "image"'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

// Middleware untuk multiple files upload dengan error handling
export const uploadMultiple = (req: any, res: any, next: any) => {
  upload.array('images', 5)(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 5MB limit'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Maximum 5 images allowed'
        });
      }
      if (err.message === 'Field name missing') {
        return res.status(400).json({
          success: false,
          message: 'Please provide image files with field name "images"'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};
