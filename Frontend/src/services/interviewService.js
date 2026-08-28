import { api } from './api';

export const interviewService = {
  createInterview: async (data) => {
    const response = await api.post('/interviews', data);
    return response.data;
  },
  getMyInterviews: async () => {
    const response = await api.get('/interviews/my');
    return response.data;
  },
  updateInterview: async (id, data) => {
    const response = await api.put(`/interviews/${id}`, data);
    return response.data;
  },
  cancelInterview: async (id) => {
    const response = await api.put(`/interviews/${id}/cancel`);
    return response.data;
  },
  getInterviewsByJob: async (jobId) => {
    const response = await api.get(`/interviews/job/${jobId}`);
    return response.data;
  }
};
