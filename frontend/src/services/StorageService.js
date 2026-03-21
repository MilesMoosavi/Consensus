/**
 * Storage service to handle persistent and temporary data
 */
class StorageService {
  // Key names for localStorage 
  static ACTIVE_MODELS_KEY = 'activeModels';
  static MODEL_SETTINGS_KEY = 'modelSettings';
  static THEME_KEY = 'theme';
  static AUTH_TOKEN_KEY = 'authToken';
  static GUEST_MODE_KEY = 'guestMode';
  static GUEST_CONVERSATION_KEY = 'guestConversation';
  
  /**
   * Checks if guest mode is active
   * @returns {boolean} True if guest mode is active
   */
  static isGuestMode() {
    return localStorage.getItem(this.GUEST_MODE_KEY) === 'true';
  }
  
  /**
   * Enables guest mode for temporary conversations
   */
  static enableGuestMode() {
    localStorage.setItem(this.GUEST_MODE_KEY, 'true');
  }
  
  /**
   * Disables guest mode and clears temporary conversations
   */
  static disableGuestMode() {
    localStorage.removeItem(this.GUEST_MODE_KEY);
    this.clearGuestConversation();
  }
  
  /**
   * Saves the current conversation for guest mode
   * @param {Array} messages - The conversation messages to save
   */
  static saveGuestConversation(messages) {
    if (this.isGuestMode()) {
      localStorage.setItem(this.GUEST_CONVERSATION_KEY, JSON.stringify(messages));
    }
  }
  
  /**
   * Retrieves the guest conversation from storage
   * @returns {Array|null} The saved conversation or null if none exists
   */
  static getGuestConversation() {
    const conversation = localStorage.getItem(this.GUEST_CONVERSATION_KEY);
    return conversation ? JSON.parse(conversation) : null;
  }
  
  /**
   * Clears the guest conversation from storage
   */
  static clearGuestConversation() {
    localStorage.removeItem(this.GUEST_CONVERSATION_KEY);
  }
  
  /**
   * Saves active models to localStorage
   * @param {Array} models - The active model IDs
   */
  static saveActiveModels(models) {
    localStorage.setItem(this.ACTIVE_MODELS_KEY, JSON.stringify(models));
  }
  
  /**
   * Gets active models from localStorage
   * @returns {Array|null} The active model IDs or null if not found
   */
  static getActiveModels() {
    try {
      const savedModels = localStorage.getItem(this.ACTIVE_MODELS_KEY);
      return savedModels ? JSON.parse(savedModels) : null;
    } catch (e) {
      console.error('Failed to parse saved active models', e);
      return null;
    }
  }
  
  /**
   * Saves model settings to localStorage
   * @param {Object} settings - The model settings
   */
  static saveModelSettings(settings) {
    localStorage.setItem(this.MODEL_SETTINGS_KEY, JSON.stringify(settings));
  }
  
  /**
   * Gets model settings from localStorage
   * @returns {Object|null} The model settings or null if not found
   */
  static getModelSettings() {
    try {
      const savedSettings = localStorage.getItem(this.MODEL_SETTINGS_KEY);
      return savedSettings ? JSON.parse(savedSettings) : null;
    } catch (e) {
      console.error('Failed to parse saved model settings', e);
      return null;
    }
  }
  
  /**
   * Saves the current theme preference
   * @param {string} theme - The theme ('light' or 'dark')
   */
  static saveTheme(theme) {
    localStorage.setItem(this.THEME_KEY, theme);
  }
  
  /**
   * Gets the saved theme preference
   * @returns {string|null} The saved theme or null if not found
   */
  static getTheme() {
    return localStorage.getItem(this.THEME_KEY);
  }
}

export default StorageService;
