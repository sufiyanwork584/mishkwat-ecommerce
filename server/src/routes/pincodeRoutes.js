import express from 'express';
import { lookupPincode } from '../controllers/pincodeController.js';

const router = express.Router();

// Public endpoint — no auth required
router.get('/:code', lookupPincode);

export default router;
