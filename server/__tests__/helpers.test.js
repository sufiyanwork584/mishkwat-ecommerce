import {
  calculateOrderTotals,
  buildProductFilter,
  buildProductSort,
  formatPrice,
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from '../src/utils/helpers.js';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';


// Set env vars for JWT helpers
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_EXPIRE = '15m';
process.env.JWT_REFRESH_EXPIRE = '7d';
process.env.NODE_ENV = 'test';

describe('Helper Functions – helpers.js', () => {
  // ─────────────── calculateOrderTotals ───────────────
  describe('calculateOrderTotals', () => {
    it('should calculate correct totals with default tax and shipping', () => {
      const items = [
        { price: 100, quantity: 2 },
        { price: 50, quantity: 1 },
      ];
      const totals = calculateOrderTotals(items);
      expect(totals.subtotal).toBe(250);
      expect(totals.tax).toBe(45);
      expect(totals.shippingCost).toBe(0);
      expect(totals.discount).toBe(0);
      expect(totals.totalAmount).toBe(295);
    });

    it('should calculate correct totals with discount and custom shipping', () => {
      const items = [{ price: 500, quantity: 1 }];
      const totals = calculateOrderTotals(items, 50, 100);
      expect(totals.subtotal).toBe(500);
      expect(totals.tax).toBe(90);
      expect(totals.shippingCost).toBe(50);
      expect(totals.discount).toBe(100);
      expect(totals.totalAmount).toBe(540);
    });

    it('should never return totalAmount less than 0', () => {
      const items = [{ price: 10, quantity: 1 }];
      const totals = calculateOrderTotals(items, 0, 100);
      expect(totals.totalAmount).toBe(0);
    });

    it('should handle custom tax rate', () => {
      const items = [{ price: 1000, quantity: 1 }];
      const totals = calculateOrderTotals(items, 0, 0, 0.05);
      expect(totals.tax).toBe(50);
      expect(totals.totalAmount).toBe(1050);
    });

    it('should handle empty items array', () => {
      const totals = calculateOrderTotals([], 50);
      expect(totals.subtotal).toBe(0);
      expect(totals.tax).toBe(0);
      expect(totals.totalAmount).toBe(50);
    });

    it('should handle zero-price items', () => {
      const items = [{ price: 0, quantity: 5 }];
      const totals = calculateOrderTotals(items);
      expect(totals.subtotal).toBe(0);
      expect(totals.totalAmount).toBe(0);
    });
  });

  // ─────────────── buildProductFilter ───────────────
  describe('buildProductFilter', () => {
    it('should return base filter with isActive:true for empty query', () => {
      const filter = buildProductFilter({});
      expect(filter).toEqual({ isActive: true });
    });

    it('should filter by category', () => {
      const filter = buildProductFilter({ category: 'electronics' });
      expect(filter.category).toBe('electronics');
    });

    it('should filter by subcategory', () => {
      const filter = buildProductFilter({ subcategory: 'phones' });
      expect(filter.subcategory).toBe('phones');
    });

    it('should filter by brand (case-insensitive regex)', () => {
      const filter = buildProductFilter({ brand: 'Apple' });
      expect(filter.brand).toEqual({ $regex: 'Apple', $options: 'i' });
    });

    it('should filter by search text', () => {
      const filter = buildProductFilter({ search: 'laptop' });
      expect(filter.$text).toEqual({ $search: 'laptop' });
    });

    it('should filter by price range (both min and max)', () => {
      const filter = buildProductFilter({ minPrice: '100', maxPrice: '500' });
      expect(filter.price).toEqual({ $gte: 100, $lte: 500 });
    });

    it('should filter by only minPrice', () => {
      const filter = buildProductFilter({ minPrice: '200' });
      expect(filter.price).toEqual({ $gte: 200 });
    });

    it('should filter by only maxPrice', () => {
      const filter = buildProductFilter({ maxPrice: '999' });
      expect(filter.price).toEqual({ $lte: 999 });
    });

    it('should filter by rating', () => {
      const filter = buildProductFilter({ rating: '4' });
      expect(filter.avgRating).toEqual({ $gte: 4 });
    });

    it('should filter by inStock=true', () => {
      const filter = buildProductFilter({ inStock: 'true' });
      expect(filter.stock).toEqual({ $gt: 0 });
    });

    it('should NOT filter stock when inStock is not "true"', () => {
      const filter = buildProductFilter({ inStock: 'false' });
      expect(filter.stock).toBeUndefined();
    });

    it('should combine multiple filters', () => {
      const filter = buildProductFilter({
        category: 'fashion',
        brand: 'Nike',
        minPrice: '50',
        inStock: 'true',
      });
      expect(filter.isActive).toBe(true);
      expect(filter.category).toBe('fashion');
      expect(filter.brand).toEqual({ $regex: 'Nike', $options: 'i' });
      expect(filter.price).toEqual({ $gte: 50 });
      expect(filter.stock).toEqual({ $gt: 0 });
    });
  });

  // ─────────────── buildProductSort ───────────────
  describe('buildProductSort', () => {
    it('should return price ascending sort mapping', () => {
      expect(buildProductSort('price_asc')).toEqual({ price: 1 });
    });

    it('should return price descending sort mapping', () => {
      expect(buildProductSort('price_desc')).toEqual({ price: -1 });
    });

    it('should return newest sort mapping', () => {
      expect(buildProductSort('newest')).toEqual({ createdAt: -1 });
    });

    it('should return popularity sort mapping', () => {
      expect(buildProductSort('popularity')).toEqual({ numReviews: -1 });
    });

    it('should return rating sort mapping', () => {
      expect(buildProductSort('rating')).toEqual({ avgRating: -1 });
    });

    it('should return newest sort mapping by default for invalid keys', () => {
      expect(buildProductSort('invalid_key')).toEqual({ createdAt: -1 });
    });

    it('should return newest sort mapping for undefined', () => {
      expect(buildProductSort(undefined)).toEqual({ createdAt: -1 });
    });
  });

  // ─────────────── formatPrice ───────────────
  describe('formatPrice', () => {
    it('should format a number as INR currency', () => {
      const formatted = formatPrice(1500);
      expect(formatted).toContain('1,500');
    });

    it('should handle zero', () => {
      const formatted = formatPrice(0);
      expect(formatted).toContain('0');
    });

    it('should handle decimal values', () => {
      const formatted = formatPrice(999.99);
      expect(formatted).toContain('999.99');
    });

    it('should handle large numbers', () => {
      const formatted = formatPrice(100000);
      expect(formatted).toContain('1,00,000');
    });
  });

  // ─────────────── generateAccessToken ───────────────
  describe('generateAccessToken', () => {
    it('should return a valid JWT token', () => {
      const token = generateAccessToken('user123');
      expect(typeof token).toBe('string');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe('user123');
    });

    it('should set expiry from env JWT_EXPIRE', () => {
      const token = generateAccessToken('u1');
      const decoded = jwt.decode(token);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  // ─────────────── generateRefreshToken ───────────────
  describe('generateRefreshToken', () => {
    it('should return a valid JWT refresh token', () => {
      const token = generateRefreshToken('user456');
      expect(typeof token).toBe('string');
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      expect(decoded.id).toBe('user456');
    });
  });

  // ─────────────── setRefreshTokenCookie ───────────────
  describe('setRefreshTokenCookie', () => {
    it('should call res.cookie with correct arguments', () => {
      const res = { cookie: jest.fn() };
      setRefreshTokenCookie(res, 'my-refresh-token');
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'my-refresh-token', expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }));
    });

    it('should set secure=false in non-production', () => {
      process.env.NODE_ENV = 'test';
      const res = { cookie: jest.fn() };
      setRefreshTokenCookie(res, 'tok');
      const options = res.cookie.mock.calls[0][2];
      expect(options.secure).toBe(false);
    });
  });

  // ─────────────── clearRefreshTokenCookie ───────────────
  describe('clearRefreshTokenCookie', () => {
    it('should call res.cookie with empty string and past expiry', () => {
      const res = { cookie: jest.fn() };
      clearRefreshTokenCookie(res);
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', '', expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
      }));
      const opts = res.cookie.mock.calls[0][2];
      expect(opts.expires.getTime()).toBe(0);
    });
  });
});
