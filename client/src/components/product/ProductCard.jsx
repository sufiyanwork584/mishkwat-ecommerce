import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiEye } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsInWishlist } from '../../features/wishlistSlice';
import { selectIsAuthenticated } from '../../features/authSlice';
import Rating from '../common/Rating';
import toast from 'react-hot-toast';
import { wishlistApi } from '../../api/wishlistApi';
import { cartApi } from '../../api/cartApi';
import { setWishlist } from '../../features/wishlistSlice';
import { setCart } from '../../features/cartSlice';

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const ProductCard = ({ product, index = 0 }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInWishlist = useSelector(selectIsInWishlist(product._id));

  const effectivePrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const discountPercent = product.salePrice && product.salePrice < product.price
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return toast.error('Please login to add to wishlist');
    try {
      if (isInWishlist) {
        await wishlistApi.removeFromWishlist(product._id);
        toast.success('Removed from wishlist');
      } else {
        await wishlistApi.addToWishlist(product._id);
        toast.success('Added to wishlist');
      }
      const res = await wishlistApi.getWishlist();
      dispatch(setWishlist(res.data));
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return toast.error('Please login to add to cart');
    try {
      await cartApi.addToCart(product._id, 1);
      const res = await cartApi.getCart();
      dispatch(setCart(res.data.cart));
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
  };
  const handleBulkOrder = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const whatsappNum = import.meta.env.VITE_ADMIN_PHONE || '917770032919';
    const message = `Hello Mishkwat,

I want to place a bulk order.

Product:
${product.title}

Product Link:
${window.location.origin}/product/${product.slug}

Please share your wholesale pricing.`;
    window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`, '_blank');
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="product-card group"
    >
      <div onClick={() => navigate(`/product/${product.slug}`)} className="block h-full cursor-pointer">
        <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
          {/* Image */}
          <div className="relative overflow-hidden bg-dark-surface aspect-square">
            <img
              src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
              alt={product.title}
              className="product-image w-full h-full object-cover"
              loading="lazy"
            />

            {/* Discount badge */}
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 badge-discount z-10">
                -{discountPercent}%
              </span>
            )}

            {/* Out of stock */}
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <span className="text-text font-bold text-lg tracking-wider">OUT OF STOCK</span>
              </div>
            )}

            {/* Mobile-friendly actions (always visible on small screens, hover on lg) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none lg:pointer-events-auto">
              <div className="absolute bottom-3 right-3 flex flex-col gap-2 pointer-events-auto">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWishlistToggle}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-text hover:bg-red-500/20 transition-colors"
                >
                  {isInWishlist ? <FaHeart className="text-red-500" size={16} /> : <FiHeart size={16} />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-text hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  <FiShoppingCart size={16} />
                </motion.button>
                <div
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-text hover:bg-accent/20 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiEye size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 flex flex-col flex-grow text-left">
            {/* Brand */}
            <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              {product.brand}
            </span>

            {/* Title */}
            <h3 className="text-sm font-semibold text-text line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>

            {/* Rating */}
            <div className="mb-3">
              <Rating value={product.avgRating || 0} text={`(${product.numReviews || 0})`} size={14} />
            </div>

            {/* Price */}
            <div className="mt-auto flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-text">{formatPrice(effectivePrice)}</span>
                  {discountPercent > 0 && (
                    <span className="text-sm text-text-muted line-through">{formatPrice(product.price)}</span>
                  )}
                </div>
              </div>
              <button
                onClick={handleBulkOrder}
                className="w-full py-2 px-3 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all text-[11px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5"
              >
                <span>Bulk Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
