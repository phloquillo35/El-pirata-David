'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from './api';

interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; lastName: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('el-pirata-david-auth-token');
    if (storedToken) {
      setToken(storedToken);
      api.get<{ data: User }>('/auth/profile')
        .then((res) => {
          const userData = res.data || res;
          setUser(userData as User);
        })
        .catch(() => {
          localStorage.removeItem('el-pirata-david-auth-token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ user: User; accessToken: string }>('/auth/login', { email, password });
    localStorage.setItem('el-pirata-david-auth-token', res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string; lastName: string }) => {
    const res = await api.post<{ user: User; accessToken: string }>('/auth/register', data);
    localStorage.setItem('el-pirata-david-auth-token', res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('el-pirata-david-auth-token');
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    const res = await api.post<User>('/auth/profile', data);
    setUser(res);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
