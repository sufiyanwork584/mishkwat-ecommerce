import axiosInstance from './axios';

export const productApi = {
  getProducts: async (params) => {
    const response = await axiosInstance.get('/products', { params });
    return response.data;
  },
  getProduct: async (slug) => {
    const response = await axiosInstance.get(`/products/${slug}`);
    return response.data;
  },
  getFeatured: async () => {
    const response = await axiosInstance.get('/products/featured');
    return response.data;
  },
  getBestSellers: async () => {
    const response = await axiosInstance.get('/products/bestsellers');
    return response.data;
  },
  getNewArrivals: async () => {
    const response = await axiosInstance.get('/products/new-arrivals');
    return response.data;
  },
  getRelatedProducts: async (id) => {
    const response = await axiosInstance.get(`/products/${id}/related`);
    return response.data;
  },
  createProduct: async (productData) => {
    const response = await axiosInstance.post('/products', productData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  updateProduct: async (id, productData) => {
    const response = await axiosInstance.put(`/products/${id}`, productData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  }
};
