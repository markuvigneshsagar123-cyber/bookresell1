import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  updateUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  updateUser: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = api.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (data: any) => {
    const result = await api.login(data);
    setUser(result.user);
  };

  const register = async (data: any) => {
    const result = await api.register(data);
    setUser(result.user);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Also update localStorage
    const stored = localStorage.getItem('user');
    if (stored) {
      const data = JSON.parse(stored);
      localStorage.setItem('user', JSON.stringify({ ...data, ...updatedUser }));
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
