import express from 'express';
import { requestReturn, approveReturn, getAllReturns, markReturned } from '../controllers/returnController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer routes
router.post('/:orderId', protect, requestReturn);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllReturns);
router.patch('/:orderId/approve', protect, authorize('admin'), approveReturn);
router.patch('/:orderId/returned', protect, authorize('admin'), markReturned);

export default router;
