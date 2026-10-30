import axiosInstance from './axiosInstance.js';

export const contactApi = {
  submit: (payload) => axiosInstance.post('/contact', payload),
};
