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

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authApi.login(credentials);
      // Backend wraps response in data.data
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
      // ignore
    }
  }, [token]);

  // Refresh profile once on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshProfile();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout, refreshProfile, saveAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
