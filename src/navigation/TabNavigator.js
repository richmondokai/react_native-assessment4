import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import NotesStackNavigator from './NotesStackNavigator';
import FavoritesStackNavigator from './FavoritesStackNavigator';
import CategoriesStackNavigator from './CategoriesStackNavigator';
import RemindersStackNavigator from './RemindersStackNavigator';
import { useDarkMode } from '../hooks/useDarkMode';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <Tab.Navigator
      initialRouteName="NotesStack"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'NotesStack') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'star' : 'star-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'pricetag' : 'pricetag-outline';
          } else if (route.name === 'Reminders') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: isDarkMode ? '#4a9eff' : '#007AFF',
        tabBarInactiveTintColor: isDarkMode ? '#888' : 'gray',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
          borderTopColor: isDarkMode ? '#333' : '#e0e0e0',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="NotesStack" 
        component={NotesStackNavigator} 
        options={{ title: 'All Notes' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesStackNavigator} 
        options={{ title: 'Favorites' }}
      />
      <Tab.Screen 
        name="Categories" 
        component={CategoriesStackNavigator} 
        options={{ title: 'Categories' }}
      />
      <Tab.Screen 
        name="Reminders" 
        component={RemindersStackNavigator} 
        options={{ title: 'Reminders' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;