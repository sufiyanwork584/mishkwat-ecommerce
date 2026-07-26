import { AppError } from './errorMiddleware.js';

/**
 * Generic Joi validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join('. ');
      throw new AppError(messages, 400);
    }

    req[property] = value;
    next();
  };
};
