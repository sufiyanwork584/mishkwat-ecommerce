import express from 'express';
import { getBanners, createBanner, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getBanners);
router.post('/', protect, authorize('admin'), uploadSingle, createBanner);
router.put('/:id', protect, authorize('admin'), uploadSingle, updateBanner);
router.delete('/:id', protect, authorize('admin'), deleteBanner);

export default router;
