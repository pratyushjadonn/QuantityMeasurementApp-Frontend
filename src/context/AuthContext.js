// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('quanment_token');
    const name  = localStorage.getItem('quanment_name');
    const email = localStorage.getItem('quanment_email');
    if (token && name) {
      setUser({ token, name, email });
    }
    setLoading(false);
  }, []);

  const saveSession = ({ token, name, email }) => {
    localStorage.setItem('quanment_token', token);
    localStorage.setItem('quanment_name',  name);
    localStorage.setItem('quanment_email', email);
    setUser({ token, name, email });
  };

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    saveSession(data);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authAPI.register(name, email, password);
    saveSession(data);
    return data;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch (e) { /* ignore */ }
    localStorage.removeItem('quanment_token');
    localStorage.removeItem('quanment_name');
    localStorage.removeItem('quanment_email');
    setUser(null);
  };

  const getInitials = () => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getInitials }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
