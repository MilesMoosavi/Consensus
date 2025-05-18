import React from 'react';
import StorageService from '../services/StorageService';
import './GuestModeToggle.css';

const GuestModeToggle = ({ isGuestMode, onGuestModeChange }) => {
  const handleGuestModeToggle = () => {
    const newGuestMode = !isGuestMode;
    
    if (newGuestMode) {
      StorageService.enableGuestMode();
    } else {
      StorageService.disableGuestMode();
    }
    
    onGuestModeChange(newGuestMode);
  };

  return (
    <div className="guest-mode-toggle">
      <button 
        className={`toggle-button ${isGuestMode ? 'active' : ''}`}
        onClick={handleGuestModeToggle}
        title={isGuestMode ? "Temporary chat mode active" : "Enable temporary chat mode"}
      >
        {isGuestMode ? '🕒' : '💾'} 
        <span className="toggle-label">
          {isGuestMode ? 'Temporary Chat' : 'Persistent Chat'}
        </span>
      </button>
      {isGuestMode && (
        <div className="guest-mode-info">
          <span className="info-icon">ℹ️</span>
          <span className="info-text">Conversations will be deleted on page reload</span>
        </div>
      )}
    </div>
  );
};

export default GuestModeToggle;
