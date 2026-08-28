import { api } from './api';

export const authService = {
  login: async (credentials) => {
    // الاتصال الفعلي بمسار تسجيل الدخول في الواجهة الخلفية
    const response = await api.post('/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data; // يُعيد { success, msg, user, token }
  },

  register: async (userData) => {
    // الاتصال الفعلي بمسار التسجيل في الواجهة الخلفية
    const response = await api.post('/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data; // يُعيد { success, message, user, token }
  },

  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/profile');
    return response.data.user;
  }
};