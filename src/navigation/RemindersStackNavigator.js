import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from 'react-native';

import RemindersScreen from '../screens/reminders/RemindersScreen';
import { useDarkMode } from '../hooks/useDarkMode';

const Stack = createStackNavigator();

const RemindersStackNavigator = () => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <Stack.Navigator
      initialRouteName="RemindersList"
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
        },
        headerTintColor: isDarkMode ? '#f0f0f0' : '#333',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="RemindersList" 
        component={RemindersScreen} 
        options={{ title: 'Reminders' }}
      />
    </Stack.Navigator>
  );
};

export default RemindersStackNavigator;
