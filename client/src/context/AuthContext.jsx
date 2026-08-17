import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMeApi, loginApi, registerApi, logoutApi } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medreminder_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('medreminder_token');
      if (token) {
        try {
          const meData = await getMeApi();
          setUser((prev) => ({ ...prev, ...meData }));
        } catch (err) {
          console.error('Failed to fetch current user session', err);
          setUser(null);
          localStorage.removeItem('medreminder_token');
          localStorage.removeItem('medreminder_user');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const data = await loginApi(credentials);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const data = await registerApi(userData);
    setUser(data);
    return data;
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  const updateUserState = (updatedUser) => {
    setUser((prev) => {
      const newObj = { ...prev, ...updatedUser };
      localStorage.setItem('medreminder_user', JSON.stringify(newObj));
      return newObj;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserState,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
