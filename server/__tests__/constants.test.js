import {
  USER_ROLES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  REVIEW_STATUS,
  DISCOUNT_TYPE,
  SORT_OPTIONS,
  PAGINATION,
} from '../src/utils/constants.js';

describe('Constants – constants.js', () => {
  describe('USER_ROLES', () => {
    it('should define user and admin roles', () => {
      expect(USER_ROLES.USER).toBe('user');
      expect(USER_ROLES.ADMIN).toBe('admin');
    });
    it('should have exactly 2 roles', () => {
      expect(Object.keys(USER_ROLES)).toHaveLength(2);
    });
  });

  describe('ORDER_STATUS', () => {
    it('should define all 7 order status values', () => {
      expect(ORDER_STATUS.PENDING).toBe('pending');
      expect(ORDER_STATUS.PROCESSING).toBe('processing');
      expect(ORDER_STATUS.PACKED).toBe('packed');
      expect(ORDER_STATUS.SHIPPED).toBe('shipped');
      expect(ORDER_STATUS.OUT_FOR_DELIVERY).toBe('outForDelivery');
      expect(ORDER_STATUS.DELIVERED).toBe('delivered');
      expect(ORDER_STATUS.CANCELLED).toBe('cancelled');
    });
    it('should have exactly 7 entries', () => {
      expect(Object.keys(ORDER_STATUS)).toHaveLength(7);
    });
  });

  describe('PAYMENT_STATUS', () => {
    it('should define all payment status values', () => {
      expect(PAYMENT_STATUS.PENDING).toBe('pending');
      expect(PAYMENT_STATUS.PAID).toBe('paid');
      expect(PAYMENT_STATUS.FAILED).toBe('failed');
      expect(PAYMENT_STATUS.REFUNDED).toBe('refunded');
    });
  });

  describe('REVIEW_STATUS', () => {
    it('should define review lifecycle statuses', () => {
      expect(REVIEW_STATUS.PENDING).toBe('pending');
      expect(REVIEW_STATUS.APPROVED).toBe('approved');
      expect(REVIEW_STATUS.REJECTED).toBe('rejected');
    });
  });

  describe('DISCOUNT_TYPE', () => {
    it('should define percentage and fixed', () => {
      expect(DISCOUNT_TYPE.PERCENTAGE).toBe('percentage');
      expect(DISCOUNT_TYPE.FIXED).toBe('fixed');
    });
  });

  describe('SORT_OPTIONS', () => {
    it('should define all 5 sort options', () => {
      expect(SORT_OPTIONS.PRICE_LOW).toBe('price_asc');
      expect(SORT_OPTIONS.PRICE_HIGH).toBe('price_desc');
      expect(SORT_OPTIONS.NEWEST).toBe('newest');
      expect(SORT_OPTIONS.POPULARITY).toBe('popularity');
      expect(SORT_OPTIONS.RATING).toBe('rating');
    });
  });

  describe('PAGINATION', () => {
    it('should define default and max pagination values', () => {
      expect(PAGINATION.DEFAULT_PAGE).toBe(1);
      expect(PAGINATION.DEFAULT_LIMIT).toBe(12);
      expect(PAGINATION.MAX_LIMIT).toBe(50);
    });
    it('MAX_LIMIT should be greater than DEFAULT_LIMIT', () => {
      expect(PAGINATION.MAX_LIMIT).toBeGreaterThan(PAGINATION.DEFAULT_LIMIT);
    });
  });
});
