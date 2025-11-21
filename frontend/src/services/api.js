import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Help Requests API
export const helpRequestsAPI = {
  getAll: () => api.get('/help-requests'),
  getById: (id) => api.get(`/help-requests/${id}`),
  create: (data) => api.post('/help-requests', data),
  update: (id, data) => api.put(`/help-requests/${id}`, data),
  delete: (id) => api.delete(`/help-requests/${id}`),
};

// Resources API
export const resourcesAPI = {
  getAll: () => api.get('/resources'),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
};

// Alerts API
export const alertsAPI = {
  getAll: () => api.get('/alerts'),
  create: (data) => api.post('/alerts', data),
};

// Assignments API
export const assignmentsAPI = {
  getAll: () => api.get('/assignments'),
  create: (data) => api.post('/assignments', data),
};

// Messages API
export const messagesAPI = {
  getAll: () => api.get('/messages'),
  create: (data) => api.post('/messages', data),
};

// Distance API
export const distanceAPI = {
  getNearestProviders: (helpRequestId) => api.get(`/distance/nearest-providers/${helpRequestId}`),
  calculate: (lat1, lon1, lat2, lon2) => api.get(`/distance/calculate?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}`),
};

export default api;

