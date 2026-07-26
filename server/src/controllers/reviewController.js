import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';

export const getProductReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const reviews = await Review.find({ product: req.params.productId, status: 'approved' })
    .populate('user', 'name avatar').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  const total = await Review.countDocuments({ product: req.params.productId, status: 'approved' });
  res.json({ success: true, data: { reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

export const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  // Check if user has purchased the product
  const hasPurchased = await Order.findOne({
    user: req.user._id, 'items.product': productId, orderStatus: 'delivered',
  });
  if (!hasPurchased) throw new AppError('You can only review products you have purchased and received', 403);

  const existing = await Review.findOne({ user: req.user._id, product: productId });
  if (existing) throw new AppError('You have already reviewed this product', 400);

  const review = await Review.create({ ...req.body, user: req.user._id, product: productId });
  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, message: 'Review submitted for approval', data: { review } });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);

  // Only the owner or an admin can delete the review
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to delete this review', 403);
  }

  await review.deleteOne();

  // Recalculate average rating for the product
  await Review.calculateAvgRating(review.product);

  res.json({ success: true, message: 'Review deleted' });
});

// Admin
export const getAllReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const reviews = await Review.find(filter).populate('user', 'name email').populate('product', 'title')
    .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  const total = await Review.countDocuments(filter);
  res.json({ success: true, data: { reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
});

export const moderateReview = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!review) throw new AppError('Review not found', 404);
  if (status === 'approved' || status === 'rejected') {
    await Review.calculateAvgRating(review.product);
  }
  res.json({ success: true, message: `Review ${status}`, data: { review } });
});
