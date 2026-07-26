import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiLogOut,
  FiPackage, FiSettings, FiChevronDown, FiGrid, FiSun, FiMoon, FiHome, FiShoppingBag, FiBookOpen,
} from 'react-icons/fi';
import { selectUser, selectIsAuthenticated, selectIsAdmin, logout } from '../../features/authSlice';
import { selectCartCount } from '../../features/cartSlice';
import { selectWishlistCount } from '../../features/wishlistSlice';
import { selectIsDarkMode, toggleDarkMode, toggleMobileMenu, selectIsMobileMenuOpen } from '../../features/uiSlice';
import { clearCartState } from '../../features/cartSlice';
import { clearWishlistState } from '../../features/wishlistSlice';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';

const navLinks = [
  { label: 'Home', path: '/', icon: FiHome },
  { label: 'Shop', path: '/products', icon: FiShoppingBag },
  { label: 'Categories', path: '/categories', icon: FiGrid },
  { label: 'Guides', path: '/blogs', icon: FiBookOpen },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(selectWishlistCount);
  const isMobileMenuOpen = useSelector(selectIsMobileMenuOpen);
  const isDarkMode = useSelector(selectIsDarkMode);

  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    dispatch(toggleMobileMenu(false));
    setIsUserMenuOpen(false);
  }, [location.pathname, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch { /* ignore */ }
    dispatch(logout());
    dispatch(clearCartState());
    dispatch(clearWishlistState());
    setIsUserMenuOpen(false);
    toast.success('Logged out');
    navigate('/');
  };

  const getHijriDate = () => {
    try {
      return new Intl.DateTimeFormat('en-u-ca-islamic', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).format(new Date());
    } catch (e) {
      return '';
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-sm transition-colors duration-300 font-sans">
        {/* Top promo bar */}
        <div className="hidden lg:block bg-primary text-white transition-colors duration-300">
          <div className="container-custom flex items-center justify-between py-1 text-xs font-medium tracking-wide">
            <span className="flex items-center gap-2">
              <span className="text-primary-light">🕋 {getHijriDate()}</span>
              <span className="opacity-50">|</span>
              <span>Welcome to Mishkwat - Premium Islamic Lifestyle</span>
            </span>
            <div className="flex items-center gap-5 uppercase text-[10px] tracking-widest">
              <Link to="/about" className="hover:text-primary-light transition-colors">About Us</Link>
              <Link to="/contact" className="hover:text-primary-light transition-colors">Contact</Link>
              <Link to="/faq" className="hover:text-primary-light transition-colors">FAQ</Link>
            </div>
          </div>
        </div>

        {/* Main navigation header */}
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-[72px] gap-2 md:gap-4">
            {/* Logo and Menu Trigger */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <button
                onClick={() => dispatch(toggleMobileMenu())}
                className="lg:hidden p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>

              <Link to="/" className="flex items-center gap-2">
                <img src="/logo.svg.webp" alt="Mishkwat" className="h-8 md:h-10 w-auto object-contain" />
              </Link>
            </div>

            {/* Desktop Navigation Links (lg+) */}
            <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    location.pathname === link.path
                      ? 'text-primary bg-surface'
                      : 'text-text-muted hover:text-text hover:bg-surface'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Search Bar – only visible on lg+ (desktop) */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-grow max-w-lg mx-4">
              <div className="relative w-full flex">
                <div className="relative flex-grow">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for Hajj products, brands and categories..."
                    className="w-full bg-surface border border-border rounded-l-xl pl-10 pr-4 py-2.5 text-sm text-text placeholder-text-muted focus:border-primary outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white px-6 rounded-r-xl text-sm font-semibold flex items-center gap-1.5 transition-colors border border-primary"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              
              {/* Theme Toggle Button */}
              <button
                onClick={() => dispatch(toggleDarkMode())}
                className="p-2.5 text-text-muted hover:text-primary rounded-lg hover:bg-surface transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>

              {/* Search icon – visible on sm and md screens (not lg+) */}
              <button
                onClick={() => navigate('/products')}
                className="lg:hidden p-2.5 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors"
                aria-label="Search"
              >
                <FiSearch size={20} />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2.5 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors"
                aria-label="Wishlist"
              >
                <FiHeart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors"
                aria-label="Cart"
              >
                <FiShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-primary rounded-full">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <FiChevronDown size={14} className={`hidden sm:block transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-xl shadow-2xl overflow-hidden z-[60]"
                      >
                        <div className="p-3 border-b border-border">
                          <p className="text-sm font-semibold text-text truncate">{user?.name}</p>
                          <p className="text-xs text-text-muted truncate">{user?.email}</p>
                        </div>
                        <div className="p-1.5">
                          <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors">
                            <FiGrid size={16} /> Dashboard
                          </Link>
                          <Link to="/dashboard/orders" className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors">
                            <FiPackage size={16} /> My Orders
                          </Link>
                          <Link to="/dashboard/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors">
                            <FiSettings size={16} /> Settings
                          </Link>
                          {isAdmin && (
                            <Link to="/admin/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-sm text-primary hover:bg-surface rounded-lg transition-colors">
                              <FiGrid size={16} /> Admin Panel
                            </Link>
                          )}
                        </div>
                        <div className="p-1.5 border-t border-border">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors w-full text-left"
                          >
                            <FiLogOut size={16} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-semibold transition-colors"
                >
                  <FiUser size={16} />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(toggleMobileMenu())}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-background border-r border-border overflow-y-auto lg:hidden"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-6">
                  <Link to="/" className="flex items-center gap-2">
                    <img src="/logo.svg" alt="Mishkwat" className="h-10 w-auto object-contain" />
                  </Link>
                  <button
                    onClick={() => dispatch(toggleMobileMenu())}
                    className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text placeholder-text-muted outline-none focus:border-primary"
                    />
                  </div>
                </form>

                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                        location.pathname === link.path
                          ? 'text-primary bg-surface'
                          : 'text-text-muted hover:text-text hover:bg-surface'
                      }`}
                    >
                      <link.icon size={18} /> {link.label}
                    </Link>
                  ))}
                </div>

                <hr className="border-border my-4" />

                <div className="space-y-1">
                  <Link to="/about" className="block px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors">About Us</Link>
                  <Link to="/contact" className="block px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors">Contact</Link>
                  <Link to="/faq" className="block px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors">FAQ</Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer: accounts for promo bar (lg only) + main nav height */}
      <div className="h-16 lg:h-[104px]" />
    </>
  );
};

export default Navbar;
