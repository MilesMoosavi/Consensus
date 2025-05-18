import StorageService from './StorageService';

/**
 * Handles theme-related functionality
 */
class ThemeService {
  /**
   * Initializes the theme based on stored preferences
   * @returns {boolean} True if dark mode, false if light mode
   */
  static initializeTheme() {
    // Check if user has a saved preference
    const savedTheme = StorageService.getTheme();
    let isDarkMode;
    
    if (savedTheme === 'light') {
      isDarkMode = false;
      document.documentElement.classList.remove('dark-mode');
    } else {
      // Default to dark mode
      isDarkMode = true;
      document.documentElement.classList.add('dark-mode');
    }
    
    return isDarkMode;
  }
  
  /**
   * Toggles between light and dark mode
   * @param {boolean} currentMode - Current dark mode state
   * @returns {boolean} New dark mode state
   */
  static toggleTheme(currentMode) {
    const newMode = !currentMode;
    
    if (newMode) {
      document.documentElement.classList.add('dark-mode');
      StorageService.saveTheme('dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      StorageService.saveTheme('light');
    }
    
    return newMode;
  }
}

export default ThemeService;
