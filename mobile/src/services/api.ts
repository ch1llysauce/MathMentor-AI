import axios from 'axios';
import { API_BASE_URL } from '../constants/api';
import { storage } from '../utils/storage';

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
      console.log('🔑 Token from storage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Authorization header set');
      } else {
        console.log('⚠️  No token found in storage');
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
