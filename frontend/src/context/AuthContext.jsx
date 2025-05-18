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
  const [isGuestSession, setIsGuestSession] = useState(false);

  // Initialize: Check if user is already logged in or if it's a guest session
  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await fetch('/api/auth/verify-token', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const data = await response.json();
          if (data.isValid) {
            setUser(data.user);
            setIsAuthenticated(true);
            setIsGuestSession(false); // Real user, not guest
            StorageService.disableGuestMode(); // Clean up any old guest stuff
          } else {
            localStorage.removeItem('authToken');
            StorageService.disableGuestMode(); // Ensure guest mode is off if token is invalid
            setIsAuthenticated(false);
            setIsGuestSession(false);
          }
        } else {
          // No token. Any previous guest mode flag in localStorage is cleared on page load.
          // User will be redirected to /login by ProtectedRoute and can choose to be a guest again.
          StorageService.disableGuestMode(); // Clears GUEST_MODE_KEY and guest conversation
          setIsAuthenticated(false);
          setIsGuestSession(false);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('authToken');
        StorageService.disableGuestMode();
        setIsAuthenticated(false);
        setIsGuestSession(false);
        setError('Failed to verify authentication status');
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  // Activate guest session
  const activateGuestSession = () => {
    StorageService.enableGuestMode();
    setUser(null); // No user object for guest
    setIsAuthenticated(true); // Grant access for guest
    setIsGuestSession(true);
    setError(null);
    // setLoading(false); // setLoading is usually for initial load
  };

  // Switch to login (clear guest session)
  const switchToLogin = () => {
    StorageService.disableGuestMode(); // Clears guest flag and conversation
    setUser(null);
    setIsAuthenticated(false);
    setIsGuestSession(false);
    // Navigation to /login will be handled by ProtectedRoute or consuming components
  };

  // Login function
  const login = async (token) => {
    setLoading(true);
    try {
      localStorage.setItem('authToken', token);
      const response = await fetch('/api/auth/verify-token', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.isValid) {
        setUser(data.user);
        setIsAuthenticated(true);
        setIsGuestSession(false); // Logged in, so not a guest session
        StorageService.disableGuestMode(); // Clear any guest mode artifacts
        setLoading(false);
        return true;
      } else {
        await logout(); // Token was bad
        setError('Invalid authentication token');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      await logout(); // Ensure clean state on error
      setError('Failed to login');
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    // setLoading(true); // Optional: setLoading during logout
    try {
      await fetch('/api/auth/logout'); 
    } catch (err) {
      console.error('Logout API call error:', err);
    } finally {
      localStorage.removeItem('authToken');
      StorageService.disableGuestMode(); // Ensure guest mode is disabled
      setUser(null);
      setIsAuthenticated(false);
      setIsGuestSession(false);
      // setLoading(false);
      // Navigation to /login is typically handled by the component initiating logout
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
  const contextValue = {
    user,
    isAuthenticated,
    loading,
    error,
    isGuestSession,
    login,
    logout,
    activateGuestSession,
    switchToLogin, // Added
    getUserProfile,
    updateUserPreferences,
  };

  if (loading) {
    // Consider a global loading indicator or null to prevent premature rendering
    return <div>Loading authentication...</div>; 
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
