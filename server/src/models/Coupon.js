import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required'],
  },
  discountAmount: {
    type: Number,
    required: [true, 'Discount amount is required'],
    min: [0, 'Discount must be positive'],
  },
  minPurchase: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
    default: 0, // 0 means no limit
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  usageLimit: {
    type: Number,
    default: 0, // 0 means unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Note: code already has unique: true in the schema, which auto-creates its index
couponSchema.index({ isActive: 1, expiryDate: 1 });

// Virtual to check if expired
couponSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiryDate;
});

// Virtual to check if usage limit reached
couponSchema.virtual('isLimitReached').get(function () {
  return this.usageLimit > 0 && this.usedCount >= this.usageLimit;
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function (orderTotal) {
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (this.isExpired) return { valid: false, message: 'Coupon has expired' };
  if (this.isLimitReached) return { valid: false, message: 'Coupon usage limit reached' };
  if (orderTotal < this.minPurchase) {
    return { valid: false, message: `Minimum purchase amount is ₹${this.minPurchase}` };
  }
  return { valid: true, message: 'Coupon is valid' };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (orderTotal) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (orderTotal * this.discountAmount) / 100;
    if (this.maxDiscount > 0) {
      discount = Math.min(discount, this.maxDiscount);
    }
  } else {
    discount = this.discountAmount;
  }
  return Math.min(discount, orderTotal);
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
