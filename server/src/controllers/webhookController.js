import crypto from 'crypto';
import Order from '../models/Order.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { processOrderShipment } from '../services/shipmentService.js';

/**
 * POST /api/v1/webhooks/razorpay
 * Asynchronous verification for Razorpay payments (Interrupted Session Recovery)
 */
export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

  if (!signature || !webhookSecret) {
    return res.status(400).json({ success: false, message: 'Missing webhook signature configuration' });
  }

  // Validate signature using raw body if available, or JSON stringification
  const rawBody = req.rawBody || JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.warn('⚠️ Invalid Razorpay Webhook Signature');
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const { event, payload } = req.body;

  if (event === 'payment.captured' || event === 'order.paid') {
    const paymentEntity = payload.payment?.entity || payload.order?.entity;
    const razorpayOrderId = paymentEntity?.order_id || paymentEntity?.id;
    const razorpayPaymentId = paymentEntity?.id;

    if (razorpayOrderId) {
      const order = await Order.findOne({ 'paymentResult.razorpayOrderId': razorpayOrderId })
        .populate('items.product')
        .populate('user', 'email');
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.orderStatus = 'processing';
        order.paymentResult = {
          ...order.paymentResult,
          razorpayPaymentId,
        };
        order.statusHistory.push({
          status: 'processing',
          note: 'Payment captured via Razorpay Webhook',
        });
        await order.save();
        console.log(`✅ Order ${order.orderNumber} payment marked as paid via webhook.`);
        
        // Trigger shipment creation
        await processOrderShipment(order);
      }
    }
  }

  res.status(200).json({ success: true, message: 'Webhook processed' });
});

/**
 * POST /api/v1/webhooks/shiprocket
 * Dynamic status tracking for Shiprocket shipments
 */
export const handleShiprocketWebhook = asyncHandler(async (req, res) => {
  const { current_status, order_id, awb } = req.body;

  if (!order_id && !awb) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  const order = await Order.findOne({
    $or: [{ orderNumber: order_id }, { awbCode: awb }],
  });

  if (order) {
    const statusMap = {
      'PICKUP SCHEDULED': 'pickupScheduled',
      'IN TRANSIT': 'shipped',
      'OUT FOR DELIVERY': 'outForDelivery',
      'DELIVERED': 'delivered',
      'CANCELED': 'cancelled',
      'RTO DELIVERED': 'returned',
    };

    const mappedStatus = statusMap[current_status?.toUpperCase()];
    if (mappedStatus && order.orderStatus !== mappedStatus) {
      order.orderStatus = mappedStatus;
      if (mappedStatus === 'delivered') order.deliveredAt = new Date();
      order.statusHistory.push({
        status: mappedStatus,
        note: `Shipment status updated to ${current_status} via Shiprocket webhook`,
      });
      await order.save();
      console.log(`✅ Order ${order.orderNumber} status updated to ${mappedStatus} via Shiprocket.`);
    }
  }

  res.status(200).json({ success: true, message: 'Webhook processed' });
});
