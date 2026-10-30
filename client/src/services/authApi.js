import axiosInstance from './axiosInstance.js';

export const authApi = {
  register: (payload) => axiosInstance.post('/auth/register', payload),
  login: (payload) => axiosInstance.post('/auth/login', payload),
  logout: () => axiosInstance.post('/auth/logout'),
  refresh: () => axiosInstance.post('/auth/refresh'),
  forgotPassword: (payload) => axiosInstance.post('/auth/forgot-password', payload),
  resetPassword: (payload) => axiosInstance.post('/auth/reset-password', payload),
  me: () => axiosInstance.get('/auth/me'),
  updateProfile: (payload) => axiosInstance.patch('/auth/me', payload),
  changePassword: (payload) => axiosInstance.patch('/auth/password', payload),
  deleteAccount: (payload) => axiosInstance.delete('/auth/me', { data: payload }),
};
