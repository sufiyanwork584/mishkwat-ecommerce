import Wishlist from '../models/Wishlist.js';
import Cart from '../models/Cart.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'title price salePrice images avgRating stock isActive');
  res.json({ success: true, data: { wishlist: wishlist || { products: [] } } });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }
  await wishlist.populate('products', 'title price salePrice images avgRating stock');
  res.json({ success: true, message: 'Added to wishlist', data: { wishlist } });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) throw new AppError('Wishlist not found', 404);
  wishlist.products = wishlist.products.filter((id) => id.toString() !== req.params.productId);
  await wishlist.save();
  await wishlist.populate('products', 'title price salePrice images avgRating stock');
  res.json({ success: true, message: 'Removed from wishlist', data: { wishlist } });
});

export const moveToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  // Add to cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  if (itemIndex === -1) cart.items.push({ product: productId, quantity: 1 });
  await cart.save();
  // Remove from wishlist
  await Wishlist.findOneAndUpdate({ user: req.user._id }, { $pull: { products: productId } });
  res.json({ success: true, message: 'Moved to cart' });
});
