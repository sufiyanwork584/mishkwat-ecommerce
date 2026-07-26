import express from 'express';
import { getDashboardStats, getSalesChart, getTopProducts, getTopCategories } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/sales-chart', getSalesChart);
router.get('/top-products', getTopProducts);
router.get('/top-categories', getTopCategories);

export default router;
