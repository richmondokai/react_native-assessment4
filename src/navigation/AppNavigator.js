import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';

import AuthNavigator from './AuthNavigator';
import DrawerNavigator from './DrawerNavigator';

const AppContent = ({ initialAuthenticated = false }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(!initialAuthenticated);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    // Set loading to false once auth is loaded
    if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading]);

  if (isLoading) {
    // You could return a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
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