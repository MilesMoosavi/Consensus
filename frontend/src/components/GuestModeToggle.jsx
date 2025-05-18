import React from 'react';
import StorageService from '../services/StorageService';
import './GuestModeToggle.css';

const GuestModeToggle = ({ isGuestMode, onGuestModeChange }) => {
  const handleToggle = (event) => {
    const newGuestModeState = event.target.checked;
    if (newGuestModeState) {
      StorageService.enableGuestMode();
    } else {
      StorageService.disableGuestMode();
    }
    onGuestModeChange(newGuestModeState);
  };

  return (
    <div className="guest-mode-toggle-container">
      <label htmlFor="guest-mode-checkbox" className="guest-mode-label">
        <input
          type="checkbox"
          id="guest-mode-checkbox"
          className="guest-mode-checkbox"
          checked={isGuestMode}
          onChange={handleToggle}
          title={isGuestMode ? "Temporary chat mode active (conversations not saved after session)" : "Switch to persistent chat (requires login, conversations saved)"}
        />
        Temporary Chat
      </label>
      {isGuestMode && (
        <div className="guest-mode-info">
          <span className="info-icon">ℹ️</span>
          <span className="info-text">Conversations are not saved</span>
        </div>
      )}
    </div>
  );
};

export default GuestModeToggle;
