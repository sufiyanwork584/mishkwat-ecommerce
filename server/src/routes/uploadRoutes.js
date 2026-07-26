import express from 'express';
import { uploadSingleImage, deleteCloudinaryImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Allow any authenticated user to upload images
router.post('/', protect, uploadSingle, uploadSingleImage);
router.delete('/:publicId(*)', protect, deleteCloudinaryImage);

export default router;
