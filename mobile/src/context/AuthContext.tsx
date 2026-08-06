import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { User, AuthResponse, RegisterData } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
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
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, validate2FA }}>
      {children}
    </AuthContext.Provider>
  );
};
