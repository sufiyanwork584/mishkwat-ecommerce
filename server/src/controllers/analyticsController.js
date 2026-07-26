import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalOrders, totalRevenue, totalUsers, totalProducts,
    monthOrders, monthRevenue, lastMonthRevenue,
    pendingOrders, deliveredOrders, lowStockProducts,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.countDocuments({ orderStatus: 'pending' }),
    Order.countDocuments({ orderStatus: 'delivered' }),
    Product.countDocuments({ stock: { $lt: 10 }, isActive: true }),
  ]);

  const currentMonthRev = monthRevenue[0]?.total || 0;
  const lastMonthRev = lastMonthRevenue[0]?.total || 0;
  const revenueGrowth = lastMonthRev > 0 ? ((currentMonthRev - lastMonthRev) / lastMonthRev) * 100 : 0;

  res.json({
    success: true,
    data: {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders, totalUsers, totalProducts,
      monthOrders, monthRevenue: currentMonthRev,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      pendingOrders, deliveredOrders, lowStockProducts,
    },
  });
});

export const getSalesChart = asyncHandler(async (req, res) => {
  const period = req.query.period || 'daily';
  const startDate = new Date();
  
  let dateFormat = '%Y-%m-%d';
  let daysToSubtract = 30;

  if (period === 'monthly') {
    dateFormat = '%Y-%m'; // Format: YYYY-MM
    daysToSubtract = 365; // Show past year
  } else if (period === 'weekly') {
    dateFormat = '%Y-W%V'; // Format: YYYY-Www (ISO Week)
    daysToSubtract = 90; // Show past 90 days
  } else {
    // daily
    dateFormat = '%Y-%m-%d';
    daysToSubtract = 30;
  }

  startDate.setDate(startDate.getDate() - daysToSubtract);

  const sales = await Order.aggregate([
    { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ success: true, data: sales });
});

export const getTopProducts = asyncHandler(async (req, res) => {
  const topProducts = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        title: { $first: '$items.title' },
        price: { $first: '$items.price' },
        sold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    // Populate product details (like images) from the products collection
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        title: { $ifNull: ['$productDetails.title', '$title'] },
        price: { $ifNull: ['$productDetails.price', '$price'] },
        images: '$productDetails.images',
        sold: 1,
        revenue: 1,
      },
    },
    { $sort: { sold: -1 } },
    { $limit: 5 }, // Only show the true top 5 selling products
  ]);
  res.json({ success: true, data: { topProducts } });
});

export const getTopCategories = asyncHandler(async (req, res) => {
  const topCategories = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products', localField: 'items.product', foreignField: '_id', as: 'productInfo',
      },
    },
    { $unwind: '$productInfo' },
    {
      $lookup: {
        from: 'categories', localField: 'productInfo.category', foreignField: '_id', as: 'categoryInfo',
      },
    },
    { $unwind: '$categoryInfo' },
    {
      $group: {
        _id: '$categoryInfo._id',
        name: { $first: '$categoryInfo.name' },
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 8 },
  ]);
  res.json({ success: true, data: { topCategories } });
});
