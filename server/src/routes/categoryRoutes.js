import express from 'express';
import { getCategories, getCategory, getAdminCategories, createCategory, updateCategory, deleteCategory, getAllCategoriesFlat } from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { categorySchema } from '../validators/generalValidator.js';

const router = express.Router();

// Public read-only endpoints (no caching to prevent admin sync issues)
router.get('/', getCategories);
router.get('/all', getAllCategoriesFlat);

// Admin read endpoint — returns ALL categories (including inactive)
router.get('/admin', protect, authorize('admin'), getAdminCategories);

router.get('/:slug', getCategory);

// Protected admin endpoints
router.post('/', protect, authorize('admin'), uploadSingle, validate(categorySchema), createCategory);
router.put('/:id', protect, authorize('admin'), uploadSingle, validate(categorySchema), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
