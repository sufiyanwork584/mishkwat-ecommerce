import express from 'express';
import { processRefund, getAllRefunds, getRefund } from '../controllers/refundController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin-only refund routes
router.use(protect);
router.use(authorize('admin'));

router.post('/:orderId', processRefund);
router.get('/admin/all', getAllRefunds);
router.get('/:id', getRefund);

export default router;
