import Joi from 'joi';

export const categorySchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().max(500).allow('').optional(),
  parent: Joi.string().allow(null, '', 'null').optional(),
  isActive: Joi.boolean().default(true),
});

export const couponSchema = Joi.object({
  code: Joi.string().uppercase().trim().required(),
  discountType: Joi.string().valid('percentage', 'fixed').required(),
  discountAmount: Joi.number().min(0).required(),
  minPurchase: Joi.number().min(0).default(0),
  maxDiscount: Joi.number().min(0).default(0),
  expiryDate: Joi.date().greater('now').required(),
  usageLimit: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
});

export const reviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().trim().max(100).allow('').optional(),
  comment: Joi.string().max(1000).required(),
});

export const createOrderSchema = Joi.object({
  shippingAddressId: Joi.string().required(),
  paymentMethod: Joi.string().valid('razorpay', 'cod').default('razorpay'),
  couponCode: Joi.string().uppercase().trim().allow('').optional(),
});
