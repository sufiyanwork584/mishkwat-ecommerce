import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiTrash2, FiShoppingCart, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

import { wishlistApi } from '../../api/wishlistApi';
import { cartApi } from '../../api/cartApi';
import { setWishlist, selectWishlistItems } from '../../features/wishlistSlice';
import { setCart } from '../../features/cartSlice';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Rating from '../../components/common/Rating';

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const WishlistPage = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistItems);
  const [isLoading, setIsLoading] = useState(true);
  const [actingItemId, setActingItemId] = useState(null);

  const fetchWishlist = async () => {
    try {
      const res = await wishlistApi.getWishlist();
      dispatch(setWishlist(res.data));
    } catch {
      toast.error('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    setActingItemId(productId);
    try {
      await wishlistApi.removeFromWishlist(productId);
      const res = await wishlistApi.getWishlist();
      dispatch(setWishlist(res.data));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setActingItemId(null);
    }
  };

  const handleMoveToCart = async (productId) => {
    setActingItemId(productId);
    try {
      await wishlistApi.moveToCart(productId);
      
      // Sync local cart & wishlist states
      const [wishRes, cartRes] = await Promise.all([
        wishlistApi.getWishlist(),
        cartApi.getCart()
      ]);
      dispatch(setWishlist(wishRes.data));
      dispatch(setCart(cartRes.data.cart));
      
      toast.success('Moved item to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to move item to cart');
    } finally {
      setActingItemId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background">
        <Loader size="lg" />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container-custom section min-h-[70vh] flex flex-col items-center justify-center bg-background text-left">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md glass-card rounded-3xl p-8 border border-white/5"
        >
          <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-[#FD79A8] mx-auto text-2xl animate-pulse-glow">
            <FiHeart />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-extrabold text-text">Your Wishlist is Empty</h2>
            <p className="text-text-muted text-sm">
              Save your favorite devices, smart upgrades, and pro peripherals to buy them later.
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
        <h1 className="text-3xl font-display font-extrabold text-text mb-8">My Wishlist</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {wishlistItems.map((product) => {
              if (!product) return null;
              const effectivePrice = product.salePrice > 0 && product.salePrice < product.price ? product.salePrice : product.price;
              const discountPercent = product.salePrice > 0 && product.salePrice < product.price
                ? Math.round(((product.price - product.salePrice) / product.price) * 100)
                : 0;

              return (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card rounded-2xl overflow-hidden flex flex-col h-full relative"
                >
                  {actingItemId === product._id && (
                    <div className="absolute inset-0 bg-dark-bg/60 backdrop-blur-[1px] z-20 flex items-center justify-center">
                      <Loader size="sm" />
                    </div>
                  )}

                  {/* Image Area */}
                  <div className="relative aspect-square bg-dark-surface overflow-hidden flex items-center justify-center p-4">
                    {discountPercent > 0 && (
                      <span className="absolute top-3 left-3 badge-discount z-10">
                        -{discountPercent}%
                      </span>
                    )}

                    <img src={product.images?.[0]?.url} alt={product.title} className="max-h-full object-contain" />

                    <button
                      onClick={() => handleRemove(product._id)}
                      className="absolute top-3 right-3 p-2 rounded-full glass hover:bg-red-500/20 text-text-muted hover:text-red-400 transition-colors"
                      aria-label="Remove item"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>

                  {/* Info details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-secondary tracking-widest">{product.brand}</span>
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="font-display font-bold text-text text-sm line-clamp-2 hover:text-primary-light transition-colors">
                          {product.title}
                        </h3>
                      </Link>
                      <div>
                        <Rating value={product.avgRating || 0} size={12} text={`(${product.numReviews})`} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-text font-[Outfit]">{formatPrice(effectivePrice)}</span>
                        {discountPercent > 0 && (
                          <span className="text-xs text-text-muted line-through font-[Outfit]">{formatPrice(product.price)}</span>
                        )}
                      </div>

                      <Button
                        onClick={() => handleMoveToCart(product._id)}
                        disabled={product.stock <= 0}
                        variant="primary"
                        size="sm"
                        fullWidth
                        className="py-2.5 flex items-center justify-center gap-2"
                      >
                        <FiShoppingCart /> Move to Cart
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
