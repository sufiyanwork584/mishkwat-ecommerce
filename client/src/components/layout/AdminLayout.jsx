import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/authSlice';
import AdminSidebar from './AdminSidebar';
import { FiMenu, FiBell, FiUser } from 'react-icons/fi';

const AdminLayout = () => {
  const isMobile = () => window.innerWidth < 768;
  const [collapsed, setCollapsed] = useState(isMobile());
  const user = useSelector(selectUser);
  const location = useLocation();

  // Collapse sidebar by default on mobile; keep expanded on desktop
  useEffect(() => {
    const handleResize = () => {
      if (!isMobile() && collapsed) {
        // Do nothing – let user control on desktop
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  // On mobile, close sidebar when route changes
  useEffect(() => {
    if (isMobile()) setCollapsed(true);
  }, [location.pathname]);

  const sidebarOpen = !collapsed; // sidebar is visible

  // Map pathnames to readable page titles
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) return 'Dashboard Overview';
    if (path.includes('/admin/products')) return 'Product Inventory';
    if (path.includes('/admin/categories')) return 'Categories & Taxonomies';
    if (path.includes('/admin/orders')) return 'Order Management';
    if (path.includes('/admin/coupons')) return 'Discount Coupons';
    if (path.includes('/admin/users')) return 'User Accounts';
    if (path.includes('/admin/reviews')) return 'Review Moderation';
    if (path.includes('/admin/banners')) return 'Promotional Banners';
    if (path.includes('/admin/analytics')) return 'Business Analytics';
    return 'Admin Control Panel';
  };

  return (
    <div className="dark min-h-screen bg-dark-bg text-gray-100 flex relative">
      {/* Mobile backdrop overlay – closes sidebar on click */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Panel – offset by sidebar width on desktop */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Top Header */}
        <header className="h-16 md:h-20 border-b border-dark-border bg-dark-surface/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2.5 rounded-xl hover:bg-dark-card text-text-muted hover:text-text transition-all duration-200"
              aria-label="Toggle Sidebar"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <h1 className="text-base md:text-xl font-display font-semibold tracking-wide text-text truncate">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Notification Bell */}
            <button
              className="relative p-2.5 rounded-xl hover:bg-dark-card text-text-muted hover:text-text transition-all duration-200"
              aria-label="Notifications"
            >
              <FiBell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full glow-accent"></span>
            </button>

            {/* Profile Info */}
            <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-dark-border">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary p-[1px] flex-shrink-0">
                <div className="w-full h-full rounded-xl bg-dark-surface flex items-center justify-center overflow-hidden">
                  {user?.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-5 h-5 text-primary-light" />
                  )}
                </div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-text">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-text-muted capitalize">{user?.role || 'Administrator'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
