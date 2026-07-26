import Refund from '../models/Refund.js';
import Order from '../models/Order.js';
import razorpayInstance from '../config/razorpay.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';

// @desc    Process refund for a returned order
// @route   POST /api/v1/refunds/:orderId
// @access  Admin
export const processRefund = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (!['returned', 'returnApproved'].includes(order.orderStatus)) {
    throw new AppError('Order is not eligible for refund', 400);
  }

  if (!order.paymentResult?.razorpayPaymentId) {
    throw new AppError('No payment ID found for this order', 400);
  }

  // Check if refund already exists
  const existingRefund = await Refund.findOne({ order: order._id, status: { $in: ['processing', 'completed'] } });
  if (existingRefund) {
    throw new AppError('Refund already initiated for this order', 400);
  }

  const { reason, description } = req.body;
  const refundAmount = order.totalAmount * 100; // Razorpay expects paise

  // Create refund record
  const refund = await Refund.create({
    order: order._id,
    user: order.user,
    razorpayPaymentId: order.paymentResult.razorpayPaymentId,
    amount: order.totalAmount,
    reason: reason || 'customer_request',
    description: description || '',
    status: 'processing',
    processedBy: req.user._id,
  });

  try {
    // Call Razorpay Refund API
    const razorpayRefund = await razorpayInstance.payments.refund(
      order.paymentResult.razorpayPaymentId,
      {
        amount: refundAmount,
        speed: 'normal',
        notes: {
          orderId: order.orderNumber,
          reason: reason || 'customer_request',
        },
      }
    );

    // Update refund record with Razorpay refund ID
    refund.razorpayRefundId = razorpayRefund.id;
    refund.status = 'completed';
    refund.processedAt = new Date();
    await refund.save();

    // Update order status
    order.orderStatus = 'refundCompleted';
    order.paymentStatus = 'refunded';
    order.statusHistory.push({
      status: 'refundCompleted',
      note: `Refund of ₹${order.totalAmount} processed. Razorpay Refund ID: ${razorpayRefund.id}`,
    });
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: { refund, razorpayRefund },
    });
  } catch (razorpayError) {
    // Razorpay API failed — mark refund as failed
    refund.status = 'failed';
    refund.adminNote = razorpayError.message || 'Razorpay API error';
    await refund.save();

    order.orderStatus = 'refundProcessing';
    order.statusHistory.push({
      status: 'refundProcessing',
      note: `Refund failed: ${razorpayError.message}`,
    });
    await order.save();

    throw new AppError(`Razorpay refund failed: ${razorpayError.message}`, 500);
  }
});

// @desc    Get all refunds (admin)
// @route   GET /api/v1/refunds/admin/all
// @access  Admin
export const getAllRefunds = asyncHandler(async (req, res) => {
  const refunds = await Refund.find()
    .populate('order', 'orderNumber totalAmount orderStatus')
    .populate('user', 'name email')
    .populate('processedBy', 'name')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({ success: true, data: refunds });
});

// @desc    Get refund by ID
// @route   GET /api/v1/refunds/:id
// @access  Admin
export const getRefund = asyncHandler(async (req, res) => {
  const refund = await Refund.findById(req.params.id)
    .populate('order', 'orderNumber totalAmount items shippingAddress')
    .populate('user', 'name email')
    .populate('processedBy', 'name');

  if (!refund) {
    throw new AppError('Refund not found', 404);
  }

  res.status(200).json({ success: true, data: refund });
});
