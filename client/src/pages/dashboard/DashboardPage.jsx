import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/authSlice';
import { orderApi } from '../../api/orderApi';
import { FiShoppingBag, FiTruck, FiBox, FiCreditCard, FiArrowRight, FiUser } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

const getStatusColorClass = (status) => {
  const map = {
    pending: 'status-pending',
    processing: 'status-processing',
    shipped: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled'
  };
  return map[status?.toLowerCase()] || '';
};

const DashboardPage = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const { data: ordersResult, isLoading } = useQuery({
    queryKey: ['my-orders', { limit: 100 }],
    queryFn: () => orderApi.getMyOrders({ limit: 100 })
  });

  const orders = ordersResult?.data?.orders || [];

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.orderStatus?.toLowerCase())).length;
  const completedOrders = orders.filter(o => o.orderStatus?.toLowerCase() === 'delivered').length;
  
  const totalSpent = orders
    .filter(o => o.paymentStatus?.toLowerCase() === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-background text-text py-6 text-left">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-[1px]">
              <div className="w-full h-full rounded-2xl bg-dark-surface flex items-center justify-center text-text text-xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-text">Hello, {user?.name || 'Customer'}</h1>
              <p className="text-xs text-text-muted mt-1">Manage your account profile, addresses, and order history.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard/profile">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 py-2">
                <FiUser /> Settings
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="primary" size="sm" className="flex items-center gap-1.5 py-2">
                Start Shopping <FiArrowRight />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary-light flex items-center justify-center border border-primary/20">
              <FiShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-[Outfit] text-text">{totalOrders}</p>
              <p className="text-xs text-text-muted font-medium">Total Orders</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#00CEC9]/10 text-[#00CEC9] flex items-center justify-center border border-[#00CEC9]/20">
              <FiCreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-[Outfit] text-text">₹{new Intl.NumberFormat('en-IN').format(totalSpent)}</p>
              <p className="text-xs text-text-muted font-medium">Total Spent</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FDCB6E]/10 text-[#FDCB6E] flex items-center justify-center border border-[#FDCB6E]/20">
              <FiTruck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-[Outfit] text-text">{pendingOrders}</p>
              <p className="text-xs text-text-muted font-medium">Pending Delivery</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#00B894]/10 text-[#00B894] flex items-center justify-center border border-[#00B894]/20">
              <FiBox className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-[Outfit] text-text">{completedOrders}</p>
              <p className="text-xs text-text-muted font-medium">Delivered Orders</p>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-extrabold text-text">Recent Orders</h2>
            {totalOrders > 5 && (
              <Link to="/dashboard/orders" className="text-xs text-secondary hover:underline flex items-center gap-1 font-bold">
                View All <FiArrowRight />
              </Link>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 border border-white/5 text-center">
              <p className="text-text-muted font-semibold mb-2">You haven't placed any orders yet</p>
              <Link to="/products">
                <Button variant="primary" size="sm">Explore Products</Button>
              </Link>
            </div>
          ) : (
            <div className="border border-white/5 rounded-2xl bg-dark-surface/10 relative">
              <div className="overflow-x-auto pb-2 -mb-2">
                <table className="w-full text-sm text-left min-w-[650px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-surface/20 text-text-muted font-semibold text-xs uppercase tracking-wider">
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Items</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Order Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order._id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors table-row">
                        <td className="px-6 py-4 font-mono text-text-muted select-all font-semibold text-xs">
                          #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-text-muted whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-text-muted whitespace-nowrap">{order.items?.reduce((sum, item) => sum + item.quantity, 0)} Items</td>
                        <td className="px-6 py-4 font-bold font-[Outfit] text-text whitespace-nowrap">
                          ₹{new Intl.NumberFormat('en-IN').format(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full ${getStatusColorClass(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <Link to={`/dashboard/orders/${order._id}`}>
                            <Button variant="outline" size="sm" className="text-xs py-1.5 px-3">
                              Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
