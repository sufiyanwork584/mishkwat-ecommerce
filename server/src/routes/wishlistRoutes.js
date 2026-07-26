import express from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, moveToCart } from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.delete('/item/:productId', removeFromWishlist);
router.post('/move-to-cart', moveToCart);

export default router;
