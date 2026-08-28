import { api } from './api';

export const applicationService = {
  applyToJob: async (jobId, data) => {
    const response = await api.post(`/applications/apply/${jobId}`, data);
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get('/applications/my-applications');
    return response.data;
  },

  getApplicantsForJob: async (jobId, sort) => {
    const response = await api.get(`/applications/job/${jobId}/applicants`, {
      params: sort ? { sort } : undefined,
    });
    return response.data;
  },

  updateApplicationStatus: async (id, status) => {
    const response = await api.put(`/applications/${id}/status`, { status });
    return response.data;
  },

  withdrawApplication: async (id) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },

  getApplicationById: async (id) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  downloadCv: async (id) => {
    const response = await api.get(`/applications/${id}/cv`, { responseType: 'blob' });
    return response.data;
  },

  reanalyze: async (id) => {
    const response = await api.post(`/applications/${id}/reanalyze`);
    return response.data;
  }
};
