import express, { Router } from 'express';
import CloudinaryTestController from '../controllers/cloudinary.controller';
import multer from 'multer';

const router: Router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Test Cloudinary configuration
router.get('/test-config', CloudinaryTestController.testConfig);

// Test file upload to Cloudinary
router.post('/test-upload', upload.single('image'), CloudinaryTestController.testUpload);

export default router;
