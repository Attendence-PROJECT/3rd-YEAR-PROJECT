import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  seedAdmin: (data) => api.post('/auth/seed-admin', data),
};

export const studentsApi = {
  list: (params) => api.get('/students', { params }),
  get: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  remove: (id) => api.delete(`/students/${id}`),
};

export const teachersApi = {
  list: (params) => api.get('/teachers', { params }),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  remove: (id) => api.delete(`/teachers/${id}`),
};

export const subjectsApi = {
  list: (params) => api.get('/subjects', { params }),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  remove: (id) => api.delete(`/subjects/${id}`),
};

export const sessionsApi = {
  create: (data) => api.post('/sessions', data),
  list: (params) => api.get('/sessions', { params }),
  get: (id) => api.get(`/sessions/${id}`),
  close: (id) => api.post(`/sessions/${id}/close`),
  attendance: (id) => api.get(`/sessions/${id}/attendance`),
};

export const attendanceApi = {
  mark: (sessionToken) => api.post('/attendance/mark', { sessionToken }),
  student: (studentId, params) => api.get(`/attendance/student/${studentId}`, { params }),
};

export const reportsApi = {
  overview: () => api.get('/reports/overview'),
  student: (id) => api.get(`/reports/student/${id}`),
  class: (classId) => api.get(`/reports/class/${classId}`),
  subject: (subjectId) => api.get(`/reports/subject/${subjectId}`),
};

export default api;
