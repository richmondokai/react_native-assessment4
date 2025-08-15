import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

// Create context
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [theme, setTheme] = useState('light'); // Always default to light theme
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from AsyncStorage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        // Always start with light theme
        setTheme('light');
        
        const settings = await AsyncStorage.getItem('settings');
        if (settings) {
          const parsedSettings = JSON.parse(settings);
          // If dark mode is explicitly set in settings, use that preference
          if (parsedSettings.darkMode !== undefined) {
            // Only apply dark mode if explicitly set to true
            // This ensures we default to light mode
            if (parsedSettings.darkMode === true) {
              setTheme('dark');
            }
          }
        }
      } catch (error) {
        console.log('Error loading theme preference:', error);
        // In case of error, ensure we're in light mode
        setTheme('light');
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Function to toggle theme
  const toggleTheme = async (isDarkMode) => {
    const newTheme = isDarkMode ? 'dark' : 'light';
    setTheme(newTheme);
    
    // We don't save the theme here as the SettingsScreen handles that
    // This is just to update the theme state when the toggle is changed
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Override the default useColorScheme hook to use our theme context
export const useColorScheme = () => {
  const { theme } = useTheme();
  return theme;
};
