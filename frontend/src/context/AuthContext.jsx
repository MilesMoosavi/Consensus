// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import StorageService from '../services/StorageService'; // Import StorageService

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
  const [isGuestSession, setIsGuestSession] = useState(false); // New state for guest session

  // Initialize: Check if user is already logged in or if it's a guest session
  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const guestModeActive = StorageService.isGuestMode();

        if (token) {
          const response = await fetch('/api/auth/verify-token', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (data.isValid) {
            setUser(data.user);
            setIsAuthenticated(true);
            setIsGuestSession(false); // Ensure guest session is false if authenticated
            StorageService.disableGuestMode(); // If there's a token, disable guest mode
          } else {
            localStorage.removeItem('authToken');
            // Token invalid, now check for guest mode
            if (guestModeActive) {
              setUser(null); // No user object for guest
              setIsAuthenticated(true); // Grant access for guest
              setIsGuestSession(true);
            } else {
              setIsAuthenticated(false);
              setIsGuestSession(false);
            }
          }
        } else if (guestModeActive) {
          setUser(null); // No user object for guest
          setIsAuthenticated(true); // Grant access for guest
          setIsGuestSession(true);
        } else {
          setIsAuthenticated(false);
          setIsGuestSession(false);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Failed to verify authentication status');
        setIsAuthenticated(false);
        setIsGuestSession(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []); // Removed navigate from dependencies as it's not used here

  // Login function
  const login = async (token) => {
    setLoading(true);
    try {
      localStorage.setItem('authToken', token);
      const response = await fetch('/api/auth/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.isValid) {
        setUser(data.user);
        setIsAuthenticated(true);
        setIsGuestSession(false); // Logged in, so not a guest session
        StorageService.disableGuestMode(); // Clear guest mode on successful login
        setLoading(false);
        return true;
      } else {
        await logout(); // Use await here
        setError('Invalid authentication token');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login');
      setIsAuthenticated(false);
      setIsGuestSession(false);
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout'); // Assuming this endpoint exists and handles server-side session invalidation
    } catch (err) {
      console.error('Logout API call error:', err);
      // Continue with client-side logout even if API call fails
    } finally {
      localStorage.removeItem('authToken');
      StorageService.disableGuestMode(); // Ensure guest mode is disabled on logout
      setUser(null);
      setIsAuthenticated(false);
      setIsGuestSession(false);
      setLoading(false);
      // navigate('/login'); // Consider if navigation should be here or handled by consuming components
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
    isGuestSession, // Expose guest session status
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
