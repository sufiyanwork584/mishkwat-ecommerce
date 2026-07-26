import axiosInstance from './axios';

export const orderApi = {
  createOrder: async (orderData) => {
    const response = await axiosInstance.post('/orders', orderData);
    return response.data;
  },
  getMyOrders: async (params) => {
    const response = await axiosInstance.get('/orders/my-orders', { params });
    return response.data;
  },
  getOrder: async (id) => {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
  },
  cancelOrder: async (id, reason) => {
    const response = await axiosInstance.put(`/orders/${id}/cancel`, { reason });
    return response.data;
  },
  downloadInvoice: async (id) => {
    const response = await axiosInstance.get(`/orders/${id}/invoice`, { responseType: 'blob' });
    return response.data;
  },
  getAllOrders: async (params) => {
    const response = await axiosInstance.get('/orders/admin/all', { params });
    return response.data;
  },
  updateOrderStatus: async (id, statusData) => {
    const response = await axiosInstance.put(`/orders/${id}/status`, statusData);
    return response.data;
  },

  // Shiprocket Shipping Integrations
  trackShipment: async (orderId) => {
    const response = await axiosInstance.get(`/shipment/track/${orderId}`);
    return response.data;
  },
  refreshShipment: async (orderId) => {
    const response = await axiosInstance.post(`/shipment/refresh/${orderId}`);
    return response.data;
  },
  downloadShiprocketLabel: async (orderId) => {
    const response = await axiosInstance.get(`/shipment/label/${orderId}`);
    return response.data;
  },
  downloadShiprocketInvoice: async (orderId) => {
    const response = await axiosInstance.get(`/shipment/invoice/${orderId}`);
    return response.data;
  },
  generateShiprocketManifest: async (orderId) => {
    const response = await axiosInstance.post(`/shipment/manifest/${orderId}`);
    return response.data;
  },
  getShipmentStatus: async (orderId) => {
    const response = await axiosInstance.get(`/shipment/status/${orderId}`);
    return response.data;
  },
  cancelShipment: async (orderId) => {
    const response = await axiosInstance.post(`/shipment/cancel/${orderId}`);
    return response.data;
  },
  createShipment: async (orderId) => {
    const response = await axiosInstance.post(`/shipment/create/${orderId}`);
    return response.data;
  }
};
