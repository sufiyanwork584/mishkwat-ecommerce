import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { selectIsDarkMode } from './features/uiSlice';
import { selectUser, selectAccessToken, selectIsAuthenticated, setAccessToken, logout } from './features/authSlice';
import { clearCartState, setCart } from './features/cartSlice';
import { clearWishlistState, setWishlist } from './features/wishlistSlice';
import { cartApi } from './api/cartApi';
import { wishlistApi } from './api/wishlistApi';
import Loader from './components/common/Loader';
import ErrorBoundary from './components/common/ErrorBoundary';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import GuestRoute from './routes/GuestRoute';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

// Lazy-loaded public/user pages
const HomePage = lazy(() => import('./pages/home/HomePage'));
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/products/ProductDetailPage'));
const SearchResultsPage = lazy(() => import('./pages/products/SearchResultsPage'));
const CategoryPage = lazy(() => import('./pages/products/CategoryPage'));
const CategoriesPage = lazy(() => import('./pages/products/CategoriesPage'));
const CartPage = lazy(() => import('./pages/cart/CartPage'));
const AboutPage = lazy(() => import('./pages/static/AboutPage'));
const ContactPage = lazy(() => import('./pages/static/ContactPage'));
const FAQPage = lazy(() => import('./pages/static/FAQPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/static/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/static/TermsPage'));
const ReturnPolicyPage = lazy(() => import('./pages/static/ReturnPolicyPage'));
const ShippingPolicyPage = lazy(() => import('./pages/static/ShippingPolicyPage'));
const BlogsPage = lazy(() => import('./pages/blogs/BlogsPage'));
const BlogDetailPage = lazy(() => import('./pages/blogs/BlogDetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Lazy-loaded auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Lazy-loaded protected pages
const WishlistPage = lazy(() => import('./pages/wishlist/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'));
const PaymentSuccessPage = lazy(() => import('./pages/checkout/PaymentSuccessPage'));
const PaymentFailedPage = lazy(() => import('./pages/checkout/PaymentFailedPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const OrdersPage = lazy(() => import('./pages/dashboard/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/dashboard/OrderDetailPage'));
const AddressesPage = lazy(() => import('./pages/dashboard/AddressesPage'));
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'));

// Lazy-loaded admin pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'));
const AdminBannersPage = lazy(() => import('./pages/admin/AdminBannersPage'));
const AdminDealsPage = lazy(() => import('./pages/admin/AdminDealsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminBlogsPage = lazy(() => import('./pages/admin/AdminBlogsPage'));

// Scroll to top on route change helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const App = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(selectIsDarkMode);
  const user = useSelector(selectUser);
  const accessToken = useSelector(selectAccessToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // When the user becomes authenticated, sync the cart and wishlist with the server
  // so the badges reflect the real counts instead of a stale/persisted value.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const syncUserState = async () => {
      try {
        const [cartRes, wishlistRes] = await Promise.all([
          cartApi.getCart(),
          wishlistApi.getWishlist(),
        ]);
        if (!cancelled) {
          if (cartRes?.data?.cart) dispatch(setCart({ items: cartRes.data.cart.items }));
          if (wishlistRes?.data?.wishlist) dispatch(setWishlist({ wishlist: wishlistRes.data.wishlist }));
        }
      } catch (error) {
        // Ignore sync failures — badges will fall back to current state
      }
    };
    syncUserState();
    return () => { cancelled = true; };
  }, [isAuthenticated, dispatch]);

  // On every app startup, verify user session and clear stale guest data
  useEffect(() => {
    const initializeSession = async () => {
      // Helper: decode JWT to check expiration
      const isTokenExpired = (token) => {
        if (!token) return true;
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.exp * 1000 < Date.now();
        } catch (e) {
          return true;
        }
      };

      // CASE 1: No user at all — clear any leftover cart/wishlist from a previous session
      if (!user) {
        dispatch(clearCartState());
        dispatch(clearWishlistState());
        return;
      }

      // CASE 2: User exists but token is expired — try to refresh
      if (isTokenExpired(accessToken)) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );
          dispatch(setAccessToken(response.data.data.accessToken));
        } catch (error) {
          // Refresh failed — full logout and wipe all stale data
          dispatch(logout());
          dispatch(clearCartState());
          dispatch(clearWishlistState());
        }
      }
    };

    initializeSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader size="lg" />
        </div>
      }>
        <Routes>
          {/* Public Website Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/cart" element={<CartPage />} />
            
            {/* Static Content Routes */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/returns" element={<ReturnPolicyPage />} />
            <Route path="/shipping" element={<ShippingPolicyPage />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />

            {/* Guest Only Routes (Login, Signup, Recovery) */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            </Route>

            {/* Authenticated Customer Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              <Route path="/payment-failed" element={<PaymentFailedPage />} />
              
              {/* User Dashboard Section */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/orders" element={<OrdersPage />} />
              <Route path="/dashboard/orders/:id" element={<OrderDetailPage />} />
              <Route path="/dashboard/addresses" element={<AddressesPage />} />
              <Route path="/dashboard/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Protected Administrative Dashboard Routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/blogs" element={<AdminBlogsPage />} />
              <Route path="/admin/coupons" element={<AdminCouponsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/reviews" element={<AdminReviewsPage />} />
              <Route path="/admin/banners" element={<AdminBannersPage />} />
              <Route path="/admin/deals" element={<AdminDealsPage />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            </Route>
          </Route>

          {/* Catch-all Fallback (404 Not Found) */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
