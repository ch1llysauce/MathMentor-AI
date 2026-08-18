import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [sessionRevoked, setSessionRevoked] = useState(false);

  const isAuthenticated = Boolean(token && user);

  const saveAuth = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Listen for session-revoked events from the API interceptor
  useEffect(() => {
    const handleSessionRevoked = () => {
      setSessionRevoked(true);
      setUser(null);
      setToken(null);
    };
    window.addEventListener('session-revoked', handleSessionRevoked);
    return () => window.removeEventListener('session-revoked', handleSessionRevoked);
  }, []);

  const dismissSessionRevoked = useCallback(() => {
    setSessionRevoked(false);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authApi.login(credentials);
      const payload = data.data ?? data;

      if (data.requiresTwoFactor || payload.requiresTwoFactor) {
        return { requires2FA: true, userId: payload.userId };
      }

      saveAuth(payload.user, payload.token);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const { data } = await authApi.register(userData);
      const payload = data.data ?? data;
      saveAuth(payload.user, payload.token);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore errors on logout
    } finally {
      clearAuth();
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await authApi.getProfile();
      const payload = data.data ?? data;
      const updated = payload.user || payload;
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    } catch {
      // ignore — 401 is handled globally by the interceptor
    }
  }, [token]);

  // Periodic heartbeat & window focus listener to verify active session in real-time
  useEffect(() => {
    if (!isAuthenticated) return;

    refreshProfile();

    const handleFocus = () => {
      refreshProfile();
    };

    const intervalId = setInterval(() => {
      refreshProfile();
    }, 15000);

    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, refreshProfile]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout, refreshProfile, saveAuth, sessionRevoked, dismissSessionRevoked }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
