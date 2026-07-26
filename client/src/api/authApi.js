import axiosInstance from './axios';

export const authApi = {
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  googleLogin: async (credential) => {
    const response = await axiosInstance.post('/auth/google', { credential });
    return response.data;
  },
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token, password) => {
    const response = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },
  updateProfile: async (userData) => {
    const response = await axiosInstance.put('/auth/update-profile', userData);
    return response.data;
  },
  changePassword: async (passwordData) => {
    const response = await axiosInstance.put('/auth/change-password', passwordData);
    return response.data;
  },
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  }
};
