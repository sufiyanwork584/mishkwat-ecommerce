import express from 'express';
import { getUsers, getUser, blockUser, unblockUser, getAddresses, addAddress, updateAddress, deleteAddress, updateAvatar } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { addressSchema } from '../validators/authValidator.js';

const router = express.Router();

// User routes
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, validate(addressSchema), addAddress);
router.put('/addresses/:addressId', protect, validate(addressSchema), updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.post('/avatar', protect, uploadSingle, updateAvatar);

// Admin routes
router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUser);
router.patch('/:id/block', protect, authorize('admin'), blockUser);
router.patch('/:id/unblock', protect, authorize('admin'), unblockUser);

export default router;
