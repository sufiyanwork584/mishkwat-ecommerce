import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import Loader from '../../components/common/Loader';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiCalendar } from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#6C5CE7', '#00CEC9', '#FD79A8', '#0984e3', '#fdcb6e', '#e17055', '#a29bfe', '#55efc4'];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e272e] border border-[#2f3640] rounded-lg px-4 py-3 shadow-xl">
      <p className="text-text-muted text-xs mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-text text-sm font-semibold">
          {entry.name}: {typeof entry.value === 'number' && entry.value > 100 ? formatCurrency(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

const AdminAnalyticsPage = () => {
  const [period, setPeriod] = useState('monthly');

  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: adminApi.getAnalytics,
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['adminSalesChart', period],
    queryFn: () => adminApi.getSalesChart(period),
  });

  if (dashLoading) {
    return <div className="flex justify-center items-center min-h-[400px]"><Loader size="lg" /></div>;
  }

  const stats = dashData?.data?.stats || {};
  const topProducts = dashData?.data?.topProducts || [];
  const chartData = salesData?.data || dashData?.data?.salesData || [];

  // Build pie data from top products
  const pieData = topProducts.slice(0, 6).map((p, i) => ({
    name: p.title?.substring(0, 20) || `Product ${i + 1}`,
    value: p.sold || p.totalSold || 1,
  }));

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-text">Business Analytics</h2>
        <div className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-xl p-1">
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-all capitalize ${
                period === p ? 'bg-primary text-text shadow-lg' : 'text-text-muted hover:text-text'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue || 0), icon: FiDollarSign, color: 'from-[#6C5CE7] to-[#a29bfe]' },
          { label: 'Total Orders', value: stats.totalOrders || 0, icon: FiShoppingBag, color: 'from-[#00CEC9] to-[#81ecec]' },
          { label: 'Avg Order Value', value: formatCurrency(stats.totalOrders ? (stats.totalRevenue || 0) / stats.totalOrders : 0), icon: FiTrendingUp, color: 'from-[#FD79A8] to-[#fab1a0]' },
          { label: 'This Month', value: formatCurrency(chartData?.[chartData.length - 1]?.totalSales || 0), icon: FiCalendar, color: 'from-[#0984e3] to-[#74b9ff]' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-text-muted text-xs font-medium">{stat.label}</span>
              <div className={`p-2 rounded-lg bg-gradient-to-tr ${stat.color}`}>
                <stat.icon className="w-4 h-4 text-text" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-text">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-text mb-6">Sales Trend</h3>
          <div className="h-[300px]">
            {salesLoading ? (
              <div className="flex items-center justify-center h-full"><Loader size="md" /></div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">No chart data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00CEC9" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#00CEC9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3436" vertical={false} />
                  <XAxis dataKey="_id" stroke="#636e72" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#636e72" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="totalSales" name="Revenue" stroke="#6C5CE7" strokeWidth={2.5} fill="url(#salesGrad)" />
                  <Area type="monotone" dataKey="orderCount" name="Orders" stroke="#00CEC9" strokeWidth={2.5} fill="url(#ordersGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Product Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-text mb-6">Top Products</h3>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-gray-500 text-sm">No data</div>
          ) : (
            <>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {pieData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-300 truncate">{entry.name}</span>
                    <span className="ml-auto text-gray-500 font-mono">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Top Products Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-text mb-6">Top Selling Products</h3>
        <div className="h-[300px]">
          {topProducts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">No sales data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts.slice(0, 8).map(p => ({ name: p.title?.substring(0, 18) || 'N/A', sold: p.sold || p.totalSold || 0, revenue: p.revenue || p.price * (p.sold || 0) }))} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3436" vertical={false} />
                <XAxis dataKey="name" stroke="#636e72" fontSize={10} tickLine={false} axisLine={false} angle={-30} textAnchor="end" />
                <YAxis stroke="#636e72" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sold" name="Units Sold" radius={[6, 6, 0, 0]}>
                  {topProducts.slice(0, 8).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalyticsPage;
