import axiosInstance from './axios';

export const paymentApi = {
  createOrder: async (orderId) => {
    const response = await axiosInstance.post('/payments/create-order', { orderId });
    return response.data;
  },
  verifyPayment: async (paymentData) => {
    const response = await axiosInstance.post('/payments/verify', paymentData);
    return response.data;
  }
};
