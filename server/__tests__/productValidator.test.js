import {
  createProductSchema,
  updateProductSchema,
} from '../src/validators/productValidator.js';

describe('Product Validators – productValidator.js', () => {
  // ─────────────── createProductSchema ───────────────
  describe('createProductSchema', () => {
    const validProduct = {
      title: 'Test Product',
      description: 'A great product description.',
      category: '507f1f77bcf86cd799439011',
      brand: 'TestBrand',
      price: 99.99,
      stock: 50,
    };

    it('should pass with all required fields', () => {
      const { error } = createProductSchema.validate(validProduct);
      expect(error).toBeUndefined();
    });

    it('should fail without title', () => {
      const { error } = createProductSchema.validate({ ...validProduct, title: undefined });
      expect(error).toBeDefined();
    });

    it('should fail if title exceeds 200 chars', () => {
      const { error } = createProductSchema.validate({ ...validProduct, title: 'X'.repeat(201) });
      expect(error).toBeDefined();
    });

    it('should fail without description', () => {
      const { error } = createProductSchema.validate({ ...validProduct, description: undefined });
      expect(error).toBeDefined();
    });

    it('should fail if description exceeds 5000 chars', () => {
      const { error } = createProductSchema.validate({ ...validProduct, description: 'X'.repeat(5001) });
      expect(error).toBeDefined();
    });

    it('should fail without category', () => {
      const { error } = createProductSchema.validate({ ...validProduct, category: undefined });
      expect(error).toBeDefined();
    });

    it('should fail without brand', () => {
      const { error } = createProductSchema.validate({ ...validProduct, brand: undefined });
      expect(error).toBeDefined();
    });

    it('should fail without price', () => {
      const { error } = createProductSchema.validate({ ...validProduct, price: undefined });
      expect(error).toBeDefined();
    });

    it('should fail with negative price', () => {
      const { error } = createProductSchema.validate({ ...validProduct, price: -10 });
      expect(error).toBeDefined();
    });

    it('should fail without stock', () => {
      const { error } = createProductSchema.validate({ ...validProduct, stock: undefined });
      expect(error).toBeDefined();
    });

    it('should fail with negative stock', () => {
      const { error } = createProductSchema.validate({ ...validProduct, stock: -1 });
      expect(error).toBeDefined();
    });

    it('should default salePrice to 0', () => {
      const { value } = createProductSchema.validate(validProduct);
      expect(value.salePrice).toBe(0);
    });

    it('should default isFeatured to false', () => {
      const { value } = createProductSchema.validate(validProduct);
      expect(value.isFeatured).toBe(false);
    });

    it('should default isActive to true', () => {
      const { value } = createProductSchema.validate(validProduct);
      expect(value.isActive).toBe(true);
    });

    it('should accept optional specifications', () => {
      const { error, value } = createProductSchema.validate({
        ...validProduct,
        specifications: [{ key: 'Color', value: 'Red' }],
      });
      expect(error).toBeUndefined();
      expect(value.specifications).toHaveLength(1);
    });

    it('should accept optional tags and lowercase them', () => {
      const { value } = createProductSchema.validate({ ...validProduct, tags: ['ELECTRONICS', 'Gadget'] });
      expect(value.tags).toEqual(['electronics', 'gadget']);
    });

    it('should uppercase SKU', () => {
      const { value } = createProductSchema.validate({ ...validProduct, sku: 'abc123' });
      expect(value.sku).toBe('ABC123');
    });

    it('should allow empty subcategory', () => {
      const { error } = createProductSchema.validate({ ...validProduct, subcategory: '' });
      expect(error).toBeUndefined();
    });

    it('should strip unknown fields', () => {
      const { value } = createProductSchema.validate(
        { ...validProduct, randomField: 'hack' },
        { stripUnknown: true }
      );
      expect(value.randomField).toBeUndefined();
    });
  });

  // ─────────────── updateProductSchema ───────────────
  describe('updateProductSchema', () => {
    it('should pass with at least one field', () => {
      const { error } = updateProductSchema.validate({ title: 'New Title' });
      expect(error).toBeUndefined();
    });

    it('should fail with empty object (min 1 field required)', () => {
      const { error } = updateProductSchema.validate({});
      expect(error).toBeDefined();
    });

    it('should allow updating only price', () => {
      const { error, value } = updateProductSchema.validate({ price: 199 });
      expect(error).toBeUndefined();
      expect(value.price).toBe(199);
    });

    it('should reject negative salePrice', () => {
      const { error } = updateProductSchema.validate({ salePrice: -5 });
      expect(error).toBeDefined();
    });

    it('should allow updating multiple fields', () => {
      const { error } = updateProductSchema.validate({
        title: 'Updated',
        stock: 100,
        isFeatured: true,
      });
      expect(error).toBeUndefined();
    });
  });
});
