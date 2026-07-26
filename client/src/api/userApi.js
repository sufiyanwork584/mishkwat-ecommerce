import axiosInstance from './axios';

export const userApi = {
  getAddresses: async () => {
    const response = await axiosInstance.get('/users/addresses');
    return response.data;
  },
  addAddress: async (addressData) => {
    const response = await axiosInstance.post('/users/addresses', addressData);
    return response.data;
  },
  updateAddress: async (id, addressData) => {
    const response = await axiosInstance.put(`/users/addresses/${id}`, addressData);
    return response.data;
  },
  deleteAddress: async (id) => {
    const response = await axiosInstance.delete(`/users/addresses/${id}`);
    return response.data;
  },
  updateAvatar: async (formData) => {
    const response = await axiosInstance.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  lookupPincode: async (code) => {
    const response = await axiosInstance.get(`/pincode/${code}`);
    return response.data;
  },
};
