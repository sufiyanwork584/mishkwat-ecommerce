import express from 'express';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCoupon, validateCoupon, getBestCoupon } from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { couponSchema } from '../validators/generalValidator.js';

const router = express.Router();

router.post('/validate', protect, validateCoupon);
router.get('/best', protect, getBestCoupon);
router.get('/', protect, authorize('admin'), getCoupons);
router.post('/', protect, authorize('admin'), validate(couponSchema), createCoupon);
router.put('/:id', protect, authorize('admin'), validate(couponSchema), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);
router.patch('/:id/toggle', protect, authorize('admin'), toggleCoupon);

export default router;
