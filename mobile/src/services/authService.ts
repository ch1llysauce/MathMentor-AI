import api from './api';
import { AUTH_ENDPOINTS } from '../constants/api';
import { AuthResponse, RegisterData, User } from '../types/auth';
import { storage } from '../utils/storage';

export const authService = {
  // ── Auth ──────────────────────────────────────────────────────────────────

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
    const data: AuthResponse = response.data;
    // Auto-login: store token and user so the app considers them signed in immediately
    if (data.success && data.data) {
      await storage.setItem('token', data.data.token);
      await storage.setItem('user', JSON.stringify(data.data.user));
    }
    console.log('✅ Registration successful');
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, { email, password });
    if (response.data.success && !response.data.requiresTwoFactor) {
      await storage.setItem('token', response.data.data.token);
      await storage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // ── 2FA ───────────────────────────────────────────────────────────────────

  async validate2FA(userId: string, token: string): Promise<AuthResponse> {
    const response = await api.post(AUTH_ENDPOINTS.TWO_FA_VALIDATE, { userId, token });
    if (response.data.success) {
      await storage.setItem('token', response.data.data.token);
      await storage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async setup2FA(): Promise<{ qrCode: string; secret: string }> {
    const response = await api.post(AUTH_ENDPOINTS.TWO_FA_SETUP);
    return response.data.data;
  },

  async verify2FA(token: string): Promise<AuthResponse> {
    const response = await api.post(AUTH_ENDPOINTS.TWO_FA_VERIFY, { token });
    if (response.data.success) {
      const user = await this.getStoredUser();
      if (user) {
        await storage.setItem('user', JSON.stringify({ ...user, twoFactorEnabled: true }));
      }
    }
    return response.data;
  },

  async disable2FA(token: string): Promise<AuthResponse> {
    const response = await api.post(AUTH_ENDPOINTS.TWO_FA_DISABLE, { token });
    if (response.data.success) {
      const user = await this.getStoredUser();
      if (user) {
        await storage.setItem('user', JSON.stringify({ ...user, twoFactorEnabled: false }));
      }
    }
    return response.data;
  },

  // ── Profile / session ─────────────────────────────────────────────────────

  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await api.get(AUTH_ENDPOINTS.PROFILE);
      if (response.data.success) {
        await storage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (e) {
      console.warn('Network error fetching profile, returning cached stored user');
      const cachedUser = await this.getStoredUser();
      if (cachedUser) {
        return { success: true, data: { user: cachedUser } } as any;
      }
      throw e;
    }
  },

  async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    const response = await api.put(AUTH_ENDPOINTS.UPDATE_PROFILE, updates);
    if (response.data.success) {
      await storage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
    await storage.removeItem('token');
    await storage.removeItem('user');
  },

  async deleteAccount(): Promise<void> {
    try {
      await api.delete(AUTH_ENDPOINTS.DELETE_ACCOUNT);
    } catch (error) {
      console.warn('Delete account API call failed:', error);
    }
    await storage.removeItem('token');
    await storage.removeItem('user');
  },

  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await storage.getItem('token');
      return !!token;
    } catch {
      return false;
    }
  },

  async getStoredUser(): Promise<User | null> {
    try {
      const user = await storage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
};
