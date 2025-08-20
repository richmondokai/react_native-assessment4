import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import FavoritesScreen from '../screens/notes/FavoritesScreen';
import NoteDetailScreen from '../screens/notes/NoteDetailScreen';
import { useDarkMode } from '../hooks/useDarkMode';

const Stack = createStackNavigator();

const FavoritesStackNavigator = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <Stack.Navigator
      initialRouteName="FavoritesList"
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
        name="FavoritesList" 
        component={FavoritesScreen} 
        options={{ title: 'Favorites' }}
      />
      <Stack.Screen 
        name="NoteDetail" 
        component={NoteDetailScreen} 
        options={({ route }) => ({ 
          title: route.params?.isNew ? 'New Note' : 'Edit Note',
        })}
      />
    </Stack.Navigator>
  );
};

export default FavoritesStackNavigator;
