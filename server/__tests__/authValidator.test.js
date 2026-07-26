import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  addressSchema,
} from '../src/validators/authValidator.js';

describe('Auth Validators – authValidator.js', () => {
  // ─────────────── registerSchema ───────────────
  describe('registerSchema', () => {
    const validData = { name: 'John Doe', email: 'john@example.com', password: 'Passw0rd123' };

    it('should pass with valid data', () => {
      const { error } = registerSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when name is missing', () => {
      const { error } = registerSchema.validate({ ...validData, name: undefined });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('name');
    });

    it('should fail when name is too short', () => {
      const { error } = registerSchema.validate({ ...validData, name: 'A' });
      expect(error).toBeDefined();
    });

    it('should fail when name exceeds 50 chars', () => {
      const { error } = registerSchema.validate({ ...validData, name: 'A'.repeat(51) });
      expect(error).toBeDefined();
    });

    it('should fail with invalid email', () => {
      const { error } = registerSchema.validate({ ...validData, email: 'not-an-email' });
      expect(error).toBeDefined();
    });

    it('should fail when email is missing', () => {
      const { error } = registerSchema.validate({ ...validData, email: undefined });
      expect(error).toBeDefined();
    });

    it('should lowercase and trim email', () => {
      const { value } = registerSchema.validate({ ...validData, email: '  John@EXAMPLE.com  ' });
      expect(value.email).toBe('john@example.com');
    });

    it('should fail when password is missing', () => {
      const { error } = registerSchema.validate({ ...validData, password: undefined });
      expect(error).toBeDefined();
    });

    it('should fail when password is too short', () => {
      const { error } = registerSchema.validate({ ...validData, password: 'Ab1' });
      expect(error).toBeDefined();
    });

    it('should fail when password lacks uppercase', () => {
      const { error } = registerSchema.validate({ ...validData, password: 'password1' });
      expect(error).toBeDefined();
    });

    it('should fail when password lacks lowercase', () => {
      const { error } = registerSchema.validate({ ...validData, password: 'PASSWORD1' });
      expect(error).toBeDefined();
    });

    it('should fail when password lacks digit', () => {
      const { error } = registerSchema.validate({ ...validData, password: 'Passwordd' });
      expect(error).toBeDefined();
    });

    it('should allow optional phone', () => {
      const { error, value } = registerSchema.validate({ ...validData, phone: '9876543210' });
      expect(error).toBeUndefined();
      expect(value.phone).toBe('9876543210');
    });

    it('should allow empty phone', () => {
      const { error } = registerSchema.validate({ ...validData, phone: '' });
      expect(error).toBeUndefined();
    });
  });

  // ─────────────── loginSchema ───────────────
  describe('loginSchema', () => {
    it('should pass with valid email and password', () => {
      const { error } = loginSchema.validate({ email: 'user@test.com', password: 'secret' });
      expect(error).toBeUndefined();
    });

    it('should fail without email', () => {
      const { error } = loginSchema.validate({ password: 'secret' });
      expect(error).toBeDefined();
    });

    it('should fail without password', () => {
      const { error } = loginSchema.validate({ email: 'user@test.com' });
      expect(error).toBeDefined();
    });

    it('should fail with invalid email format', () => {
      const { error } = loginSchema.validate({ email: 'bad', password: 'x' });
      expect(error).toBeDefined();
    });
  });

  // ─────────────── forgotPasswordSchema ───────────────
  describe('forgotPasswordSchema', () => {
    it('should pass with valid email', () => {
      const { error } = forgotPasswordSchema.validate({ email: 'user@example.com' });
      expect(error).toBeUndefined();
    });

    it('should fail without email', () => {
      const { error } = forgotPasswordSchema.validate({});
      expect(error).toBeDefined();
    });
  });

  // ─────────────── resetPasswordSchema ───────────────
  describe('resetPasswordSchema', () => {
    it('should pass with a valid strong password', () => {
      const { error } = resetPasswordSchema.validate({ password: 'NewPass1!' });
      expect(error).toBeUndefined();
    });

    it('should fail with a weak password', () => {
      const { error } = resetPasswordSchema.validate({ password: 'weak' });
      expect(error).toBeDefined();
    });
  });

  // ─────────────── changePasswordSchema ───────────────
  describe('changePasswordSchema', () => {
    it('should pass with both current and new password', () => {
      const { error } = changePasswordSchema.validate({
        currentPassword: 'OldPass1',
        newPassword: 'NewPass1',
      });
      expect(error).toBeUndefined();
    });

    it('should fail without currentPassword', () => {
      const { error } = changePasswordSchema.validate({ newPassword: 'NewPass1' });
      expect(error).toBeDefined();
    });

    it('should fail without newPassword', () => {
      const { error } = changePasswordSchema.validate({ currentPassword: 'old' });
      expect(error).toBeDefined();
    });

    it('should reject weak newPassword', () => {
      const { error } = changePasswordSchema.validate({ currentPassword: 'old', newPassword: 'weak' });
      expect(error).toBeDefined();
    });
  });

  // ─────────────── updateProfileSchema ───────────────
  describe('updateProfileSchema', () => {
    it('should pass with name only', () => {
      const { error } = updateProfileSchema.validate({ name: 'Jane' });
      expect(error).toBeUndefined();
    });

    it('should pass with empty body', () => {
      const { error } = updateProfileSchema.validate({});
      expect(error).toBeUndefined();
    });

    it('should trim and validate name length', () => {
      const { error } = updateProfileSchema.validate({ name: 'X' });
      expect(error).toBeDefined();
    });
  });

  // ─────────────── addressSchema ───────────────
  describe('addressSchema', () => {
    const validAddr = {
      fullName: 'John Doe',
      phone: '9876543210',
      street: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
    };

    it('should pass with all required fields', () => {
      const { error, value } = addressSchema.validate(validAddr);
      expect(error).toBeUndefined();
      expect(value.country).toBe('India');   // default
      expect(value.isDefault).toBe(false);   // default
    });

    it('should fail without fullName', () => {
      const { error } = addressSchema.validate({ ...validAddr, fullName: undefined });
      expect(error).toBeDefined();
    });

    it('should fail without phone', () => {
      const { error } = addressSchema.validate({ ...validAddr, phone: undefined });
      expect(error).toBeDefined();
    });

    it('should fail without street', () => {
      const { error } = addressSchema.validate({ ...validAddr, street: undefined });
      expect(error).toBeDefined();
    });

    it('should fail without city', () => {
      const { error } = addressSchema.validate({ ...validAddr, city: undefined });
      expect(error).toBeDefined();
    });

    it('should fail without state', () => {
      const { error } = addressSchema.validate({ ...validAddr, state: undefined });
      expect(error).toBeDefined();
    });

    it('should fail without zipCode', () => {
      const { error } = addressSchema.validate({ ...validAddr, zipCode: undefined });
      expect(error).toBeDefined();
    });

    it('should allow custom country and isDefault', () => {
      const { error, value } = addressSchema.validate({ ...validAddr, country: 'US', isDefault: true });
      expect(error).toBeUndefined();
      expect(value.country).toBe('US');
      expect(value.isDefault).toBe(true);
    });

    it('should allow optional area and region', () => {
      const { error, value } = addressSchema.validate({ ...validAddr, area: 'Bandra West', region: 'Mumbai' });
      expect(error).toBeUndefined();
      expect(value.area).toBe('Bandra West');
      expect(value.region).toBe('Mumbai');
    });
  });
});
