import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { calculateOrderTotals } from '../utils/helpers.js';
import { sendEmail } from '../services/emailService.js';
import { orderConfirmationTemplate, shippingUpdateTemplate } from '../utils/emailTemplates.js';
import { generateInvoice } from '../services/invoiceService.js';
import { PAGINATION, PRICING_CONFIG } from '../utils/constants.js';

/** POST /api/v1/orders */
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddressId, paymentMethod = 'razorpay', couponCode } = req.body;

  const user = await User.findById(req.user._id);
  const address = user.addresses.id(shippingAddressId);
  if (!address) throw new AppError('Address not found', 404);

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) throw new AppError('Cart is empty', 400);

  // Validate stock and build items
  const items = [];
  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) throw new AppError(`Product ${product?.title || item.product} is not available`, 400);
    if (product.stock < item.quantity) throw new AppError(`Insufficient stock for ${product.title}`, 400);
    items.push({
      product: product._id,
      title: product.title,
      image: product.images[0]?.url || '',
      price: product.salePrice > 0 && product.salePrice < product.price ? product.salePrice : product.price,
      quantity: item.quantity,
    });
  }

  // Calculate totals
  let discount = 0;
  let appliedCoupon = null;
  const itemsSubtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingFee = itemsSubtotal >= PRICING_CONFIG.FREE_DELIVERY_THRESHOLD ? 0 : PRICING_CONFIG.DEFAULT_SHIPPING_CHARGE;
  const { subtotal, tax, shippingCost, totalAmount } = calculateOrderTotals(items, shippingFee);

  // Manual coupon logic
  let manualCoupon = null;
  let manualDiscount = 0;
  if (couponCode) {
    if (paymentMethod === 'cod') {
      throw new AppError('Coupons are not applicable for Cash on Delivery orders', 400);
    }
    manualCoupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (manualCoupon) {
      const validity = manualCoupon.isValid(subtotal);
      if (validity.valid) {
        manualDiscount = manualCoupon.calculateDiscount(subtotal);
      } else {
        manualCoupon = null;
      }
    }
  }

  // Auto coupon logic (only for online payments)
  let bestAutoCoupon = null;
  let bestAutoDiscount = 0;
  if (paymentMethod === 'razorpay') {
    const activeCoupons = await Coupon.find({ isActive: true });
    for (const c of activeCoupons) {
      const validity = c.isValid(subtotal);
      if (validity.valid) {
        const d = c.calculateDiscount(subtotal);
        if (d > bestAutoDiscount) {
          bestAutoDiscount = d;
          bestAutoCoupon = c;
        }
      }
    }
  }

  // Apply the best discount (manual vs auto)
  if (bestAutoDiscount > manualDiscount && bestAutoCoupon) {
    appliedCoupon = bestAutoCoupon;
    discount = bestAutoDiscount;
  } else if (manualCoupon) {
    appliedCoupon = manualCoupon;
    discount = manualDiscount;
  }

  const finalTotal = Math.max(totalAmount - discount, 0);

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress: {
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      area: address.area || '',
      region: address.region || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    },
    paymentMethod,
    subtotal,
    tax,
    shippingCost,
    discount: discount,
    totalAmount: finalTotal,
    couponCode: appliedCoupon?.code || couponCode?.toUpperCase() || '',
  });

  // Atomically check and deduct stock for each item to prevent race conditions
  const deductedItems = [];
  try {
    for (const item of items) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity }, isActive: true },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updatedProduct) {
        throw new AppError(`Insufficient stock or item unavailable for "${item.title}"`, 400);
      }
      deductedItems.push(item);
    }
  } catch (error) {
    // Revert stock for any items already deducted before error occurred
    for (const item of deductedItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
    throw error;
  }

  // Update coupon usage
  if (appliedCoupon && discount > 0) {
    await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });
  }

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  // Send confirmation email
  sendEmail({ to: user.email, subject: 'Order Confirmed - Mishkwat', html: orderConfirmationTemplate(order) });

  res.status(201).json({ success: true, message: 'Order placed successfully', data: { order } });
});

/** GET /api/v1/orders/my-orders */
export const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments({ user: req.user._id }),
  ]);
  res.json({ success: true, data: { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

/** GET /api/v1/orders/:id */
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new AppError('Order not found', 404);
  res.json({ success: true, data: { order } });
});

/** GET /api/v1/orders (Admin) */
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, data: { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

/** PUT /api/v1/orders/:id/status (Admin) */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'email name');
  if (!order) throw new AppError('Order not found', 404);

  order.orderStatus = status;
  order.statusHistory.push({ status, note: note || '' });
  if (status === 'delivered') order.deliveredAt = new Date();

  await order.save();

  // Send shipping update email
  sendEmail({ to: order.user.email, subject: `Order Update - ${order.orderNumber}`, html: shippingUpdateTemplate(order, status) });

  res.json({ success: true, message: 'Order status updated', data: { order } });
});

/** PUT /api/v1/orders/:id/cancel */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new AppError('Order not found', 404);
  if (!['pending', 'processing'].includes(order.orderStatus)) {
    throw new AppError('Order cannot be cancelled at this stage', 400);
  }
  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason || 'Cancelled by customer';
  order.statusHistory.push({ status: 'cancelled', note: order.cancelReason });

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
  await order.save();
  res.json({ success: true, message: 'Order cancelled', data: { order } });
});

/** GET /api/v1/orders/:id/invoice */
export const downloadInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new AppError('Order not found', 404);
  const pdfBuffer = await generateInvoice(order);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.orderNumber}.pdf"`);
  res.send(pdfBuffer);
});
