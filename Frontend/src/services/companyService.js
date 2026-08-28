import { api } from './api';

export const companyService = {
  getMyProfile: async () => {
    const response = await api.get('/companies/me');
    return response.data;
  },

  updateMyProfile: async (data) => {
    const response = await api.put('/companies/me', data);
    return response.data;
  },

  deleteMyProfile: async () => {
    const response = await api.delete('/companies/me');
    return response.data;
  }
};
