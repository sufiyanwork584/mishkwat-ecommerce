import Joi from 'joi';

export const createProductSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().max(5000).required(),
  category: Joi.string().required(),
  subcategory: Joi.string().allow('').optional(),
  brand: Joi.string().trim().required(),
  sku: Joi.string().uppercase().allow('').optional(),
  price: Joi.number().min(0).required(),
  salePrice: Joi.number().min(0).default(0),
  stock: Joi.number().integer().min(0).required(),
  specifications: Joi.array().items(Joi.object({ key: Joi.string().required(), value: Joi.string().required() })).optional(),
  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
  isFeatured: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
});

export const updateProductSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  description: Joi.string().max(5000).optional(),
  category: Joi.string().optional(),
  subcategory: Joi.string().allow('').optional(),
  brand: Joi.string().trim().optional(),
  sku: Joi.string().uppercase().allow('').optional(),
  price: Joi.number().min(0).optional(),
  salePrice: Joi.number().min(0).optional(),
  stock: Joi.number().integer().min(0).optional(),
  specifications: Joi.array().items(Joi.object({ key: Joi.string().required(), value: Joi.string().required() })).optional(),
  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
  isFeatured: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
}).min(1);
