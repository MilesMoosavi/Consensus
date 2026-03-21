import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

const Header = ({ darkMode, toggleTheme, activeModelDetails, setShowModelSelector, showModelSelector, modelSelectorRef, providers, activeModels, toggleModelActivation }) => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="chat-header">
      <div className="header-left">
        <h1>Consensus</h1>

        <div className="model-selector-container" ref={modelSelectorRef}>
          <button
            className="model-selector-button"
            onClick={() => setShowModelSelector(!showModelSelector)}
          >
            {activeModelDetails.length === 0 ? (
              <span>Select Models</span>
            ) : (
              <span>
                {activeModelDetails.length} model
                {activeModelDetails.length !== 1 ? "s" : ""} active
              </span>
            )}
            <span className="dropdown-arrow">▼</span>
          </button>

          {showModelSelector && (
            <div className="model-dropdown">
              {providers.map((provider) => (
                <div key={provider.id} className="provider-section">
                  <div className="provider-header">
                    <span>
                      {provider.icon} {provider.name}
                    </span>
                    {!provider.available && (
                      <span className="coming-soon-tag">Coming Soon</span>
                    )}
                  </div>

                  {provider.available && (
                    <div className="model-list">
                      {provider.models.map((model) => (
                        <div
                          key={model.id}
                          className={`model-item ${
                            activeModels.includes(model.id) ? "active" : ""
                          } ${!model.available ? "disabled" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (model.available) {
                              toggleModelActivation(model.id);
                            }
                          }}
                        >
                          <span className="model-checkbox">
                            {activeModels.includes(model.id) ? "✓" : ""}
                          </span>
                          <span className="model-name">{model.name}</span>
                          {!model.available && (
                            <span className="model-coming-soon">Soon</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>      <div className="header-right">
        <button
          className="icon-button theme-toggle"
          title="Toggle theme"
          onClick={toggleTheme}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        
        {isAuthenticated ? (
          <div className="user-menu">
            <Link to="/profile" className="profile-link">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.displayName} 
                  className="user-avatar" 
                />
              ) : (
                <span className="user-initial">
                  {user?.displayName?.charAt(0) || 'U'}
                </span>
              )}
            </Link>
            <button 
              className="icon-button logout-button" 
              title="Logout"
              onClick={logout}
            >
              🚪
            </button>
          </div>
        ) : (
          <Link to="/login" className="login-button">
            Sign In
          </Link>
        )}
        
        <button className="icon-button" title="Help">
          ❓
        </button>
      </div>
    </header>
  );
};

export default Header;