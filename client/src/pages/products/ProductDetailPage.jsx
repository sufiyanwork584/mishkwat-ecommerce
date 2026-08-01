import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiCheck, FiInfo, FiTrash2, FiMessageSquare, FiTruck } from 'react-icons/fi';
import { FaHeart, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { productApi } from '../../api/productApi';
import { cartApi } from '../../api/cartApi';
import { wishlistApi } from '../../api/wishlistApi';
import { reviewApi } from '../../api/reviewApi';
import { setCart } from '../../features/cartSlice';
import { setWishlist, selectIsInWishlist } from '../../features/wishlistSlice';
import { selectIsAuthenticated } from '../../features/authSlice';

import Rating from '../../components/common/Rating';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import ProductCard from '../../components/product/ProductCard';
import SEO from '../../components/common/SEO';
import { FREE_DELIVERY_THRESHOLD } from '../../utils/constants';

const ProductDetailPage = () => {
  const { id: slug } = useParams(); // URL parameter :id is defined as slug in routes
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product detail
  const { data: productResult, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getProduct(slug)
  });

  const product = productResult?.data?.product;
  const isInWishlist = useSelector(selectIsInWishlist(product?._id));

  // Fetch reviews using product._id
  const { data: reviewsResult, isLoading: loadingReviews } = useQuery({
    queryKey: ['reviews', product?._id],
    queryFn: () => reviewApi.getProductReviews(product._id),
    enabled: !!product?._id
  });

  const reviews = reviewsResult?.data?.reviews || [];

  // Fetch related products
  const { data: relatedResult, isLoading: loadingRelated } = useQuery({
    queryKey: ['products', 'related', product?._id],
    queryFn: () => productApi.getRelatedProducts(product._id),
    enabled: !!product?._id
  });

  const relatedProducts = relatedResult?.data?.products || [];

  const handleWishlistToggle = async () => {
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
      toast.error('Wishlist action failed');
    }
  };

  const handleAddToCart = async (directCheckout = false) => {
    if (!isAuthenticated) return toast.error('Please login to add to cart');
    try {
      await cartApi.addToCart(product._id, quantity);
      const res = await cartApi.getCart();
      dispatch(setCart(res.data.cart));
      toast.success('Added to cart');
      if (directCheckout) {
        navigate('/cart');
      }
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment');
      return;
    }
    
    setSubmittingReview(true);
    try {
      await reviewApi.createReview(product._id, {
        rating: reviewRating,
        comment: reviewComment
      });
      toast.success('Review submitted successfully! It will appear once approved by moderator.');
      setReviewComment('');
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ['reviews', product._id] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-custom section min-h-screen text-text-muted space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="w-full aspect-square rounded-3xl" />
          <div className="space-y-6">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom section min-h-[70vh] flex flex-col items-center justify-center">
        <FiInfo className="w-16 h-16 text-text-muted mb-4" />
        <h2 className="text-2xl font-bold text-text mb-2">Product Not Found</h2>
        <p className="text-text-muted mb-6">The requested product could not be retrieved.</p>
        <Link to="/products">
          <Button variant="primary">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const discountPercent = product.salePrice && product.salePrice < product.price
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const effectivePrice = discountPercent > 0 ? product.salePrice : product.price;

  const handleBulkOrder = () => {
    const whatsappNum = import.meta.env.VITE_ADMIN_PHONE || '917770032919';
    const message = `Hello Mishkwat,\n\nI want to place a bulk order.\n\nProduct:\n${product.title}\n\nProduct Link:\n${window.location.href}\n\nPlease share your wholesale pricing.`;
    window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-background text-text py-8 min-h-screen">
      <SEO 
        title={product.title} 
        description={product.description} 
        image={product.images?.[0]?.url} 
        keywords={`${product.title}, ${product.brand}, ${product.category?.name || 'products'}`}
      />
      <div className="container-custom">
        {/* Main Product Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start text-left">
          
          {/* Images Section */}
          <div className="space-y-4">
            <div className="glass-card rounded-3xl overflow-hidden p-6 aspect-square flex items-center justify-center bg-dark-surface/40 relative">
              {discountPercent > 0 && (
                <span className="absolute top-6 left-6 badge-discount z-10 text-xs px-3 py-1.5 rounded-full">
                  -{discountPercent}% OFF
                </span>
              )}
              <img
                src={product.images?.[activeImageIdx]?.url || 'https://via.placeholder.com/600'}
                alt={product.title}
                className="max-h-full object-contain rounded-2xl w-full h-full"
              />
            </div>
            
            {/* Thumbnails row */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-2">
                {product.images.map((img, idx) => (
                  <button
                    key={img.publicId || idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-20 rounded-xl bg-surface/40 border p-1.5 flex-shrink-0 transition-all ${
                      idx === activeImageIdx ? 'border-primary ring-2 ring-primary/20' : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-contain rounded-lg" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Specifications & Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-secondary flex-wrap">
                <Link to={`/products?category=${product.category?.slug}`} className="hover:text-primary transition-colors">
                  {product.category?.name || product.category}
                </Link>
                {product.subcategory && (
                  <>
                    <span className="text-white/20">/</span>
                    <Link to={`/products?category=${product.subcategory?.slug}`} className="hover:text-primary transition-colors">
                      {product.subcategory?.name || product.subcategory}
                    </Link>
                  </>
                )}
                <span className="text-white/20">/</span>
                <span>{product.brand}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-text leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 pt-1">
                <Rating value={product.avgRating || 0} size={16} />
                <span className="text-sm text-text-muted font-medium">
                  {product.numReviews || 0} customer reviews
                </span>
              </div>
            </div>

            <hr className="border-white/5" />

            {/* Price display */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold font-[Outfit] text-text">₹{new Intl.NumberFormat('en-IN').format(effectivePrice)}</span>
                {discountPercent > 0 && (
                  <span className="text-lg text-text-muted line-through font-[Outfit]">₹{new Intl.NumberFormat('en-IN').format(product.price)}</span>
                )}
              </div>
              <p className="text-xs text-text-muted font-medium">Inclusive of all local taxes</p>
            </div>

            <p className="text-text-muted text-sm leading-relaxed">
              {product.description}
            </p>

            {/* Quantity Selector & Checkout Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <span className="text-sm font-semibold text-text-muted">Quantity</span>
                <div className="flex items-center border border-slate-700 bg-surface/50 rounded-lg overflow-hidden">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(prev => prev - 1)}
                    className="px-3.5 py-1.5 text-text-muted hover:text-text disabled:opacity-30 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-bold text-text">{quantity}</span>
                  <button
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="px-3.5 py-1.5 text-text-muted hover:text-text disabled:opacity-30 transition-colors"
                  >
                    +
                  </button>
                </div>
                {product.stock > 0 ? (
                  <span className="text-xs text-green-400 font-semibold bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/10 mt-2 sm:mt-0">
                    In Stock ({product.stock} units)
                  </span>
                ) : (
                  <span className="text-xs text-red-400 font-semibold bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/10 mt-2 sm:mt-0">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Row: Add to Cart | Buy Now | Wishlist */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  onClick={() => handleAddToCart(false)}
                  disabled={product.stock <= 0}
                  variant="primary"
                  className="flex-1 py-3.5 flex items-center justify-center gap-2"
                >
                  <FiShoppingCart className="w-5 h-5" /> Add to Cart
                </Button>
                <Button
                  onClick={() => handleAddToCart(true)}
                  disabled={product.stock <= 0}
                  variant="secondary"
                  className="flex-1 py-3.5 flex items-center justify-center gap-2"
                >
                  Buy Now
                </Button>
                <button
                  onClick={handleWishlistToggle}
                  className={`px-4 rounded-xl border flex items-center justify-center transition-all ${
                    isInWishlist
                      ? 'border-[#FD79A8] bg-[#FD79A8]/10 text-[#FD79A8]'
                      : 'border-slate-700 hover:bg-white/5 text-text-muted'
                  }`}
                  aria-label="Wishlist"
                >
                  {isInWishlist ? <FaHeart className="w-5 h-5" /> : <FiHeart className="w-5 h-5" />}
                </button>
              </div>

              {/* Bulk Order — full width below */}
              <button
                onClick={handleBulkOrder}
                className="w-full py-2.5 px-3 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all text-[11px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5"
              >
                <span>Bulk Order</span>
              </button>
            </div>

            {/* Free Delivery Info */}
            <div className="flex items-center gap-2 pt-2 text-sm">
              <FiTruck className="text-green-400 w-4 h-4 flex-shrink-0" />
              <span className="text-text-muted">
                Free Delivery on orders above <span className="font-bold text-green-400">₹{FREE_DELIVERY_THRESHOLD}</span>
              </span>
            </div>

            {/* Specifications Details */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="pt-4 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">Technical Details</h3>
                <div className="border border-white/5 rounded-xl overflow-hidden bg-dark-surface/10">
                  <table className="w-full text-sm text-left">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-semibold text-text-muted w-1/3">{spec.key}</td>
                          <td className="px-4 py-3 text-text">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Reviews Moderation & Submission Section */}
        <div className="mt-20 border-t border-white/5 pt-12 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Reviews list */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="text-2xl font-display font-extrabold text-text flex items-center gap-3">
                <FiMessageSquare className="text-primary-light" /> Product Reviews ({reviews.length})
              </h3>
              
              {loadingReviews ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 border border-white/5 text-center">
                  <p className="text-text-muted font-semibold mb-1">No reviews yet</p>
                  <p className="text-sm text-text-muted">Be the first to review this product and share your thoughts.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="glass-card rounded-2xl p-5 border border-white/5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-text">{rev.user?.name || 'Customer'}</p>
                          <span className="text-[10px] text-text-muted">
                            {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex text-yellow-400 text-xs">
                          {[...Array(rev.rating)].map((_, i) => <FaStar key={i} />)}
                        </div>
                      </div>
                      <p className="text-sm text-text-muted leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review Form */}
            <div className="lg:col-span-5 glass-card rounded-3xl p-6 border border-white/5 space-y-4">
              <h4 className="text-lg font-display font-bold text-text">Write a Customer Review</h4>
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-muted mb-1.5">Rating Score</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <button
                          key={stars}
                          type="button"
                          onClick={() => setReviewRating(stars)}
                          className="text-2xl transition-transform hover:scale-110"
                        >
                          <FaStar className={stars <= reviewRating ? 'text-yellow-400' : 'text-slate-700'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="review-comment-box" className="block text-sm font-semibold text-text-muted mb-1.5">Comment</label>
                    <textarea
                      id="review-comment-box"
                      rows="4"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience using this product..."
                      className="w-full bg-surface/50 border border-slate-700 rounded-xl text-text placeholder-slate-500 p-3.5 text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={submittingReview}
                  >
                    Submit Review
                  </Button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-text-muted mb-4">You must be signed in to post a product review.</p>
                  <Link to="/login">
                    <Button variant="outline" size="sm">Sign In</Button>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-white/5 pt-12 text-left">
            <h3 className="text-2xl font-display font-extrabold text-text mb-8">Related Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailPage;
