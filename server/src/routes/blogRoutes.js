import express from 'express';
import { 
  getBlogs, 
  getBlogBySlug, 
  createBlog, 
  updateBlog, 
  deleteBlog, 
  getAllBlogsAdmin, 
  duplicateBlog 
} from '../controllers/blogController.js';
import { 
  getCategories, 
  getAdminCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/blogCategoryController.js';
import { 
  getTags, 
  createTag, 
  updateTag, 
  deleteTag 
} from '../controllers/blogTagController.js';
import { 
  getBlogComments, 
  createComment, 
  getAllCommentsAdmin, 
  moderateComment, 
  deleteComment 
} from '../controllers/blogCommentController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ── PUBLIC BLOG ROUTES ──
router.get('/', getBlogs);
router.get('/categories', getCategories);
router.get('/tags', getTags);
router.get('/:slug', optionalAuth, getBlogBySlug);
router.get('/:id/comments', getBlogComments);

// ── CUSTOMER COMMENTING ROUTES ──
router.post('/:id/comments', protect, createComment);

// ── ADMINISTRATIVE BLOG CRUD ROUTES ──
router.get('/admin/all', protect, authorize('admin'), getAllBlogsAdmin);
router.post('/', protect, authorize('admin'), createBlog);
router.put('/:id', protect, authorize('admin'), updateBlog);
router.delete('/:id', protect, authorize('admin'), deleteBlog);
router.post('/:id/duplicate', protect, authorize('admin'), duplicateBlog);

// ── ADMINISTRATIVE CATEGORY CRUD ROUTES ──
router.get('/categories/admin', protect, authorize('admin'), getAdminCategories);
router.post('/categories', protect, authorize('admin'), uploadSingle, createCategory);
router.put('/categories/:id', protect, authorize('admin'), uploadSingle, updateCategory);
router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);

// ── ADMINISTRATIVE TAG CRUD ROUTES ──
router.post('/tags', protect, authorize('admin'), createTag);
router.put('/tags/:id', protect, authorize('admin'), updateTag);
router.delete('/tags/:id', protect, authorize('admin'), deleteTag);

// ── ADMINISTRATIVE COMMENT MODERATION ROUTES ──
router.get('/comments/admin', protect, authorize('admin'), getAllCommentsAdmin);
router.patch('/comments/:id/moderate', protect, authorize('admin'), moderateComment);
router.delete('/comments/:id', protect, authorize('admin'), deleteComment);

export default router;
