import { useTheme } from '../context/ThemeContext';

/**
 * Custom hook to provide consistent dark mode styles across screens
 * @returns {Object} Object containing theme information and common styles
 */
export const useDarkMode = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Common styles for screens
  const screenStyles = {
    container: {
      backgroundColor: isDarkMode ? '#121212' : '#f8f8f8',
    },
    card: {
      backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
      borderColor: isDarkMode ? '#333333' : '#e0e0e0',
    },
    text: {
      color: isDarkMode ? '#f0f0f0' : '#333333',
    },
    subText: {
      color: isDarkMode ? '#b0b0b0' : '#666666',
    },
    input: {
      backgroundColor: isDarkMode ? '#2c2c2c' : '#ffffff',
      color: isDarkMode ? '#f0f0f0' : '#333333',
      borderColor: isDarkMode ? '#444444' : '#e0e0e0',
    },
    button: {
      backgroundColor: isDarkMode ? '#2c5282' : '#007AFF',
    },
    buttonText: {
      color: '#ffffff',
    },
    icon: {
      color: isDarkMode ? '#b0b0b0' : '#555555',
    },
    separator: {
      backgroundColor: isDarkMode ? '#333333' : '#e0e0e0',
    },
    header: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    },
  };

  return {
    isDarkMode,
    theme,
    styles: screenStyles,
  };
};
