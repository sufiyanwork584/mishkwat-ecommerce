import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiShoppingBag, FiChevronRight, FiPercent } from 'react-icons/fi';
import toast from 'react-hot-toast';

import { cartApi } from '../../api/cartApi';
import { setCart, selectCartItems, selectCartCount } from '../../features/cartSlice';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { FREE_DELIVERY_THRESHOLD, DEFAULT_SHIPPING_CHARGE } from '../../utils/constants';

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cartItems = useSelector(selectCartItems);
  const cartCount = useSelector(selectCartCount);
  
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const fetchCart = async () => {
    try {
      const res = await cartApi.getCart();
      dispatch(setCart(res.data.cart));
    } catch {
      toast.error('Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (productId, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty < 1) return;
    
    setUpdatingItemId(productId);
    try {
      const res = await cartApi.updateCartItem(productId, newQty);
      dispatch(setCart(res.data.cart));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    setUpdatingItemId(productId);
    try {
      const res = await cartApi.removeFromCart(productId);
      dispatch(setCart(res.data.cart));
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.salePrice > 0 && item.product?.salePrice < item.product?.price
      ? item.product.salePrice
      : item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DEFAULT_SHIPPING_CHARGE;
  const grandTotal = subtotal + tax + shipping;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background">
        <Loader size="lg" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-custom section min-h-[70vh] flex flex-col items-center justify-center bg-background text-left">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md glass-card rounded-3xl p-8 border border-white/5"
        >
          <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-text-muted mx-auto text-2xl">
            <FiShoppingBag />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-extrabold text-text">Your Cart is Empty</h2>
            <p className="text-text-muted text-sm">
              Explore our wide variety of premium, tested gear and find the perfect addition for your home.
            </p>
          </div>
          <Link to="/products" className="block">
            <Button variant="primary" fullWidth>
              Explore Products
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-background text-text min-h-screen py-8 text-left">
      <div className="container-custom">
        <h1 className="text-3xl font-display font-extrabold text-text mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Item Cards list */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;
                const effectivePrice = product.salePrice > 0 && product.salePrice < product.price ? product.salePrice : product.price;

                return (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col sm:flex-row gap-5 items-center relative overflow-hidden"
                  >
                    {updatingItemId === product._id && (
                      <div className="absolute inset-0 bg-dark-bg/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <Loader size="sm" />
                      </div>
                    )}

                    <div className="w-24 h-24 bg-surface/40 rounded-xl overflow-hidden p-1.5 flex-shrink-0 flex items-center justify-center">
                      <img src={product.images?.[0]?.url} alt={product.title} className="max-h-full object-contain" />
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-secondary tracking-widest">{product.brand}</span>
                      <h3 className="font-display font-bold text-text text-base truncate">{product.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-text font-[Outfit]">{formatPrice(effectivePrice)}</span>
                        {product.salePrice > 0 && product.salePrice < product.price && (
                          <span className="text-xs text-text-muted line-through font-[Outfit]">{formatPrice(product.price)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4 sm:gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                      {/* Quantity Toggles */}
                      <div className="flex items-center border border-slate-700 bg-surface/40 rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(product._id, item.quantity, -1)}
                          disabled={item.quantity <= 1}
                          className="px-3 py-1 text-text-muted hover:text-text disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="px-3.5 text-xs font-bold text-text">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(product._id, item.quantity, 1)}
                          disabled={item.quantity >= product.stock}
                          className="px-3 py-1 text-text-muted hover:text-text disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right min-w-[80px]">
                        <span className="text-base font-bold text-text font-[Outfit]">
                          {formatPrice(effectivePrice * item.quantity)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(product._id)}
                        className="text-text-muted hover:text-red-400 transition-colors p-2 ml-auto sm:ml-0"
                        aria-label="Remove item"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Checkout Totals Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-6 sticky top-24">
              <h3 className="text-lg font-display font-extrabold text-text">Order Summary</h3>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="font-semibold text-text font-[Outfit]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Tax (GST 18%)</span>
                  <span className="font-semibold text-text font-[Outfit]">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Shipping</span>
                  <span className={`font-semibold font-[Outfit] ${shipping === 0 ? 'text-green-400' : 'text-text'}`}>
                    {shipping === 0 ? 'FREE (Free Delivery Applied)' : formatPrice(shipping)}
                  </span>
                </div>

                {shipping > 0 && (
                  <p className="text-[10px] text-secondary font-medium mt-1">
                    💡 Add {formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} more for FREE shipping!
                  </p>
                )}

                <hr className="border-white/5 my-2" />

                <div className="flex justify-between text-base">
                  <span className="font-bold text-text">Estimated Total</span>
                  <span className="font-extrabold text-text font-[Outfit]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/checkout')}
                  variant="primary"
                  fullWidth
                  className="py-3 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <FiChevronRight />
                </Button>
                <Link to="/products" className="block text-center text-xs text-text-muted hover:text-text transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
