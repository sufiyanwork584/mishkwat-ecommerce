import { AppError, asyncHandler, notFound, errorHandler } from '../src/middleware/errorMiddleware.js';
import { jest } from '@jest/globals';


describe('Error Middleware – errorMiddleware.js', () => {
  // ─────────────── AppError ───────────────
  describe('AppError', () => {
    it('should create error with message and statusCode', () => {
      const err = new AppError('Not found', 404);
      expect(err.message).toBe('Not found');
      expect(err.statusCode).toBe(404);
      expect(err.isOperational).toBe(true);
    });

    it('should be an instance of Error', () => {
      const err = new AppError('Fail', 500);
      expect(err).toBeInstanceOf(Error);
    });

    it('should capture stack trace', () => {
      const err = new AppError('trace', 400);
      expect(err.stack).toBeDefined();
    });
  });

  // ─────────────── asyncHandler ───────────────
  describe('asyncHandler', () => {
    it('should call the wrapped function', async () => {
      const fn = jest.fn().mockResolvedValue('ok');
      const handler = asyncHandler(fn);
      const req = {}, res = {}, next = jest.fn();
      await handler(req, res, next);
      expect(fn).toHaveBeenCalledWith(req, res, next);
    });

    it('should pass errors to next', async () => {
      const error = new Error('async error');
      const fn = jest.fn().mockRejectedValue(error);
      const handler = asyncHandler(fn);
      const next = jest.fn();
      await handler({}, {}, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ─────────────── notFound ───────────────
  describe('notFound', () => {
    it('should call next with a 404 AppError', () => {
      const req = { originalUrl: '/api/v1/missing' };
      const res = {};
      const next = jest.fn();
      notFound(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(404);
      expect(err.message).toContain('/api/v1/missing');
    });
  });

  // ─────────────── errorHandler ───────────────
  describe('errorHandler', () => {
    const createRes = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    it('should send error response with given statusCode', () => {
      const err = new AppError('Bad request', 400);
      const res = createRes();
      errorHandler(err, {}, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Bad request',
      }));
    });

    it('should default to 500 for unknown errors', () => {
      const err = new Error('unknown');
      const res = createRes();
      errorHandler(err, {}, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle CastError (bad ObjectId)', () => {
      const err = new Error('Cast failed');
      err.name = 'CastError';
      const res = createRes();
      errorHandler(err, {}, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Resource not found',
      }));
    });

    it('should handle Mongoose duplicate key (code 11000)', () => {
      const err = new Error('dup key');
      err.code = 11000;
      err.keyValue = { email: 'dup@test.com' };
      const res = createRes();
      errorHandler(err, {}, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Duplicate value for email'),
      }));
    });

    it('should handle Mongoose ValidationError', () => {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = {
        name: { message: 'Name is required' },
        email: { message: 'Email is invalid' },
      };
      const res = createRes();
      errorHandler(err, {}, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(400);
      const msg = res.json.mock.calls[0][0].message;
      expect(msg).toContain('Name is required');
      expect(msg).toContain('Email is invalid');
    });

    it('should handle JsonWebTokenError', () => {
      const err = new Error('invalid');
      err.name = 'JsonWebTokenError';
      const res = createRes();
      errorHandler(err, {}, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid token. Please log in again.',
      }));
    });

    it('should handle TokenExpiredError', () => {
      const err = new Error('expired');
      err.name = 'TokenExpiredError';
      const res = createRes();
      errorHandler(err, {}, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Token expired. Please log in again.',
      }));
    });

    it('should include stack trace in non-production', () => {
      process.env.NODE_ENV = 'test';
      const err = new AppError('debug', 500);
      const res = createRes();
      errorHandler(err, {}, res, jest.fn());
      expect(res.json.mock.calls[0][0].stack).toBeDefined();
    });
  });
});
