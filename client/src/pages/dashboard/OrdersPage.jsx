import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../api/orderApi';
import { FiShoppingBag, FiChevronLeft } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';

const getStatusColorClass = (status) => {
  const map = {
    pending: 'status-pending',
    processing: 'status-processing',
    packed: 'status-processing',
    shipped: 'status-shipped',
    outfordelivery: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled'
  };
  return map[status?.toLowerCase()] || '';
};

const OrdersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: ordersResult, isLoading } = useQuery({
    queryKey: ['my-orders', { page: currentPage, limit }],
    queryFn: () => orderApi.getMyOrders({ page: currentPage, limit }),
    placeholderData: (previousData) => previousData
  });

  const ordersData = ordersResult?.data || { orders: [], pagination: { page: 1, limit: 10, total: 0, pages: 1 } };
  const orders = ordersData.orders || [];
  const pagination = ordersData.pagination;

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-background text-text py-6 text-left space-y-6  p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors mb-2">
            <FiChevronLeft /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-text">Order History</h1>
          <p className="text-xs text-text-muted mt-1">Review all your placed orders and tracking status.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 border border-white/5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-text-muted mx-auto text-2xl mb-4">
            <FiShoppingBag />
          </div>
          <h2 className="text-xl font-bold text-text mb-2">No Orders Placed Yet</h2>
          <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto">
            Once you place orders, they will show up here with tracking details and invoice downloads.
          </p>
          <Link to="/products">
            <Button variant="primary">Explore Products</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border border-white/5 rounded-2xl bg-dark-surface/10 relative">
            <div className="overflow-x-auto pb-2 -mb-2">
              <table className="w-full text-sm text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/5 bg-surface/20 text-text-muted font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Items count</th>
                    <th className="px-6 py-4">Grand Total</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Shipping Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors table-row">
                      <td className="px-6 py-4 font-mono text-text-muted select-all font-semibold text-xs">
                        #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-text-muted whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-text-muted whitespace-nowrap">
                        {order.items?.reduce((sum, item) => sum + item.quantity, 0)} Items
                      </td>
                      <td className="px-6 py-4 font-bold font-[Outfit] text-text whitespace-nowrap">
                        ₹{new Intl.NumberFormat('en-IN').format(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 text-[9px] uppercase font-bold rounded-full ${
                          order.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full ${getStatusColorClass(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Link to={`/dashboard/orders/${order._id}`}>
                          <Button variant="outline" size="sm" className="text-xs py-1.5 px-3">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
