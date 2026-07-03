import api from './api';
import { AUTH_ENDPOINTS } from '../constants/api';
import { AuthResponse, RegisterData, User } from '../types/auth';

// Cross-platform storage solution
const createStorage = () => {
  // Check if we're in a web environment
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      async getItem(key: string): Promise<string | null> {
        return localStorage.getItem(key);
      },
      async setItem(key: string, value: string): Promise<void> {
        localStorage.setItem(key, value);
      },
      async removeItem(key: string): Promise<void> {
        localStorage.removeItem(key);
      },
    };
  }
  
  // For React Native, try to import AsyncStorage
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage;
  } catch (error) {
    console.warn('AsyncStorage not available, using memory storage');
    // Fallback to in-memory storage
    const memoryStorage: { [key: string]: string } = {};
    return {
      async getItem(key: string): Promise<string | null> {
        return memoryStorage[key] || null;
      },
      async setItem(key: string, value: string): Promise<void> {
        memoryStorage[key] = value;
      },
      async removeItem(key: string): Promise<void> {
        delete memoryStorage[key];
      },
    };
  }
};

const storage = createStorage();

export const authService = {
  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
    // Don't store token/user after registration
    // User will login manually after registration
    console.log('✅ Registration successful, please login');
    return response.data;
  },

  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    console.log('🔐 Login attempt:', { 
      email, 
      passwordLength: password.length,
      endpoint: AUTH_ENDPOINTS.LOGIN 
    });
    
    const payload = { email, password };
    console.log('📤 Request payload:', JSON.stringify(payload));
    
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, payload);
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', response.data);
    
    if (response.data.success) {
      await storage.setItem('token', response.data.data.token);
      await storage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Get user profile
  async getProfile(): Promise<AuthResponse> {
    const response = await api.get(AUTH_ENDPOINTS.PROFILE);
    if (response.data.success) {
      await storage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Update profile
  async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    const response = await api.put(AUTH_ENDPOINTS.UPDATE_PROFILE, updates);
    if (response.data.success) {
      await storage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
    await storage.removeItem('token');
    await storage.removeItem('user');
  },

  // Check if user is logged in
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await storage.getItem('token');
      return !!token;
    } catch (error) {
      console.warn('Error checking login status:', error);
      return false;
    }
  },

  // Get stored user
  async getStoredUser(): Promise<User | null> {
    try {
      const user = await storage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.warn('Error getting stored user:', error);
      return null;
    }
  },
};
