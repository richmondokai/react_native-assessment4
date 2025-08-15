import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

const SettingsScreen = ({ navigation }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  const { toggleTheme } = useTheme();
  
  // Set navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true
    });
  }, [navigation]);
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      // Always start with light mode
      setDarkMode(false);
      
      const settings = await AsyncStorage.getItem('settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        // Only set dark mode if it's explicitly true
        if (parsedSettings.darkMode === true) {
          setDarkMode(true);
        } else {
          // Ensure dark mode is false
          setDarkMode(false);
        }
        
        setNotificationsEnabled(parsedSettings.notificationsEnabled !== false);
        setAutoSave(parsedSettings.autoSave !== false);
        setFontSize(parsedSettings.fontSize || 'medium');
      }
    } catch (error) {
      console.log('Error loading settings:', error);
      // In case of error, ensure we're in light mode
      setDarkMode(false);
    }
  };
  
  const saveSettings = async () => {
    try {
      const settings = {
        darkMode,
        notificationsEnabled,
        autoSave,
        fontSize
      };
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };
  
  const toggleDarkMode = () => {
    const newDarkModeValue = !darkMode;
    setDarkMode(newDarkModeValue);
    toggleTheme(newDarkModeValue); // Update the theme context
    setTimeout(() => saveSettings(), 100);
  };
  
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    setTimeout(() => saveSettings(), 100);
  };
  
  const toggleAutoSave = () => {
    setAutoSave(!autoSave);
    setTimeout(() => saveSettings(), 100);
  };
  
  const handleFontSizeChange = (size) => {
    setFontSize(size);
    setTimeout(() => saveSettings(), 100);
  };
  
  const handleBackupData = () => {
    Alert.alert(
      'Backup Data',
      'This feature would backup all your notes to the cloud.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Backup', onPress: () => {
          // In a real app, this would trigger a backup process
          Alert.alert('Success', 'Your data has been backed up successfully.');
        }}
      ]
    );
  };
  
  const handleRestoreData = () => {
    Alert.alert(
      'Restore Data',
      'This feature would restore your notes from a cloud backup.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', onPress: () => {
          // In a real app, this would trigger a restore process
          Alert.alert('Success', 'Your data has been restored successfully.');
        }}
      ]
    );
  };
  
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all notes? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await AsyncStorage.removeItem('notes');
            Alert.alert('Success', 'All notes have been deleted.');
          } catch (error) {
            console.log('Error clearing data:', error);
            Alert.alert('Error', 'Failed to clear data. Please try again.');
          }
        }}
      ]
    );
  };

  // Determine styles based on dark mode
  const containerStyle = darkMode 
    ? [styles.container, { backgroundColor: '#121212' }] 
    : styles.container;
  
  const sectionTitleStyle = darkMode 
    ? [styles.sectionTitle, { color: '#f0f0f0' }] 
    : styles.sectionTitle;
  
  const settingsGroupStyle = darkMode 
    ? [styles.settingsGroup, { backgroundColor: '#1e1e1e' }] 
    : styles.settingsGroup;
  
  const settingLabelStyle = darkMode 
    ? [styles.settingLabel, { color: '#f0f0f0' }] 
    : styles.settingLabel;
  
  const iconColor = darkMode ? '#b0b0b0' : '#555';
  const footerTextStyle = darkMode 
    ? [styles.footerText, { color: '#b0b0b0' }] 
    : styles.footerText;

  return (
    <ScrollView style={[containerStyle, { paddingTop: 16 }]}>
      <Text style={sectionTitleStyle}>Appearance</Text>
      <View style={settingsGroupStyle}>
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="moon-outline" size={22} color={iconColor} style={styles.settingIcon} />
            <Text style={settingLabelStyle}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
            thumbColor="#fff"
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="text-outline" size={22} color={iconColor} style={styles.settingIcon} />
            <Text style={settingLabelStyle}>Font Size</Text>
          </View>
          <View style={styles.fontSizeOptions}>
            <TouchableOpacity
              style={[
                styles.fontSizeButton,
                fontSize === 'small' && styles.fontSizeButtonActive
              ]}
              onPress={() => handleFontSizeChange('small')}
            >
              <Text style={[
                styles.fontSizeButtonText,
                fontSize === 'small' && styles.fontSizeButtonTextActive
              ]}>S</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.fontSizeButton,
                fontSize === 'medium' && styles.fontSizeButtonActive
              ]}
              onPress={() => handleFontSizeChange('medium')}
            >
              <Text style={[
                styles.fontSizeButtonText,
                fontSize === 'medium' && styles.fontSizeButtonTextActive
              ]}>M</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.fontSizeButton,
                fontSize === 'large' && styles.fontSizeButtonActive
              ]}
              onPress={() => handleFontSizeChange('large')}
            >
              <Text style={[
                styles.fontSizeButtonText,
                fontSize === 'large' && styles.fontSizeButtonTextActive
              ]}>L</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <Text style={sectionTitleStyle}>Notifications</Text>
      <View style={settingsGroupStyle}>
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="notifications-outline" size={22} color={iconColor} style={styles.settingIcon} />
            <Text style={settingLabelStyle}>Enable Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
            thumbColor="#fff"
          />
        </View>
      </View>
      
      <Text style={sectionTitleStyle}>Editor</Text>
      <View style={settingsGroupStyle}>
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="save-outline" size={22} color={iconColor} style={styles.settingIcon} />
            <Text style={settingLabelStyle}>Auto Save</Text>
          </View>
          <Switch
            value={autoSave}
            onValueChange={toggleAutoSave}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
            thumbColor="#fff"
          />
        </View>
      </View>
      
      <Text style={sectionTitleStyle}>Data Management</Text>
      <View style={settingsGroupStyle}>
        <TouchableOpacity style={styles.settingButton} onPress={handleBackupData}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="cloud-upload-outline" size={22} color={iconColor} style={styles.settingIcon} />
            <Text style={settingLabelStyle}>Backup Data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingButton} onPress={handleRestoreData}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="cloud-download-outline" size={22} color={iconColor} style={styles.settingIcon} />
            <Text style={settingLabelStyle}>Restore Data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingButton} onPress={handleClearData}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="trash-outline" size={22} color="#FF3B30" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: '#FF3B30' }]}>Clear All Data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      
      <Text style={sectionTitleStyle}>About</Text>
      <View style={settingsGroupStyle}>
        <TouchableOpacity 
          style={styles.settingButton}
          onPress={() => navigation.navigate('Help')}
        >
          <View style={styles.settingLabelContainer}>
            <Ionicons name="help-circle-outline" size={22} color={iconColor} style={styles.settingIcon} />
            <Text style={settingLabelStyle}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="information-circle-outline" size={22} color={iconColor} style={styles.settingIcon} />
            <Text style={settingLabelStyle}>Version</Text>
          </View>
          <Text style={darkMode ? [styles.versionText, { color: '#b0b0b0' }] : styles.versionText}>1.0.0</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={footerTextStyle}>Notes App © 2023</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 16,
    color: '#333',
  },
  settingsGroup: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  fontSizeOptions: {
    flexDirection: 'row',
  },
  fontSizeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#f0f0f0',
  },
  fontSizeButtonActive: {
    backgroundColor: '#007AFF',
  },
  fontSizeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  fontSizeButtonTextActive: {
    color: '#fff',
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});

export default SettingsScreen;
