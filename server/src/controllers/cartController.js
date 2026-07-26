import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'title price salePrice images stock isActive');
  res.json({ success: true, data: { cart: cart || { items: [] } } });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new AppError('Product not found', 404);
  if (product.stock < quantity) throw new AppError('Insufficient stock', 400);

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  if (itemIndex > -1) {
    const newQty = cart.items[itemIndex].quantity + quantity;
    if (newQty > product.stock) throw new AppError('Insufficient stock', 400);
    cart.items[itemIndex].quantity = newQty;
  } else {
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();
  await cart.populate('items.product', 'title price salePrice images stock');
  res.json({ success: true, message: 'Added to cart', data: { cart } });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  if (quantity < 1) throw new AppError('Quantity must be at least 1', 400);

  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);
  if (product.stock < quantity) throw new AppError('Insufficient stock', 400);

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new AppError('Cart not found', 404);

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new AppError('Item not in cart', 404);
  item.quantity = quantity;
  await cart.save();
  await cart.populate('items.product', 'title price salePrice images stock');
  res.json({ success: true, message: 'Cart updated', data: { cart } });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new AppError('Cart not found', 404);
  cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
  await cart.save();
  await cart.populate('items.product', 'title price salePrice images stock');
  res.json({ success: true, message: 'Item removed', data: { cart } });
});

export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, message: 'Cart cleared' });
});
