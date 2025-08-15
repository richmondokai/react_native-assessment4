import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from 'react-native';

import CategoriesScreen from '../screens/notes/CategoriesScreen';
import NoteDetailScreen from '../screens/notes/NoteDetailScreen';
import { useDarkMode } from '../hooks/useDarkMode';

const Stack = createStackNavigator();

const CategoriesStackNavigator = () => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <Stack.Navigator
      initialRouteName="CategoriesList"
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
        name="CategoriesList" 
        component={CategoriesScreen} 
        options={{ title: 'Categories' }}
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

export default CategoriesStackNavigator;
