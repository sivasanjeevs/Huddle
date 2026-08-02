import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: typeof window !== 'undefined' && localStorage.getItem('huddle_user') ? JSON.parse(localStorage.getItem('huddle_user')!) : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('huddle_token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('huddle_token') : false,
  isLoading: false,
  error: null,

  setAuth: (user, token) => {
    localStorage.setItem('huddle_token', token);
    localStorage.setItem('huddle_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, error: null });
  },

  logout: () => {
    localStorage.removeItem('huddle_token');
    localStorage.removeItem('huddle_user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      get().setAuth(response.data.user, response.data.token);
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Login failed',
        isLoading: false 
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      get().setAuth(response.data.user, response.data.token);
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Signup failed',
        isLoading: false 
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  googleLogin: async (googleToken) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/google', { googleToken });
      get().setAuth(response.data.user, response.data.token);
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Google login failed',
        isLoading: false 
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/users/profile', data);
      localStorage.setItem('huddle_user', JSON.stringify(response.data));
      set({ user: response.data });
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Failed to update profile',
        isLoading: false 
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProfile: async () => {
    if (!get().isAuthenticated) return;
    try {
      const response = await api.get('/users/profile');
      localStorage.setItem('huddle_user', JSON.stringify(response.data));
      set({ user: response.data });
    } catch (error) {
      console.error('Failed to fetch latest profile:', error);
    }
  }
}));

export default useAuthStore;
