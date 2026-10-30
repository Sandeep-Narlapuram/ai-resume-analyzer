import axiosInstance from './axiosInstance.js';

export const analysisApi = {
  create: (payload) => axiosInstance.post('/analyses', payload),
  getById: (id) => axiosInstance.get(`/analyses/${id}`),
  list: (params) => axiosInstance.get('/analyses', { params }),
  remove: (id) => axiosInstance.delete(`/analyses/${id}`),
  compare: (id, otherId) => axiosInstance.get(`/analyses/${id}/compare/${otherId}`),
  reportData: (id) => axiosInstance.get(`/analyses/${id}/report-data`),
};
