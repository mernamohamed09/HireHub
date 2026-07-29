import { api } from './api';

export const candidateService = {
  getMyProfile: async () => {
    const response = await api.get('/candidates/me');
    return response.data;
  },

  updateMyProfile: async (data) => {
    const response = await api.put('/candidates/me', data);
    return response.data;
  },

  updatePortfolio: async (profile, contact) => {
    const response = await api.put('/candidates/me/portfolio', { profile, contact });
    return response.data;
  },

  uploadResume: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('cv', file);
    const response = await api.post('/candidates/me/cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        onProgress(Math.round((event.loaded * 100) / event.total));
      },
    });
    return response.data;
  },

  deleteResume: async () => {
    const response = await api.delete('/candidates/me/cv');
    return response.data;
  },

  downloadResume: async () => {
    const response = await api.get('/candidates/me/cv', { responseType: 'blob' });
    return response.data;
  },

  autofillFromResume: async () => {
    const response = await api.post('/candidates/me/autofill');
    return response.data;
  },

  deleteMyProfile: async () => {
    const response = await api.delete('/candidates/me');
    return response.data;
  }
};
