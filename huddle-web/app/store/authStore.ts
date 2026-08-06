import { create } from 'zustand';
import api from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  lookingFor?: string[];
  preferences?: any;
  socialLinks?: any;
  createdLobbies?: any[];
  participatingLobbies?: any[];
  followers?: any[];
  following?: any[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  onlineUsers: string[];
  setAuth: (user: User, token: string) => void;
  setOnlineUsers: (users: string[]) => void;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (googleToken: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: typeof window !== 'undefined' && localStorage.getItem('huddle_user') ? JSON.parse(localStorage.getItem('huddle_user')!) : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('huddle_token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('huddle_token') : false,
  isLoading: false,
  error: null,
  onlineUsers: [],

  setAuth: (user: User, token: string) => {
    localStorage.setItem('huddle_token', token);
    localStorage.setItem('huddle_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, error: null });
  },

  setOnlineUsers: (users: string[]) => {
    set({ onlineUsers: users });
  },

  logout: () => {
    localStorage.removeItem('huddle_token');
    localStorage.removeItem('huddle_user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      get().setAuth(response.data.user, response.data.token);
    } catch (error) {
      set({ 
        error: (error as any).response?.data?.error || 'Login failed',
        isLoading: false 
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      get().setAuth(response.data.user, response.data.token);
    } catch (error) {
      set({ 
        error: (error as any).response?.data?.error || 'Signup failed',
        isLoading: false 
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  googleLogin: async (googleToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/google', { googleToken });
      get().setAuth(response.data.user, response.data.token);
    } catch (error) {
      set({ 
        error: (error as any).response?.data?.error || 'Google login failed',
        isLoading: false 
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/users/profile', data);
      localStorage.setItem('huddle_user', JSON.stringify(response.data));
      set({ user: response.data });
    } catch (error) {
      set({ 
        error: (error as any).response?.data?.error || 'Failed to update profile',
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
