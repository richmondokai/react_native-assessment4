import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Initialize app settings with default values
 * This ensures the app always starts with light mode
 */
export const initializeSettings = async () => {
  try {
    // Check if settings already exist
    const existingSettings = await AsyncStorage.getItem('settings');
    
    if (!existingSettings) {
      // If no settings exist, create default settings with light mode
      const defaultSettings = {
        darkMode: false,
        notificationsEnabled: true,
        autoSave: true,
        fontSize: 'medium'
      };
      
      await AsyncStorage.setItem('settings', JSON.stringify(defaultSettings));
      console.log('Default settings initialized with light mode');
    } else {
      // If settings exist, ensure dark mode is set to false on first launch
      const parsedSettings = JSON.parse(existingSettings);
      parsedSettings.darkMode = false;
      await AsyncStorage.setItem('settings', JSON.stringify(parsedSettings));
      console.log('Existing settings updated to ensure light mode');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing settings:', error);
    return false;
  }
};
