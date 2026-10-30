import axiosInstance from './axiosInstance.js';

export const resumeApi = {
  upload: (formData, onUploadProgress) =>
    axiosInstance.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  list: () => axiosInstance.get('/resumes'),
  getById: (id) => axiosInstance.get(`/resumes/${id}`),
  remove: (id) => axiosInstance.delete(`/resumes/${id}`),
};
