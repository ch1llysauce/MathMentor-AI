import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

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

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to headers
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log request for debugging
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    } catch (error) {
      console.warn('Error getting token for request:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors with better messaging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    // Network error (server unreachable)
    if (!error.response) {
      console.error('❌ Network Error - Server unreachable:', error.message);
      console.log('💡 Troubleshooting tips:');
      console.log('1. Check if both phone and computer are on same WiFi');
      console.log('2. Check if backend server is running (npm start in backend folder)');
      console.log('3. Try using ngrok if on different networks');
      console.log(`4. Current API URL: ${API_BASE_URL}`);
      
      // Return a more user-friendly error
      const networkError = new Error('Unable to connect to server. Please check your internet connection and try again.');
      networkError.name = 'NetworkError';
      return Promise.reject(networkError);
    }
    
    // Log detailed error information
    /* console.error(`❌ API Error: ${error.response.status} ${error.config.method?.toUpperCase()} ${error.config.url}`);
    console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
    console.error('Request data:', error.config.data);
    
    if (error.response?.status === 401) {
      // Token expired - clear storage
      try {
        await storage.removeItem('token');
        await storage.removeItem('user');
      } catch (storageError) {
        console.warn('Error clearing storage:', storageError);
      }
    }
    */
    return Promise.reject(error);
  }
);

export default api;
