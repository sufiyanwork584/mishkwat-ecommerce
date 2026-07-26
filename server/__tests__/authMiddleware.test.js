import jwt from 'jsonwebtoken';
import { authorize } from '../src/middleware/authMiddleware.js';
import { AppError } from '../src/middleware/errorMiddleware.js';
import { jest } from '@jest/globals';


process.env.JWT_SECRET = 'test-secret-key';

// Note: `protect` and `optionalAuth` depend on Mongoose/User model.
// We test `authorize` (pure function) directly here.

describe('Auth Middleware – authMiddleware.js', () => {
  describe('authorize', () => {
    const createReqRes = (role) => ({
      req: { user: { role } },
      res: {},
      next: jest.fn(),
    });

    it('should call next() when user has allowed role', () => {
      const { req, res, next } = createReqRes('admin');
      const middleware = authorize('admin');
      middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should call next() when user has one of multiple allowed roles', () => {
      const { req, res, next } = createReqRes('user');
      const middleware = authorize('user', 'admin');
      middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should throw AppError 403 when user role is not authorized', () => {
      const { req, res, next } = createReqRes('user');
      const middleware = authorize('admin');
      expect(() => middleware(req, res, next)).toThrow(AppError);
      try {
        middleware(req, res, next);
      } catch (err) {
        expect(err.statusCode).toBe(403);
        expect(err.message).toContain('Not authorized');
      }
    });

    it('should throw when called with no allowed roles', () => {
      const { req, res, next } = createReqRes('admin');
      const middleware = authorize();
      expect(() => middleware(req, res, next)).toThrow(AppError);
    });
  });

  describe('JWT token generation / verification round-trip', () => {
    it('should verify a token signed with the same secret', () => {
      const token = jwt.sign({ id: 'user1' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe('user1');
    });

    it('should throw for a token signed with a different secret', () => {
      const token = jwt.sign({ id: 'user1' }, 'different-secret');
      expect(() => jwt.verify(token, process.env.JWT_SECRET)).toThrow();
    });

    it('should throw for an expired token', () => {
      const token = jwt.sign({ id: 'user1' }, process.env.JWT_SECRET, { expiresIn: '-1s' });
      expect(() => jwt.verify(token, process.env.JWT_SECRET)).toThrow();
    });
  });
});
