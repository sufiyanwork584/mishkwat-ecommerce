import express from 'express';
import { getDeals, createDeal, updateDeal, deleteDeal } from '../controllers/dealController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

const uploadFields = upload.fields([
  { name: 'backgroundImage', maxCount: 1 },
  { name: 'productImage', maxCount: 1 }
]);

router.get('/', getDeals);
router.post('/', protect, authorize('admin'), uploadFields, createDeal);
router.put('/:id', protect, authorize('admin'), uploadFields, updateDeal);
router.delete('/:id', protect, authorize('admin'), deleteDeal);

export default router;
