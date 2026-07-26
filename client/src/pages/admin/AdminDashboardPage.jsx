import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import Loader from '../../components/common/Loader';
import { FiDollarSign, FiShoppingBag, FiUsers, FiBox, FiTrendingUp } from 'react-icons/fi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="glass-card p-6 rounded-2xl flex items-start justify-between bg-dark-surface border border-dark-border"
  >
    <div>
      <p className="text-text-muted text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-display font-bold text-text mb-2">{value}</h3>
      {trend !== undefined && (
        <div className={`flex items-center text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          <FiTrendingUp className={`mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
          <span>{Math.abs(trend)}% from last month</span>
        </div>
      )}
    </div>
    <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20">
      <Icon className="w-6 h-6 text-primary" />
    </div>
  </motion.div>
);

const AdminDashboardPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: adminApi.getAnalytics,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="text-red-400 text-center py-10">
        Failed to load analytics data.
      </div>
    );
  }

  const { stats, salesData, topProducts } = data.data;

  // Format currency
  const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats?.totalRevenue || 0)} 
          icon={FiDollarSign} 
          trend={12.5}
          index={0}
        />
        <StatCard 
          title="Total Orders" 
          value={stats?.totalOrders || 0} 
          icon={FiShoppingBag} 
          trend={8.2}
          index={1}
        />
        <StatCard 
          title="Active Users" 
          value={stats?.totalUsers || 0} 
          icon={FiUsers} 
          trend={-2.4}
          index={2}
        />
        <StatCard 
          title="Total Products" 
          value={stats?.totalProducts || 0} 
          icon={FiBox} 
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-2 glass-card p-6 rounded-2xl"
        >
          <h3 className="text-lg font-semibold text-text mb-6">Revenue Overview</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-dark-border)" vertical={false} />
                <XAxis dataKey="_id" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-dark-surface)', border: '1px solid var(--color-dark-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-primary)' }}
                />
                <Area type="monotone" dataKey="totalSales" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="glass-card p-6 rounded-2xl flex flex-col"
        >
          <h3 className="text-lg font-semibold text-text mb-6">Top Selling Products</h3>
          <div className="flex-1 space-y-4 overflow-y-auto">
            {topProducts?.map((product, index) => (
              <div key={product._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-surface transition-colors">
                <div className="w-12 h-12 rounded-lg bg-dark-bg overflow-hidden flex-shrink-0">
                  <img 
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/48'} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-text truncate">{product.title}</h4>
                  <p className="text-xs text-text-muted mt-1">{formatCurrency(product.price)}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-md">
                    {product.sold || 0} Sold
                  </span>
                </div>
              </div>
            ))}
            {(!topProducts || topProducts.length === 0) && (
              <p className="text-text-muted text-sm text-center mt-10">No sales data yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
