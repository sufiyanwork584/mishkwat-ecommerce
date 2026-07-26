import crypto from 'crypto';
import razorpayInstance from '../config/razorpay.js';

/**
 * Create a Razorpay order
 */
export const createRazorpayOrder = async (amount, currency = 'INR', receipt = '') => {
  const options = {
    amount: Math.round(amount * 100), // Razorpay expects amount in paise
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
  };
  const order = await razorpayInstance.orders.create(options);
  return order;
};

/**
 * Verify Razorpay payment signature
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};
