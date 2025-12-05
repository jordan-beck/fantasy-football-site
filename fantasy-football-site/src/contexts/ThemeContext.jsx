import { createContext, useContext, useState, useEffect } from 'react';
import { themes, DEFAULT_THEME } from '../constants/theme';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Theme Context
 *
 * Provides theme state and toggle functionality throughout the application.
 * Persists theme preference to localStorage for consistency across sessions.
 */

const ThemeContext = createContext(undefined);

/**
 * Custom hook to access theme context
 * @returns {Object} Theme context with mode, theme colors, and toggle function
 * @throws {Error} If used outside of ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Theme Provider Component
 *
 * Wraps the application to provide theme context to all child components.
 * Handles localStorage persistence and smooth transitions between themes.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function ThemeProvider({ children }) {
  // Initialize theme from localStorage or use default
  const [mode, setMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      return savedTheme || DEFAULT_THEME;
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
      return DEFAULT_THEME;
    }
  });

  // Get current theme object based on mode
  const theme = themes[mode];

  /**
   * Toggle between dark and light modes
   */
  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'dark' ? 'light' : 'dark';
      return newMode;
    });
  };

  /**
   * Set a specific theme mode
   * @param {string} newMode - 'dark' or 'light'
   */
  const setThemeMode = (newMode) => {
    if (newMode === 'dark' || newMode === 'light') {
      setMode(newMode);
    } else {
      console.warn(`Invalid theme mode: ${newMode}. Use 'dark' or 'light'.`);
    }
  };

  // Persist theme preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, mode);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [mode]);

  // Apply theme to document root for CSS variable support (if needed)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);

    // Optional: Add transition class to enable smooth theme switching
    document.documentElement.classList.add('theme-transitioning');
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 300);

    return () => clearTimeout(timer);
  }, [mode]);

  const value = {
    mode,           // Current theme mode ('dark' or 'light')
    theme,          // Current theme object with all color values
    toggleTheme,    // Function to toggle between themes
    setThemeMode,   // Function to set specific theme mode
    isDark: mode === 'dark',
    isLight: mode === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
