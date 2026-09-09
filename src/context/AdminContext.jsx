import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('adminDarkMode') === 'true');
  const [themeColor, setThemeColor] = useState(localStorage.getItem('adminThemeColor') || 'indigo');

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminUser');
    const storedToken = localStorage.getItem('adminToken');
    if (storedAdmin && storedToken) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        setAdminUser(parsedAdmin);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored admin:', error);
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
      }
    }
    setLoading(false);
  }, []);

  // Theme effects
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('adminDarkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeColor);
    localStorage.setItem('adminThemeColor', themeColor);
  }, [themeColor]);

  // Login — calls real Django backend
  const login = async (username, password) => {
    try {
      const response = await adminAPI.login(username, password);
      const { token, user } = response.data;

      setAdminUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('adminUser', JSON.stringify(user));
      localStorage.setItem('adminToken', token);

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.error || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setAdminUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const changeTheme = (color) => setThemeColor(color);

  return (
    <AdminContext.Provider value={{ 
      isAuthenticated, adminUser, login, logout, loading,
      darkMode, toggleDarkMode, themeColor, changeTheme 
    }}>
      {children}
    </AdminContext.Provider>
  );
};
