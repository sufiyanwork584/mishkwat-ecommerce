import Order from '../models/Order.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';

// @desc    Request a return
// @route   POST /api/v1/returns/:orderId
// @access  Private (order owner)
export const requestReturn = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError('Unauthorized', 403);
  }

  if (order.orderStatus !== 'delivered') {
    throw new AppError('Return can only be requested for delivered orders', 400);
  }

  // Check return window (7 days)
  const deliveredDate = order.deliveredAt || order.updatedAt;
  const daysSinceDelivery = (Date.now() - new Date(deliveredDate).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceDelivery > 7) {
    throw new AppError('Return window has expired (7 days)', 400);
  }

  const { reason, images } = req.body;

  order.orderStatus = 'returnRequested';
  order.returnDetails = {
    reason: reason || 'No reason provided',
    images: images || [],
    requestedAt: new Date(),
  };
  order.statusHistory.push({
    status: 'returnRequested',
    note: `Return requested: ${reason}`,
  });

  await order.save();

  res.status(200).json({ success: true, message: 'Return request submitted', data: order });
});

// @desc    Admin approve/reject return
// @route   PATCH /api/v1/returns/:orderId/approve
// @access  Admin
export const approveReturn = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.orderStatus !== 'returnRequested') {
    throw new AppError('No pending return request for this order', 400);
  }

  const { approved, adminNote } = req.body;

  if (approved) {
    order.orderStatus = 'returnApproved';
    order.returnDetails.approvedAt = new Date();
    order.returnDetails.adminNote = adminNote || '';
    order.statusHistory.push({
      status: 'returnApproved',
      note: adminNote || 'Return approved by admin',
    });
  } else {
    // Reject — revert to delivered
    order.orderStatus = 'delivered';
    order.returnDetails.adminNote = adminNote || 'Return rejected by admin';
    order.statusHistory.push({
      status: 'delivered',
      note: `Return rejected: ${adminNote || 'No reason given'}`,
    });
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: approved ? 'Return approved' : 'Return rejected',
    data: order,
  });
});

// @desc    Admin get all return requests
// @route   GET /api/v1/returns/admin/all
// @access  Admin
export const getAllReturns = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    orderStatus: { $in: ['returnRequested', 'returnApproved', 'returned'] },
  })
    .populate('user', 'name email')
    .sort({ updatedAt: -1 })
    .lean();

  res.status(200).json({ success: true, data: orders });
});

// @desc    Mark order as returned (after pickup confirmed)
// @route   PATCH /api/v1/returns/:orderId/returned
// @access  Admin
export const markReturned = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.orderStatus !== 'returnApproved') {
    throw new AppError('Return has not been approved yet', 400);
  }

  order.orderStatus = 'returned';
  order.returnDetails.returnedAt = new Date();
  order.statusHistory.push({
    status: 'returned',
    note: 'Item returned and received',
  });

  await order.save();

  res.status(200).json({ success: true, message: 'Order marked as returned', data: order });
});
