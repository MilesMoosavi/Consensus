// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize: Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if we have a token in localStorage
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // Verify token with the backend
          const response = await fetch('/api/auth/verify-token', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const data = await response.json();
          
          if (data.isValid) {
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('authToken');
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Failed to verify authentication status');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (token) => {
    try {
      // Store token
      localStorage.setItem('authToken', token);
      
      // Verify and get user details
      const response = await fetch('/api/auth/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.isValid) {
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      } else {
        logout();
        setError('Invalid authentication token');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login');
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint
      await fetch('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Remove token from localStorage
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Get user profile
  const getUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return null;
      }
      
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      return data.user;
    } catch (err) {
      console.error('Get profile error:', err);
      return null;
    }
  };

  // Update user preferences
  const updateUserPreferences = async (preferences) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return false;
      }
      
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ preferences })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update user in state
        setUser(prev => ({
          ...prev,
          preferences: data.preferences
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Update preferences error:', err);
      return false;
    }
  };

  // Value provided to consumers
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    getUserProfile,
    updateUserPreferences
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
