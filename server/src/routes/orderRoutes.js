import express from 'express';
import { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, cancelOrder, downloadInvoice } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createOrderSchema } from '../validators/generalValidator.js';

const router = express.Router();

router.post('/', protect, validate(createOrderSchema), createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.get('/:id/invoice', protect, downloadInvoice);

export default router;
