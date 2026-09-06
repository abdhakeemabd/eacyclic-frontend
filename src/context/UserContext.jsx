import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { initialUsers, USER_DATA_VERSION } from '../data/users';

const UserContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Load user and sync database on mount
  useEffect(() => {
    // 1. Sync local users database with localStorage
    try {
      const storedVersion = localStorage.getItem('userDataVersion');
      const savedOfflineUsers = localStorage.getItem('offlineUsers');
      
      if (storedVersion !== USER_DATA_VERSION || !savedOfflineUsers) {
        localStorage.setItem('offlineUsers', JSON.stringify(initialUsers));
        localStorage.setItem('userDataVersion', USER_DATA_VERSION);
      } else {
        const parsed = JSON.parse(savedOfflineUsers);
        const fileIds = new Set(initialUsers.map(u => u.id));
        let merged = [...initialUsers];
        
        parsed.forEach(savedU => {
          if (!fileIds.has(savedU.id)) {
            merged.push(savedU);
          }
        });
        localStorage.setItem('offlineUsers', JSON.stringify(merged));
      }
    } catch (e) {
      console.error('Failed to sync users database:', e);
    }

    // 2. Load active session
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
      if (!token) {
        throw new Error('No authentication token found');
      }

      // If we are currently offline, skip network request and use local data
      if (isOfflineMode) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          return { success: true, data: JSON.parse(savedUser), isOffline: true };
        }
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setIsAuthenticated(true);
      setIsOfflineMode(false);

      return { success: true, data: response.data };
    } catch (err) {
      if (isServerDown(err)) {
        setIsOfflineMode(true);
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          return { success: true, data: JSON.parse(savedUser), isOffline: true };
        }
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

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (isOfflineMode) {
        // Offline Save Fallback
        const updatedUser = { ...user, ...profileData, isOffline: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update user in offlineUsers cache
        const offlineUsers = JSON.parse(localStorage.getItem('offlineUsers') || '[]');
        const updatedOfflineUsers = offlineUsers.map(u => 
          (u.email === user.email || u.phone === user.phone) ? { ...u, ...profileData } : u
        );
        localStorage.setItem('offlineUsers', JSON.stringify(updatedOfflineUsers));

        return { success: true, data: updatedUser, isOffline: true };
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/v1/user/profile`,
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

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

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/auth/login`,
        credentials
      );

      const { user: userData, token } = response.data;

      setUser(userData);
      setIsAuthenticated(true);
      setIsOfflineMode(false);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('authToken', token);

      return { success: true, data: userData };
    } catch (err) {
      if (isServerDown(err)) {
        // FALLBACK: Server is down, try offline authentication using stored data
        const offlineUsers = JSON.parse(localStorage.getItem('offlineUsers') || '[]');
        const matchingUser = offlineUsers.find(
          u => u.phone === credentials.phone || u.email === credentials.email
        );

        if (matchingUser) {
          // Verify simple password if stored offline, otherwise allow login for UX safety
          if (!matchingUser.password || matchingUser.password === credentials.password) {
            const offlineUserData = { ...matchingUser, isOffline: true };
            setUser(offlineUserData);
            setIsAuthenticated(true);
            setIsOfflineMode(true);
            localStorage.setItem('user', JSON.stringify(offlineUserData));
            localStorage.setItem('authToken', `offline_token_${Date.now()}`);
            return { success: true, data: offlineUserData, isOffline: true };
          } else {
            return { success: false, error: 'Invalid password (Offline verification failed)' };
          }
        } else {
          // If no matching offline user found, auto-create a mock guest user to let the user enter
          const fallbackUser = {
            id: `offline_guest_${Date.now()}`,
            name: credentials.name || 'Offline Guest',
            phone: credentials.phone || '9999999999',
            email: credentials.email || 'offline@eacyclic.com',
            isOffline: true,
          };
          setUser(fallbackUser);
          setIsAuthenticated(true);
          setIsOfflineMode(true);
          localStorage.setItem('user', JSON.stringify(fallbackUser));
          localStorage.setItem('authToken', `offline_token_${Date.now()}`);
          
          // Save to offline users list
          offlineUsers.push(fallbackUser);
          localStorage.setItem('offlineUsers', JSON.stringify(offlineUsers));
          
          return { success: true, data: fallbackUser, isOffline: true };
        }
      }
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/auth/register`,
        userData
      );

      const { user: newUser, token } = response.data;

      setUser(newUser);
      setIsAuthenticated(true);
      setIsOfflineMode(false);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('authToken', token);

      return { success: true, data: newUser };
    } catch (err) {
      if (isServerDown(err)) {
        // FALLBACK: Server is down, save profile locally as offline user
        const offlineUsers = JSON.parse(localStorage.getItem('offlineUsers') || '[]');
        const exists = offlineUsers.some(
          u => u.phone === userData.phone || u.email === userData.email
        );

        if (exists) {
          return { success: false, error: 'Account already exists locally. Try logging in.' };
        }

        const newOfflineUser = {
          ...userData,
          id: `offline_user_${Date.now()}`,
          isOffline: true
        };

        offlineUsers.push(newOfflineUser);
        localStorage.setItem('offlineUsers', JSON.stringify(offlineUsers));

        // Auto authenticate locally
        setUser(newOfflineUser);
        setIsAuthenticated(true);
        setIsOfflineMode(true);
        localStorage.setItem('user', JSON.stringify(newOfflineUser));
        localStorage.setItem('authToken', `offline_token_${Date.now()}`);

        return { success: true, data: newOfflineUser, isOffline: true };
      }
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsOfflineMode(false);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
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
