import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { authService } from '../services/authService';
import api, { setOnUnauthorizedCallback } from '../services/api';
import { AUTH_ENDPOINTS } from '../constants/api';
import { storage } from '../utils/storage';
import { User, AuthResponse, RegisterData } from '../types/auth';
import { clearTabCaches } from '../utils/tabCache';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  loginWithGoogle: () => Promise<AuthResponse>;
  loginWithToken: (token: string, user: User) => Promise<void>;
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
    setOnUnauthorizedCallback(() => {
      setUser(null);
    });
    checkAuth();
    return () => {
      setOnUnauthorizedCallback(null);
    };
  }, []);

  // Real-time session verification (15s heartbeat + foreground app state check)
  useEffect(() => {
    if (!user) return;

    // Check profile/session every 15 seconds
    const interval = setInterval(() => {
      authService.getProfile().catch(() => {});
    }, 15000);

    // Re-verify session as soon as the app moves back to the foreground
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        authService.getProfile().catch(() => {});
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [user]);

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
    let GoogleSignin: any;
    try {
      const mod = require('@react-native-google-signin/google-signin');
      GoogleSignin = mod.GoogleSignin;
      // Use hardcoded web client ID — env vars aren't reliable in native builds
      // without going through app.json extra + expo-constants
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,
      });
    } catch {
      throw new Error('Google Sign-In is not available in this build. Please use a native build.');
    }

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Always sign out of the Google session first so the account picker is shown,
    // rather than silently reusing the last signed-in Google account.
    try {
      await GoogleSignin.signOut();
    } catch {
      // Ignore — the user may not have been signed in via Google yet
    }
    const signInResult = await GoogleSignin.signIn();

    if ((signInResult as any).type === 'cancelled') {
      return { success: false, message: 'Sign-in cancelled' } as any;
    }

    const idToken =
      (signInResult as any).data?.idToken ??
      (signInResult as any).idToken;

    if (!idToken) throw new Error('No ID token returned from Google Sign-In');

    const response = await api.post(AUTH_ENDPOINTS.GOOGLE, { idToken });
    const data: AuthResponse = response.data;

    if (data.requiresRegistration) {
      // New Google user — bubble up the flag with the idToken so the
      // register screen can complete sign-up without re-doing Google Sign-In
      return {
        ...data,
        data: {
          ...data.data,
          googleProfile: {
            ...(data.data?.googleProfile as any),
            idToken, // pass idToken forward for the registration call
          },
        } as any,
      };
    }

    if (data.success && data.data) {
      await storage.setItem('token', data.data.token);
      await storage.setItem('user', JSON.stringify(data.data.user));
      setUser(data.data.user);
    }
    return data;
  };

  const loginWithToken = async (token: string, user: User): Promise<void> => {
    await storage.setItem('token', token);
    await storage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const validate2FA = async (userId: string, token: string): Promise<AuthResponse> => {
    const response = await authService.validate2FA(userId, token);
    if (response.success && response.data) {
      setUser(response.data.user);
    }
    return response;
  };

  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await authService.register(userData);
    if (response.success && response.data) {
      setUser(response.data.user);
    }
    return response;
  };

  const logout = async () => {
    clearTabCaches();
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
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, loginWithToken, register, logout, updateUser, validate2FA }}>
      {children}
    </AuthContext.Provider>
  );
};
