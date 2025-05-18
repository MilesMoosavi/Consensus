// src/components/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import StorageService from '../services/StorageService'; // Import StorageService
import './LoginPage.css';

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  
  // Process token from URL if coming from OAuth callback
  useEffect(() => {
    const processAuthCallback = async () => {
      // Check if we're on the auth success page with a token
      if (location.pathname === '/auth/success') {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (token) {
          const success = await login(token);
          if (success) {
            navigate('/');
          } else {
            setError('Authentication failed. Please try again.');
          }
        }
      }
    };
    
    processAuthCallback();
  }, [location, login, navigate]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = '/api/auth/google';
  };

  const handleGuestLogin = () => {
    StorageService.enableGuestMode();
    // The AuthProvider or App component should ideally handle navigation
    // based on guest mode status upon initialization.
    // For a direct approach here, we can navigate.
    // However, a more robust solution would involve AuthContext recognizing guest mode.
    navigate('/'); // Re-add navigation after enabling guest mode
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome to Consensus</h1>
        <p className="login-description">
          Sign in to save your conversations and customize your experience.
        </p>
        
        {error && <div className="login-error">{error}</div>}
        
        <div className="login-options">
          <button 
            onClick={handleGoogleLogin}
            className="google-login-button"
          >
            <img 
              src="/google-icon.svg" 
              alt="Google" 
              className="google-icon" 
            />
            Sign in with Google
          </button>
          <button
            onClick={handleGuestLogin}
            className="guest-login-button" // Add a new class for styling
          >
            Continue as Guest
          </button>
        </div>
        
        <div className="login-footer">
          <p>
            By signing in, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
