import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDarkMode } from '../hooks/useDarkMode';

import TabNavigator from './TabNavigator';
import ProfileScreen from '../screens/settings/ProfileScreen';
import StatisticsScreen from '../screens/settings/StatisticsScreen';
import HelpScreen from '../screens/settings/HelpScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const { isDarkMode, styles: darkModeStyles } = useDarkMode();
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              // The AppNavigator will detect the token removal and show the auth screens
            } catch (error) {
              console.log('Error logging out:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <DrawerContentScrollView 
      {...props}
      style={isDarkMode ? { backgroundColor: '#121212' } : {}}
    >
      <View style={[
        styles.drawerHeader, 
        isDarkMode && { 
          backgroundColor: '#1a1a1a',
          borderBottomColor: '#333333'
        }
      ]}>
        <View style={styles.userInfoSection}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>JD</Text>
          </View>
          <Text style={[styles.displayName, isDarkMode && { color: '#f0f0f0' }]}>John Doe</Text>
          <Text style={[styles.email, isDarkMode && { color: '#b0b0b0' }]}>john.doe@example.com</Text>
        </View>
      </View>
      <DrawerItemList {...props} />
      <TouchableOpacity 
        style={[styles.logoutButton, isDarkMode && { borderTopColor: '#333333' }]} 
        onPress={handleLogout}
      >
        <View style={styles.logoutItem}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </View>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
        },
        headerTintColor: isDarkMode ? '#f0f0f0' : '#333',
        drawerActiveTintColor: isDarkMode ? '#4a9eff' : '#007AFF',
        drawerInactiveTintColor: isDarkMode ? '#b0b0b0' : '#555',
        drawerStyle: {
          backgroundColor: isDarkMode ? '#121212' : '#fff',
        }
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Home"
        component={TabNavigator}
        options={{
          title: 'Notes',
          drawerIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="stats-chart-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Help"
        component={HelpScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="help-circle-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={24} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userInfoSection: {
    alignItems: 'center',
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileIconText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  displayName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 30,
    fontSize: 16,
    color: '#FF3B30',
  },
});

export default DrawerNavigator;