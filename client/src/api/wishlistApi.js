import axiosInstance from './axios';

export const wishlistApi = {
  getWishlist: async () => {
    const response = await axiosInstance.get('/wishlist');
    return response.data;
  },
  addToWishlist: async (productId) => {
    const response = await axiosInstance.post('/wishlist/add', { productId });
    return response.data;
  },
  removeFromWishlist: async (productId) => {
    const response = await axiosInstance.delete(`/wishlist/item/${productId}`);
    return response.data;
  },
  moveToCart: async (productId) => {
    const response = await axiosInstance.post('/wishlist/move-to-cart', { productId });
    return response.data;
  }
};
