import {
  categorySchema,
  couponSchema,
  reviewSchema,
  createOrderSchema,
} from '../src/validators/generalValidator.js';

describe('General Validators – generalValidator.js', () => {
  // ─────────────── categorySchema ───────────────
  describe('categorySchema', () => {
    it('should pass with required name', () => {
      const { error, value } = categorySchema.validate({ name: 'Electronics' });
      expect(error).toBeUndefined();
      expect(value.isActive).toBe(true);
    });

    it('should fail without name', () => {
      const { error } = categorySchema.validate({});
      expect(error).toBeDefined();
    });

    it('should fail when name exceeds 100 chars', () => {
      const { error } = categorySchema.validate({ name: 'X'.repeat(101) });
      expect(error).toBeDefined();
    });

    it('should allow optional description', () => {
      const { error } = categorySchema.validate({ name: 'Books', description: 'All books here' });
      expect(error).toBeUndefined();
    });

    it('should allow empty description', () => {
      const { error } = categorySchema.validate({ name: 'Books', description: '' });
      expect(error).toBeUndefined();
    });

    it('should fail when description exceeds 500 chars', () => {
      const { error } = categorySchema.validate({ name: 'Books', description: 'X'.repeat(501) });
      expect(error).toBeDefined();
    });

    it('should allow parent to be null or empty', () => {
      const r1 = categorySchema.validate({ name: 'Sub', parent: null });
      expect(r1.error).toBeUndefined();
      const r2 = categorySchema.validate({ name: 'Sub', parent: '' });
      expect(r2.error).toBeUndefined();
    });
  });

  // ─────────────── couponSchema ───────────────
  describe('couponSchema', () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString(); // tomorrow
    const validCoupon = {
      code: 'SAVE20',
      discountType: 'percentage',
      discountAmount: 20,
      expiryDate: futureDate,
    };

    it('should pass with valid coupon data', () => {
      const { error, value } = couponSchema.validate(validCoupon);
      expect(error).toBeUndefined();
      expect(value.code).toBe('SAVE20');
      expect(value.minPurchase).toBe(0);
      expect(value.isActive).toBe(true);
    });

    it('should uppercase the code', () => {
      const { value } = couponSchema.validate({ ...validCoupon, code: 'summer10' });
      expect(value.code).toBe('SUMMER10');
    });

    it('should fail without code', () => {
      const { error } = couponSchema.validate({ ...validCoupon, code: undefined });
      expect(error).toBeDefined();
    });

    it('should fail with invalid discountType', () => {
      const { error } = couponSchema.validate({ ...validCoupon, discountType: 'bogo' });
      expect(error).toBeDefined();
    });

    it('should fail without discountAmount', () => {
      const { error } = couponSchema.validate({ ...validCoupon, discountAmount: undefined });
      expect(error).toBeDefined();
    });

    it('should fail with negative discountAmount', () => {
      const { error } = couponSchema.validate({ ...validCoupon, discountAmount: -5 });
      expect(error).toBeDefined();
    });

    it('should fail when expiryDate is in the past', () => {
      const { error } = couponSchema.validate({ ...validCoupon, expiryDate: '2020-01-01' });
      expect(error).toBeDefined();
    });

    it('should fail without expiryDate', () => {
      const { error } = couponSchema.validate({ ...validCoupon, expiryDate: undefined });
      expect(error).toBeDefined();
    });

    it('should accept fixed discountType', () => {
      const { error } = couponSchema.validate({ ...validCoupon, discountType: 'fixed' });
      expect(error).toBeUndefined();
    });

    it('should default usageLimit to 0', () => {
      const { value } = couponSchema.validate(validCoupon);
      expect(value.usageLimit).toBe(0);
    });
  });

  // ─────────────── reviewSchema ───────────────
  describe('reviewSchema', () => {
    it('should pass with valid review', () => {
      const { error } = reviewSchema.validate({ rating: 5, comment: 'Great product!' });
      expect(error).toBeUndefined();
    });

    it('should fail without rating', () => {
      const { error } = reviewSchema.validate({ comment: 'Nice' });
      expect(error).toBeDefined();
    });

    it('should fail without comment', () => {
      const { error } = reviewSchema.validate({ rating: 3 });
      expect(error).toBeDefined();
    });

    it('should fail when rating is below 1', () => {
      const { error } = reviewSchema.validate({ rating: 0, comment: 'Bad' });
      expect(error).toBeDefined();
    });

    it('should fail when rating exceeds 5', () => {
      const { error } = reviewSchema.validate({ rating: 6, comment: 'Wow' });
      expect(error).toBeDefined();
    });

    it('should fail with non-integer rating', () => {
      const { error } = reviewSchema.validate({ rating: 3.5, comment: 'OK' });
      expect(error).toBeDefined();
    });

    it('should allow optional title', () => {
      const { error } = reviewSchema.validate({ rating: 4, comment: 'Good', title: 'Solid' });
      expect(error).toBeUndefined();
    });

    it('should allow empty title', () => {
      const { error } = reviewSchema.validate({ rating: 4, comment: 'Good', title: '' });
      expect(error).toBeUndefined();
    });

    it('should fail when comment exceeds 1000 chars', () => {
      const { error } = reviewSchema.validate({ rating: 3, comment: 'X'.repeat(1001) });
      expect(error).toBeDefined();
    });
  });

  // ─────────────── createOrderSchema ───────────────
  describe('createOrderSchema', () => {
    it('should pass with required shippingAddressId', () => {
      const { error, value } = createOrderSchema.validate({ shippingAddressId: 'addr123' });
      expect(error).toBeUndefined();
      expect(value.paymentMethod).toBe('razorpay'); // default
    });

    it('should fail without shippingAddressId', () => {
      const { error } = createOrderSchema.validate({});
      expect(error).toBeDefined();
    });

    it('should accept cod payment method', () => {
      const { error, value } = createOrderSchema.validate({
        shippingAddressId: 'addr123',
        paymentMethod: 'cod',
      });
      expect(error).toBeUndefined();
      expect(value.paymentMethod).toBe('cod');
    });

    it('should reject invalid payment method', () => {
      const { error } = createOrderSchema.validate({
        shippingAddressId: 'addr123',
        paymentMethod: 'bitcoin',
      });
      expect(error).toBeDefined();
    });

    it('should allow optional couponCode', () => {
      const { error, value } = createOrderSchema.validate({
        shippingAddressId: 'addr123',
        couponCode: 'save10',
      });
      expect(error).toBeUndefined();
      expect(value.couponCode).toBe('SAVE10'); // uppercased
    });

    it('should allow empty couponCode', () => {
      const { error } = createOrderSchema.validate({
        shippingAddressId: 'addr123',
        couponCode: '',
      });
      expect(error).toBeUndefined();
    });
  });
});
