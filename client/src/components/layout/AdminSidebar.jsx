import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/authSlice';
import { 
  FiGrid, 
  FiBox, 
  FiFolder, 
  FiShoppingBag, 
  FiTag, 
  FiUsers, 
  FiMessageSquare, 
  FiImage, 
  FiTrendingUp, 
  FiArrowLeft,
  FiLogOut,
  FiX,
  FiFileText,
  FiPercent
} from 'react-icons/fi';

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  const dispatch = useDispatch();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
    { name: 'Products', path: '/admin/products', icon: FiBox },
    { name: 'Categories', path: '/admin/categories', icon: FiFolder },
    { name: 'Orders', path: '/admin/orders', icon: FiShoppingBag },
    { name: 'Blogs', path: '/admin/blogs', icon: FiFileText },
    { name: 'Coupons', path: '/admin/coupons', icon: FiTag },
    { name: 'Users', path: '/admin/users', icon: FiUsers },
    { name: 'Reviews', path: '/admin/reviews', icon: FiMessageSquare },
    { name: 'Banners', path: '/admin/banners', icon: FiImage },
    { name: 'Deals', path: '/admin/deals', icon: FiPercent },
    { name: 'Analytics', path: '/admin/analytics', icon: FiTrendingUp },
  ];

  return (
    <motion.aside
      className={`fixed top-0 left-0 h-full z-40 bg-dark-surface border-r border-dark-border flex flex-col justify-between transition-all duration-300 ${
        collapsed 
          ? '-translate-x-full md:translate-x-0 md:w-20' 
          : 'translate-x-0 w-64'
      }`}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-dark-border">
          {!collapsed && (
            <div className="flex items-center justify-between w-full">
              <NavLink to="/admin/dashboard" className="flex items-center gap-2">
                <span className="font-serif font-semibold text-2xl text-primary">
                  Mishkwat
                </span>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary-light font-bold">
                  Admin
                </span>
              </NavLink>
              <button 
                onClick={() => setCollapsed(true)} 
                className="md:hidden p-2 text-text-muted hover:text-text rounded-lg hover:bg-dark-card transition-colors"
                aria-label="Close sidebar"
              >
                <FiX size={18} />
              </button>
            </div>
          )}
          {collapsed && (
            <span className="font-serif font-semibold text-2xl text-primary mx-auto">
              M
            </span>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group border-l-2 ${
                    isActive
                      ? 'bg-primary/10 text-primary border-primary font-semibold shadow-sm shadow-primary/5'
                      : 'border-transparent text-text-muted hover:bg-dark-card hover:text-text'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-sans tracking-wide">
                    {item.name}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-dark-border space-y-2">
        <NavLink
          to="/"
          className="flex items-center gap-4 px-4 py-3 rounded-xl text-text-muted hover:bg-dark-card hover:text-text transition-all duration-200"
        >
          <FiArrowLeft className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Main Site</span>}
        </NavLink>
        <button
          onClick={() => dispatch(logout())}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <FiLogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
