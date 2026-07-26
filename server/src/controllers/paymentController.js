import Order from "../models/Order.js";
import {
  asyncHandler,
  AppError,
} from "../middleware/errorMiddleware.js";

import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from "../services/razorpayService.js";
import { processOrderShipment } from "../services/shipmentService.js";

/* ==========================================================
   CREATE PAYMENT ORDER
========================================================== */

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
  }).populate("items.product");

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.paymentStatus === "paid") {
    throw new AppError("Order already paid", 400);
  }

  const razorpayOrder = await createRazorpayOrder(
    order.totalAmount,
    "INR",
    order.orderNumber
  );

  order.paymentResult = {
    razorpayOrderId: razorpayOrder.id,
  };

  await order.save({
    validateBeforeSave: false,
  });

  res.status(200).json({
    success: true,
    data: {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  });
});

/* ==========================================================
   VERIFY PAYMENT
========================================================== */

export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body;

  const verified = verifyRazorpaySignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!verified) {
    throw new AppError("Payment verification failed", 400);
  }

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
  })
    .populate("items.product")
    .populate("user", "email");

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Prevent duplicate payment and shipment processing
  if (order.paymentStatus === "paid") {
    return res.status(200).json({
      success: true,
      message: "Payment already verified",
      data: { order },
    });
  }

  order.paymentStatus = "paid";
  order.orderStatus = "processing";

  order.paymentResult = {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  };

  order.statusHistory.push({
    status: "processing",
    note: "Payment received successfully",
  });

  await order.save();

  // Trigger Shiprocket shipment creation (non-blocking, logged internally on failure)
  await processOrderShipment(order);

  res.status(200).json({
    success: true,
    message:
      "Payment verified successfully",
    data: {
      order,
    },
  });
});