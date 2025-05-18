// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StorageService from '../services/StorageService'; // Import StorageService

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const isGuest = StorageService.isGuestMode(); // Check guest mode status
  
  // Show loading state
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  // If not authenticated AND not in guest mode, redirect to login
  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated or in guest mode, render the children
  return children;
};

export default ProtectedRoute;
