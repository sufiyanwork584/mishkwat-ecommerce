import axiosInstance from './axios';

export const reviewApi = {
  getProductReviews: async (productId, params) => {
    const response = await axiosInstance.get(`/reviews/${productId}`, { params });
    return response.data;
  },
  createReview: async (productId, reviewData) => {
    const response = await axiosInstance.post(`/reviews/${productId}`, reviewData);
    return response.data;
  },
  deleteReview: async (reviewId) => {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);
    return response.data;
  }
};
