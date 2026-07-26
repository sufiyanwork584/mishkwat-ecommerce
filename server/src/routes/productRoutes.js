import express from 'express';
import apicache from 'apicache';
import { getProducts, getProduct, getFeaturedProducts, getBestSellers, getNewArrivals, getRelatedProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadMultiple } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createProductSchema, updateProductSchema } from '../validators/productValidator.js';

const router = express.Router();

// Initialize cache: 5 minutes for product listings
const cache = apicache.middleware;
const cache5Minutes = cache('5 minutes', (req, res) => {
  // Only cache if successful and request is not authenticated (bypasses cache for admin panel & customer dashboards)
  return res.statusCode === 200 && !req.headers.authorization;
});

// Public, read-only routes are cached for 5 minutes to handle massive traffic spikes
router.get('/', cache5Minutes, getProducts);
router.get('/featured', cache5Minutes, getFeaturedProducts);
router.get('/bestsellers', cache5Minutes, getBestSellers);
router.get('/new-arrivals', cache5Minutes, getNewArrivals);
router.get('/:slug', cache5Minutes, getProduct);
router.get('/:id/related', cache5Minutes, getRelatedProducts);

// Admin-only, protected routes (not cached, cache cleared in controller after mutation)
router.post('/', protect, authorize('admin'), uploadMultiple, validate(createProductSchema), createProduct);
router.put('/:id', protect, authorize('admin'), uploadMultiple, validate(updateProductSchema), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
