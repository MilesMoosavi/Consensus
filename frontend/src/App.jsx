import { useEffect } from 'react'; // Import useEffect
import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./components/LoginPage";
import UserProfile from "./components/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import MainChatApp from "./components/MainChatApp";
import ThemeService from './services/ThemeService'; // Import ThemeService

function App() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    ThemeService.initializeTheme(); // Initialize theme on app load
  }, []); // Empty dependency array ensures this runs only once on mount
  
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/success" element={<LoginPage />} />
      <Route path="/profile" element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } />
      <Route path="/" element={
        isAuthenticated ? (
          <MainChatApp />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
    </Routes>
  );
}

export default App;
