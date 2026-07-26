import axiosInstance from './axios';

export const adminApi = {
  // Categories
  getCategories: async () => {
    const response = await axiosInstance.get('/categories');
    return response.data;
  },
  getAdminCategories: async () => {
    const response = await axiosInstance.get('/categories/admin');
    return response.data;
  },
  createCategory: async (data) => {
    const response = await axiosInstance.post('/categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  updateCategory: async (id, data) => {
    const response = await axiosInstance.put(`/categories/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  },
  getCategoriesWithSubs: async () => {
    const response = await axiosInstance.get('/categories/admin');
    return response.data;
  },
  getCategory: async (slug) => {
    const response = await axiosInstance.get(`/categories/${slug}`);
    return response.data;
  },

  // Coupons
  getCoupons: async () => {
    const response = await axiosInstance.get('/coupons');
    return response.data;
  },
  createCoupon: async (data) => {
    const response = await axiosInstance.post('/coupons', data);
    return response.data;
  },
  updateCoupon: async (id, data) => {
    const response = await axiosInstance.put(`/coupons/${id}`, data);
    return response.data;
  },
  deleteCoupon: async (id) => {
    const response = await axiosInstance.delete(`/coupons/${id}`);
    return response.data;
  },

  // Reviews
  getReviews: async (params) => {
    const response = await axiosInstance.get('/reviews/admin/all', { params });
    return response.data;
  },
  updateReviewStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/reviews/admin/${id}/moderate`, { status });
    return response.data;
  },
  deleteReview: async (id) => {
    const response = await axiosInstance.delete(`/reviews/${id}`);
    return response.data;
  },

  // Banners
  getBanners: async () => {
    const response = await axiosInstance.get('/banners?admin=true');
    return response.data;
  },
  createBanner: async (data) => {
    const response = await axiosInstance.post('/banners', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  updateBanner: async (id, data) => {
    const response = await axiosInstance.put(`/banners/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  deleteBanner: async (id) => {
    const response = await axiosInstance.delete(`/banners/${id}`);
    return response.data;
  },

  // Deals
  getDeals: async () => {
    const response = await axiosInstance.get('/deals?admin=true');
    return response.data;
  },
  createDeal: async (data) => {
    const response = await axiosInstance.post('/deals', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  updateDeal: async (id, data) => {
    const response = await axiosInstance.put(`/deals/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  deleteDeal: async (id) => {
    const response = await axiosInstance.delete(`/deals/${id}`);
    return response.data;
  },

  // Users
  getUsers: async (params) => {
    const response = await axiosInstance.get('/users', { params });
    return response.data;
  },
  blockUser: async (id) => {
    const response = await axiosInstance.patch(`/users/${id}/block`);
    return response.data;
  },
  unblockUser: async (id) => {
    const response = await axiosInstance.patch(`/users/${id}/unblock`);
    return response.data;
  },

  // Analytics
  getAnalytics: async () => {
    const [dashboardRes, salesRes, productsRes] = await Promise.all([
      axiosInstance.get('/analytics/dashboard'),
      axiosInstance.get('/analytics/sales-chart?days=30'),
      axiosInstance.get('/analytics/top-products')
    ]);
    return {
      success: true,
      data: {
        stats: dashboardRes.data.data,
        salesData: salesRes.data.data.sales,
        topProducts: productsRes.data.data.topProducts
      }
    };
  },
  getSalesChart: async (period) => {
    const response = await axiosInstance.get('/analytics/sales-chart', { params: { period } });
    return response.data;
  },

  // Newsletter
  getSubscribers: async () => {
    const response = await axiosInstance.get('/newsletter');
    return response.data;
  },
};
