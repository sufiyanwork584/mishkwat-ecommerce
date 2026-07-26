import Coupon from '../models/Coupon.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data: { coupons } });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, message: 'Coupon created', data: { coupon } });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) throw new AppError('Coupon not found', 404);
  res.json({ success: true, message: 'Coupon updated', data: { coupon } });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new AppError('Coupon not found', 404);
  res.json({ success: true, message: 'Coupon deleted' });
});

export const toggleCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new AppError('Coupon not found', 404);
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  res.json({ success: true, message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`, data: { coupon } });
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) throw new AppError('Invalid coupon code', 404);

  const validity = coupon.isValid(orderTotal || 0);
  if (!validity.valid) throw new AppError(validity.message, 400);

  const discount = coupon.calculateDiscount(orderTotal || 0);
  res.json({ success: true, data: { coupon: { code: coupon.code, discountType: coupon.discountType, discountAmount: coupon.discountAmount }, discount } });
});

export const getBestCoupon = asyncHandler(async (req, res) => {
  const orderTotal = parseFloat(req.query.orderTotal) || 0;
  
  // Find all active coupons
  const coupons = await Coupon.find({ isActive: true });
  
  let bestCoupon = null;
  let maxDiscount = 0;

  for (const coupon of coupons) {
    const validity = coupon.isValid(orderTotal);
    if (validity.valid) {
      const discount = coupon.calculateDiscount(orderTotal);
      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestCoupon = coupon;
      }
    }
  }

  if (bestCoupon) {
    res.json({ 
      success: true, 
      data: { 
        coupon: { 
          code: bestCoupon.code, 
          discountType: bestCoupon.discountType, 
          discountAmount: bestCoupon.discountAmount 
        }, 
        discount: maxDiscount 
      } 
    });
  } else {
    res.json({ success: true, data: { coupon: null, discount: 0 } });
  }
});
