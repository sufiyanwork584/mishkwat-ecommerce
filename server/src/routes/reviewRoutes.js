import express from 'express';
import { getProductReviews, createReview, deleteReview, getAllReviews, moderateReview } from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { reviewSchema } from '../validators/generalValidator.js';

const router = express.Router();

router.get('/admin/all', protect, authorize('admin'), getAllReviews);
router.patch('/admin/:id/moderate', protect, authorize('admin'), moderateReview);
router.get('/:productId', getProductReviews);
router.post('/:productId', protect, validate(reviewSchema), createReview);
router.delete('/:id', protect, deleteReview);

export default router;
