import axiosInstance from './axios';

export const cartApi = {
  getCart: async () => {
    const response = await axiosInstance.get('/cart');
    return response.data;
  },
  addToCart: async (productId, quantity = 1) => {
    const response = await axiosInstance.post('/cart/add', { productId, quantity });
    return response.data;
  },
  updateCartItem: async (productId, quantity) => {
    const response = await axiosInstance.put('/cart/update', { productId, quantity });
    return response.data;
  },
  removeFromCart: async (productId) => {
    const response = await axiosInstance.delete(`/cart/item/${productId}`);
    return response.data;
  },
  clearCart: async () => {
    const response = await axiosInstance.delete('/cart/clear');
    return response.data;
  }
};
