import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LogBox, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import CustomSplashScreen from './src/screens/SplashScreen';
import { ThemeProvider } from './src/context/ThemeContext';
import { initializeSettings } from './src/utils/initializeSettings';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settingsInitialized, setSettingsInitialized] = useState(false);

  // Initialize app settings to ensure light mode
  useEffect(() => {
    const setupApp = async () => {
      try {
        // Initialize settings with light mode
        await initializeSettings();
        setSettingsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize settings:', error);
        setSettingsInitialized(true); // Continue anyway
      }
    };
    
    setupApp();
  }, []);

  // Handle splash screen finish
  const handleSplashFinish = useCallback((authenticated) => {
    setIsAuthenticated(authenticated);
    setShowSplash(false);
    setAppIsReady(true);
  }, []);

  useEffect(() => {
    // Hide the native splash screen once our custom splash is ready
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // Only show splash screen after settings are initialized
  if (showSplash && settingsInitialized) {
    return (
      <ThemeProvider>
        <CustomSplashScreen onFinish={handleSplashFinish} />
      </ThemeProvider>
    );
  }
  
  // Show a blank screen while initializing settings
  if (!settingsInitialized) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator initialAuthenticated={isAuthenticated} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
