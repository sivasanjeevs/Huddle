import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('huddle_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response?.status === 401) {
    // Optional: auto-logout on 401
    // localStorage.removeItem('huddle_token');
    // localStorage.removeItem('huddle_user');
    // window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;
