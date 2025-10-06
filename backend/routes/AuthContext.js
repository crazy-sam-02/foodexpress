import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // We will create this API service next

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Effect to run on initial load to restore session
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        // Set the token in our API service's headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // Optional: Fetch user profile to verify token and get fresh user data
          // You would need a '/api/auth/me' endpoint for this.
          // For now, we'll decode the user from the token if possible or just set a logged-in state.
          // Let's assume the user object is also stored for simplicity.
          //data fetch :<parse account>:ID & password
          //post request/ return function
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          // Token is invalid, clear it
          console.error("Session restore failed", error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = useCallback((userData, authToken) => {
    // Store token and user data
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));

    // Set token for future API calls
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    // Update state
    setToken(authToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    // Clear everything
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Remove auth header
    delete api.defaults.headers.common['Authorization'];

    // Update state
    setToken(null);
    setUser(null);
  }, []);

  const authContextValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    loading,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};