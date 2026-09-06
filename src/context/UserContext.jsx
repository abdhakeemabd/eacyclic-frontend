import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../utils/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Load user and sync database on mount
  useEffect(() => {
    // 1. Load active session
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    
    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        if (parsedUser.isOffline) {
          setIsOfflineMode(true);
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  // Check if error is network/connection error (server down)
  const isServerDown = (err) => {
    return !err.response || 
           err.code === 'ERR_NETWORK' || 
           err.message?.toLowerCase().includes('network error') ||
           err.response?.status >= 500;
  };

  // Fetch user profile from API
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      if (isOfflineMode) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) return { success: true, data: JSON.parse(savedUser), isOffline: true };
      }

      const response = await userAPI.getProfile();

      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setIsAuthenticated(true);
      setIsOfflineMode(false);

      return { success: true, data: response.data };
    } catch (err) {
      if (isServerDown(err)) {
        setIsOfflineMode(true);
        const savedUser = localStorage.getItem('user');
        if (savedUser) return { success: true, data: JSON.parse(savedUser), isOffline: true };
      }
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      if (isOfflineMode) {
        const updatedUser = { ...user, ...profileData, isOffline: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, data: updatedUser, isOffline: true };
      }

      const response = await userAPI.updateProfile(profileData);

      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return { success: true, data: response.data };
    } catch (err) {
      if (isServerDown(err)) {
        setIsOfflineMode(true);
        const updatedUser = { ...user, ...profileData, isOffline: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, data: updatedUser, isOffline: true };
      }
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userAPI.login(credentials);
      const { user: userData, token } = response.data;

      setUser(userData);
      setIsAuthenticated(true);
      setIsOfflineMode(false);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('authToken', token);
      
      // Sync adminUser for admin panel APIs (assuming the same auth)
      localStorage.setItem('adminUser', JSON.stringify({ ...userData, token }));

      return { success: true, data: userData };
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return { success: false, error: err.response?.data?.error || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userAPI.register(userData);
      const { user: newUser, token } = response.data;

      setUser(newUser);
      setIsAuthenticated(true);
      setIsOfflineMode(false);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('authToken', token);

      return { success: true, data: newUser };
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return { success: false, error: err.response?.data?.error || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await userAPI.logout();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setIsAuthenticated(false);
    setIsOfflineMode(false);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminUser');
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    isOfflineMode,
    fetchUserProfile,
    updateUserProfile,
    login,
    register,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
