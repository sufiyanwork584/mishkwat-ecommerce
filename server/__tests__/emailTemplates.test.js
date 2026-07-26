import {
  welcomeEmailTemplate,
  orderConfirmationTemplate,
  shippingUpdateTemplate,
  passwordResetTemplate,
  newsletterWelcomeTemplate,
} from '../src/utils/emailTemplates.js';

process.env.CLIENT_URL = 'http://localhost:3000';

describe('Email Templates – emailTemplates.js', () => {
  describe('welcomeEmailTemplate', () => {
    it('should include the user name', () => {
      const html = welcomeEmailTemplate('Alice');
      expect(html).toContain('Alice');
    });

    it('should include Mishkwat branding', () => {
      const html = welcomeEmailTemplate('Bob');
      expect(html).toContain('Mishkwat');
      expect(html).toContain('Welcome');
    });

    it('should include the CLIENT_URL link', () => {
      const html = welcomeEmailTemplate('Eve');
      expect(html).toContain('http://localhost:3000');
    });

    it('should include a Start Shopping button', () => {
      const html = welcomeEmailTemplate('Test');
      expect(html).toContain('Start Shopping');
    });
  });

  describe('orderConfirmationTemplate', () => {
    const mockOrder = {
      orderNumber: 'NXB-TEST-0001',
      totalAmount: 2500,
      paymentMethod: 'razorpay',
      items: [
        { title: 'Test Product', quantity: 2, price: 1000 },
        { title: 'Another Item', quantity: 1, price: 500 },
      ],
    };

    it('should include order number', () => {
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('NXB-TEST-0001');
    });

    it('should include formatted total amount', () => {
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('2,500');
    });

    it('should include payment method uppercased', () => {
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('RAZORPAY');
    });

    it('should render all order items', () => {
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('Test Product');
      expect(html).toContain('Another Item');
    });

    it('should include item count', () => {
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('2 product(s)');
    });

    it('should include track order link', () => {
      const html = orderConfirmationTemplate(mockOrder);
      expect(html).toContain('http://localhost:3000/orders');
    });
  });

  describe('shippingUpdateTemplate', () => {
    const mockOrder = { orderNumber: 'NXB-SHIP-1', _id: 'order123' };

    it('should use status-specific message for shipped', () => {
      const html = shippingUpdateTemplate(mockOrder, 'shipped');
      expect(html).toContain('shipped');
      expect(html).toContain('🚚');
    });

    it('should use status-specific message for delivered', () => {
      const html = shippingUpdateTemplate(mockOrder, 'delivered');
      expect(html).toContain('delivered');
      expect(html).toContain('🎉');
    });

    it('should fall back to "Order Update" for unknown status', () => {
      const html = shippingUpdateTemplate(mockOrder, 'unknownStatus');
      expect(html).toContain('Order Update');
    });

    it('should include view order link with order ID', () => {
      const html = shippingUpdateTemplate(mockOrder, 'shipped');
      expect(html).toContain('http://localhost:3000/orders/order123');
    });

    it('should include the order number', () => {
      const html = shippingUpdateTemplate(mockOrder, 'processing');
      expect(html).toContain('NXB-SHIP-1');
    });
  });

  describe('passwordResetTemplate', () => {
    it('should include the reset URL', () => {
      const html = passwordResetTemplate('http://localhost:3000/reset/abc123');
      expect(html).toContain('http://localhost:3000/reset/abc123');
    });

    it('should include Reset Password text', () => {
      const html = passwordResetTemplate('http://example.com');
      expect(html).toContain('Reset Password');
    });

    it('should mention 30 minutes expiry', () => {
      const html = passwordResetTemplate('http://example.com');
      expect(html).toContain('30 minutes');
    });
  });

  describe('newsletterWelcomeTemplate', () => {
    it('should include the subscriber email', () => {
      const html = newsletterWelcomeTemplate('test@example.com');
      expect(html).toContain('test@example.com');
    });

    it('should include Mishkwat Newsletter branding', () => {
      const html = newsletterWelcomeTemplate('user@test.com');
      expect(html).toContain('Mishkwat Newsletter');
    });

    it('should include Shop Now link', () => {
      const html = newsletterWelcomeTemplate('user@test.com');
      expect(html).toContain('Shop Now');
      expect(html).toContain('http://localhost:3000');
    });
  });
});
