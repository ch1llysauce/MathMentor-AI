import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';
import { AUTH_ENDPOINTS } from '../constants/api';
import { storage } from '../utils/storage';
import { User, AuthResponse, RegisterData } from '../types/auth';

// Lazy-load Google Sign-In — requires native build (expo run:android)
const getGoogleSignin = () => {
  try {
    const mod = require('@react-native-google-signin/google-signin');
    mod.GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
    return mod;
  } catch {
    return null;
  }
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  loginWithGoogle: () => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<AuthResponse>;
  validate2FA: (userId: string, token: string) => Promise<AuthResponse>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isLoggedIn = await authService.isLoggedIn();
      if (isLoggedIn) {
        const storedUser = await authService.getStoredUser();
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await authService.login(email, password);
    if (response.success && response.data && !response.requiresTwoFactor) {
      setUser(response.data.user);
    }
    return response;
  };

  const loginWithGoogle = async (): Promise<AuthResponse> => {
    const mod = getGoogleSignin();
    if (!mod) throw new Error('Google Sign-In is not available. Please use a native build.');

    const { GoogleSignin } = mod;
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const signInResult = await GoogleSignin.signIn();

    const idToken =
      (signInResult as any).idToken ??
      (signInResult as any).data?.idToken;

    if (!idToken) throw new Error('No ID token returned from Google Sign-In');

    const response = await api.post(AUTH_ENDPOINTS.GOOGLE, { idToken });
    const data: AuthResponse = response.data;

    if (data.success && data.data) {
      await storage.setItem('token', data.data.token);
      await storage.setItem('user', JSON.stringify(data.data.user));
      setUser(data.data.user);
    }
    return data;
  };

  const validate2FA = async (userId: string, token: string): Promise<AuthResponse> => {
    const response = await authService.validate2FA(userId, token);
    if (response.success && response.data) {
      setUser(response.data.user);
    }
    return response;
  };

  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    return authService.register(userData);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>): Promise<AuthResponse> => {
    const response = await authService.updateProfile(updates);
    if (response.success && response.data) {
      setUser(response.data.user);
    }
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, updateUser, validate2FA }}>
      {children}
    </AuthContext.Provider>
  );
};
