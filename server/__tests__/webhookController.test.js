import { jest } from '@jest/globals';
import crypto from 'crypto';

// Setup unstable mocks for ESM
jest.unstable_mockModule('../src/services/shipmentService.js', () => {
  return {
    processOrderShipment: jest.fn().mockImplementation(() => Promise.resolve()),
  };
});

const mockOrderFindOne = jest.fn();
jest.unstable_mockModule('../src/models/Order.js', () => {
  return {
    default: {
      findOne: mockOrderFindOne,
    },
  };
});

// Import controllers and mocked dependencies dynamically
const { handleRazorpayWebhook, handleShiprocketWebhook } = await import('../src/controllers/webhookController.js');
const { processOrderShipment } = await import('../src/services/shipmentService.js');

describe('Webhook Controller – webhookController.js', () => {
  let req, res, next;

  // Helper to wait for the async execution of asyncHandler-wrapped functions
  const runHandler = async (handler, req, res, next) => {
    handler(req, res, next);
    // Allow microtasks to execute
    await new Promise((resolve) => setTimeout(resolve, 20));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      headers: {},
      body: {},
      rawBody: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    process.env.RAZORPAY_WEBHOOK_SECRET = 'test-webhook-secret';
  });

  describe('handleRazorpayWebhook', () => {
    it('should return 400 if x-razorpay-signature header is missing', async () => {
      await runHandler(handleRazorpayWebhook, req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Missing webhook signature configuration',
      }));
    });

    it('should return 400 if signature does not match expected signature', async () => {
      req.headers['x-razorpay-signature'] = 'invalid-sig';
      req.body = { event: 'payment.captured' };
      req.rawBody = JSON.stringify(req.body);

      await runHandler(handleRazorpayWebhook, req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Invalid signature',
      }));
    });

    it('should process payment.captured event and trigger shipment', async () => {
      const body = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              order_id: 'rzp_order_123',
              id: 'rzp_pay_123',
            },
          },
        },
      };
      const rawBody = JSON.stringify(body);
      const signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      req.headers['x-razorpay-signature'] = signature;
      req.body = body;
      req.rawBody = rawBody;

      const mockOrder = {
        orderNumber: 'ORD-123',
        paymentStatus: 'pending',
        orderStatus: 'pending',
        paymentResult: {},
        statusHistory: [],
        save: jest.fn().mockResolvedValue(true),
      };

      mockOrderFindOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockOrder),
        }),
      });

      await runHandler(handleRazorpayWebhook, req, res, next);

      expect(mockOrder.paymentStatus).toBe('paid');
      expect(mockOrder.orderStatus).toBe('processing');
      expect(mockOrder.paymentResult.razorpayPaymentId).toBe('rzp_pay_123');
      expect(mockOrder.save).toHaveBeenCalled();
      expect(processOrderShipment).toHaveBeenCalledWith(mockOrder);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('handleShiprocketWebhook', () => {
    it('should return 400 if order_id and awb are both missing', async () => {
      req.body = { current_status: 'DELIVERED' };
      await runHandler(handleShiprocketWebhook, req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should update order status according to mapped Shiprocket status', async () => {
      req.body = {
        current_status: 'OUT FOR DELIVERY',
        order_id: 'ORD-123',
      };

      const mockOrder = {
        orderNumber: 'ORD-123',
        orderStatus: 'shipped',
        statusHistory: [],
        save: jest.fn().mockResolvedValue(true),
      };

      mockOrderFindOne.mockResolvedValue(mockOrder);

      await runHandler(handleShiprocketWebhook, req, res, next);

      expect(mockOrderFindOne).toHaveBeenCalledWith(expect.objectContaining({
        $or: [{ orderNumber: 'ORD-123' }, { awbCode: undefined }],
      }));
      expect(mockOrder.orderStatus).toBe('outForDelivery');
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
