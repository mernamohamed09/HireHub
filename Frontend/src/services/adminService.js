import { api } from './api';

// Admin service - connects to /api/admin backend routes
export const adminService = {
  // جلب جميع المستخدمين مع البروفايلات (مع دعم الفلترة والبحث: role, search)
  getAllUsers: (params) => api.get('/admin/users', { params }).then(res => res.data),

  // جلب مستخدم بالـ ID
  getUserById: (userId) => api.get(`/admin/users/${userId}`).then(res => res.data),

  // جلب إحصائيات عامة (عدد المستخدمين، المرشحين، الشركات، الأدمن)
  getStats: () => api.get('/admin/stats').then(res => res.data),

  // حذف مستخدم (مع بروفايله) بواسطة الأدمن
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`).then(res => res.data),

  // إيقاف أو تفعيل حساب مستخدم (Suspend / Activate)
  updateUserStatus: (userId, isActive) =>
    api.patch(`/admin/users/${userId}/status`, { isActive }).then(res => res.data),

  // تغيير دور مستخدم
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }).then(res => res.data),

  // تغيير باسورد مستخدم (بواسطة الأدمن)
  changeUserPassword: (userId, newPassword) =>
    api.put(`/admin/users/${userId}/password`, { newPassword }).then(res => res.data),
};