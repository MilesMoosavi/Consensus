// src/components/UserProfile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserProfile.css';

const UserProfile = () => {
  const { user, getUserProfile, updateUserPreferences, logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  
  useEffect(() => {
    const fetchProfile = async () => {
      const profileData = await getUserProfile();
      setUserProfile(profileData);
      
      if (profileData?.preferences?.theme) {
        setTheme(profileData.preferences.theme);
      }
      
      setLoading(false);
    };
    
    fetchProfile();
  }, [getUserProfile]);
  
  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    
    // Update in backend
    await updateUserPreferences({
      ...userProfile?.preferences,
      theme: newTheme
    });
    
    // Apply theme to the entire app
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };
  
  const handleLogout = () => {
    logout();
  };
  
  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <div className="profile-card">
        <div className="profile-info">
          <img 
            src={userProfile?.profilePicture || '/default-avatar.png'} 
            alt={userProfile?.displayName} 
            className="profile-avatar"
          />
          <div className="profile-details">
            <h2>{userProfile?.displayName}</h2>
            <p>{userProfile?.email}</p>
          </div>
        </div>
        
        <div className="profile-section">
          <h3>Theme Preference</h3>
          <div className="theme-selector">
            <button 
              className={`theme-button light ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              Light
            </button>
            <button 
              className={`theme-button dark ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              Dark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
