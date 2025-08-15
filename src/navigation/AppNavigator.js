import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthNavigator from './AuthNavigator';
import DrawerNavigator from './DrawerNavigator';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

const AppContent = ({ initialAuthenticated = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [isLoading, setIsLoading] = useState(!initialAuthenticated);
  const { theme } = useTheme();

  useEffect(() => {
    // Check if user is logged in
    const checkUserSession = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        setIsAuthenticated(userToken !== null);
      } catch (error) {
        console.log('Error checking user session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();

    // Set up a listener for when AsyncStorage changes
    const interval = setInterval(checkUserSession, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    // You could return a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {isAuthenticated ? <DrawerNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const AppNavigator = ({ initialAuthenticated = false }) => {
  return (
    <AppContent initialAuthenticated={initialAuthenticated} />
  );
};

export default AppNavigator;