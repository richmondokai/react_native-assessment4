import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';

import TabNavigator from './TabNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';
import ProfileScreen from '../screens/settings/ProfileScreen';
import StatisticsScreen from '../screens/settings/StatisticsScreen';
import HelpScreen from '../screens/settings/HelpScreen';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const { isDarkMode, styles: darkModeStyles } = useDarkMode();
  const { logout, user } = useAuth();
  
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    initials: 'JD'
  });

  // Function to get initials from name
  const getInitials = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return 'JD';
    
    const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return 'JD';
    
    if (nameParts.length === 1) {
      // Single name - take first two characters
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    
    // Multiple names - take first letter of first and last name
    const firstInitial = nameParts[0].charAt(0);
    const lastInitial = nameParts[nameParts.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  };

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        console.log('=== DRAWER NAVIGATION DEBUG ===');
        console.log('Loading user profile for drawer...');
        
        // Try to load from AsyncStorage first
        const storedProfile = await AsyncStorage.getItem('USER_PROFILE');
        if (storedProfile) {
          const profileData = JSON.parse(storedProfile);
          console.log('Found stored profile for drawer:', profileData);
          
          const name = profileData.name || 'John Doe';
          const email = profileData.email || 'john.doe@example.com';
          const initials = getInitials(name);
          
          setUserProfile({ name, email, initials });
        } else if (user) {
          // Use auth context user data if available
          console.log('Using auth context user data for drawer:', user);
          const name = user.name || user.username || 'John Doe';
          const email = user.email || 'john.doe@example.com';
          const initials = getInitials(name);
          
          setUserProfile({ name, email, initials });
        }
        console.log('=== END DRAWER NAVIGATION DEBUG ===');
      } catch (error) {
        console.log('Error loading user profile for drawer:', error);
      }
    };

    loadUserProfile();
  }, [user]);
  
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
              await logout();
              // The AuthContext will update isAuthenticated and AppNavigator will show auth screens
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
            <Text style={styles.profileIconText}>{userProfile.initials}</Text>
          </View>
          <Text style={[styles.displayName, isDarkMode && { color: '#f0f0f0' }]}>{userProfile.name}</Text>
          <Text style={[styles.email, isDarkMode && { color: '#b0b0b0' }]}>{userProfile.email}</Text>
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
        component={SettingsStackNavigator}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={24} color={color} />
          ),
          headerShown: false, // Let the stack navigator handle headers
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