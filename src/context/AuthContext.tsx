import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types.ts';
import api from '../lib/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for token on mount
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Invalid token, logging out', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { user: loggedInUser, token: authToken } = response.data;
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(loggedInUser);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Login failed';
      throw new Error(errorMsg);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      const { user: registeredUser, token: authToken } = response.data;
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(registeredUser);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user details', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
