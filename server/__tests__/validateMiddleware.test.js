import Joi from 'joi';
import { validate } from '../src/middleware/validateMiddleware.js';
import { AppError } from '../src/middleware/errorMiddleware.js';
import { jest } from '@jest/globals';


describe('Validate Middleware – validateMiddleware.js', () => {
  const testSchema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().min(0).optional(),
  });

  const createReqRes = (body = {}) => ({
    req: { body },
    res: {},
    next: jest.fn(),
  });

  it('should call next() when validation passes', () => {
    const { req, res, next } = createReqRes({ name: 'Alice', age: 25 });
    const middleware = validate(testSchema);
    middleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(); // no error
  });

  it('should replace req.body with validated+stripped value', () => {
    const { req, res, next } = createReqRes({ name: 'Bob', extra: 'hack' });
    const middleware = validate(testSchema);
    middleware(req, res, next);
    expect(req.body.name).toBe('Bob');
    expect(req.body.extra).toBeUndefined(); // stripUnknown
  });

  it('should throw AppError with 400 when validation fails', () => {
    const { req, res, next } = createReqRes({}); // missing required name
    const middleware = validate(testSchema);
    expect(() => middleware(req, res, next)).toThrow(AppError);
    try {
      middleware(req, res, next);
    } catch (err) {
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain('name');
    }
  });

  it('should collect all validation errors (abortEarly: false)', () => {
    const multiSchema = Joi.object({
      a: Joi.string().required(),
      b: Joi.number().required(),
    });
    const { req, res, next } = createReqRes({});
    const middleware = validate(multiSchema);
    try {
      middleware(req, res, next);
    } catch (err) {
      // Message should mention both 'a' and 'b'
      expect(err.message).toContain('a');
      expect(err.message).toContain('b');
    }
  });

  it('should validate query params when property="query"', () => {
    const querySchema = Joi.object({ page: Joi.number().min(1).required() });
    const req = { query: { page: 5 } };
    const next = jest.fn();
    const middleware = validate(querySchema, 'query');
    middleware(req, {}, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.query.page).toBe(5);
  });

  it('should throw for invalid query params', () => {
    const querySchema = Joi.object({ page: Joi.number().min(1).required() });
    const req = { query: {} };
    const middleware = validate(querySchema, 'query');
    expect(() => middleware(req, {}, jest.fn())).toThrow(AppError);
  });
});
