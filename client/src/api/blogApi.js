import axiosInstance from './axios';

export const blogApi = {
  getBlogs: async (params) => {
    const response = await axiosInstance.get('/blogs', { params });
    return response.data;
  },
  getBlog: async (slug) => {
    const response = await axiosInstance.get(`/blogs/${slug}`);
    return response.data;
  },
  getCategories: async () => {
    const response = await axiosInstance.get('/blogs/categories');
    return response.data;
  },
  getTags: async () => {
    const response = await axiosInstance.get('/blogs/tags');
    return response.data;
  },
  getComments: async (blogId) => {
    const response = await axiosInstance.get(`/blogs/${blogId}/comments`);
    return response.data;
  },
  createComment: async (blogId, commentData) => {
    const response = await axiosInstance.post(`/blogs/${blogId}/comments`, commentData);
    return response.data;
  }
};
