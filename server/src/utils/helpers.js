import jwt from 'jsonwebtoken';

/**
 * Generate JWT access token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

/**
 * Set refresh token as httpOnly cookie
 */
export const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * Clear refresh token cookie
 */
export const clearRefreshTokenCookie = (res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
  });
};

/**
 * Calculate order totals
 */
export const calculateOrderTotals = (items, shippingCost = 0, discount = 0, taxRate = 0.18) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + tax + shippingCost - discount) * 100) / 100;
  return { subtotal, tax, shippingCost, discount, totalAmount: Math.max(total, 0) };
};

/**
 * Build query filter from request params
 */
export const buildProductFilter = (query) => {
  const filter = { isActive: true };

  if (query.category) filter.category = query.category;
  if (query.subcategory) filter.subcategory = query.subcategory;
  if (query.brand) filter.brand = { $regex: query.brand, $options: 'i' };
  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  if (query.rating) {
    filter.avgRating = { $gte: Number(query.rating) };
  }
  if (query.inStock === 'true') {
    filter.stock = { $gt: 0 };
  }

  return filter;
};

/**
 * Build sort option from query
 */
export const buildProductSort = (sortBy) => {
  const sortOptions = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    popularity: { numReviews: -1 },
    rating: { avgRating: -1 },
  };
  return sortOptions[sortBy] || { createdAt: -1 };
};

/**
 * Format price to INR
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};
