import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDarkMode } from '../../hooks/useDarkMode';

const ProfileScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // User profile data
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [bio, setBio] = useState('I love taking notes and staying organized!');
  
  const { isDarkMode, styles: darkModeStyles } = useDarkMode();
  
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Email cannot be empty');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // In a real app, this would be sent to an API
      // For this demo, we'll just simulate saving
      const userProfile = {
        name,
        email,
        bio
      };
      
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      // Simulate API delay
      setTimeout(() => {
        setIsSaving(false);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      }, 1000);
    } catch (error) {
      console.log('Error saving profile:', error);
      setIsSaving(false);
      Alert.alert('Error', 'Failed to update profile');
    }
  };
  
  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'This feature would allow you to change your password.',
      [{ text: 'OK' }]
    );
  };
  
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              // Force app to re-render by navigating to the auth screen
              // In a real app, you would use a more robust navigation reset
              Alert.alert('Success', 'You have been logged out');
            } catch (error) {
              console.log('Error logging out:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, darkModeStyles.container]}>
      <View style={[styles.header, isDarkMode && { 
        backgroundColor: darkModeStyles.card.backgroundColor,
        borderBottomColor: darkModeStyles.separator.backgroundColor 
      }]}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitials}>JD</Text>
          </View>
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        
        {!isEditing ? (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => setIsEditing(false)}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={[styles.profileInfo, isDarkMode && { 
        backgroundColor: darkModeStyles.card.backgroundColor,
        borderColor: darkModeStyles.card.borderColor
      }]}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, isDarkMode && { color: darkModeStyles.subText.color }]}>Name</Text>
          {isEditing ? (
            <TextInput
              style={[styles.infoInput, isDarkMode && { 
                borderColor: darkModeStyles.separator.backgroundColor,
                backgroundColor: '#2c2c2c',
                color: darkModeStyles.text.color
              }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
            />
          ) : (
            <Text style={[styles.infoValue, isDarkMode && { color: darkModeStyles.text.color }]}>{name}</Text>
          )}
        </View>
        
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, isDarkMode && { color: darkModeStyles.subText.color }]}>Email</Text>
          {isEditing ? (
            <TextInput
              style={[styles.infoInput, isDarkMode && { 
                borderColor: darkModeStyles.separator.backgroundColor,
                backgroundColor: '#2c2c2c',
                color: darkModeStyles.text.color
              }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text style={[styles.infoValue, isDarkMode && { color: darkModeStyles.text.color }]}>{email}</Text>
          )}
        </View>
        
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, isDarkMode && { color: darkModeStyles.subText.color }]}>Bio</Text>
          {isEditing ? (
            <TextInput
              style={[styles.infoInput, styles.bioInput, isDarkMode && { 
                borderColor: darkModeStyles.separator.backgroundColor,
                backgroundColor: '#2c2c2c',
                color: darkModeStyles.text.color
              }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          ) : (
            <Text style={[styles.infoValue, isDarkMode && { color: darkModeStyles.text.color }]}>{bio}</Text>
          )}
        </View>
      </View>
      
      <View style={[styles.accountActions, isDarkMode && { 
        backgroundColor: darkModeStyles.card.backgroundColor,
        borderColor: darkModeStyles.card.borderColor
      }]}>
        <TouchableOpacity 
          style={[styles.accountActionButton, isDarkMode && { 
            borderBottomColor: darkModeStyles.separator.backgroundColor 
          }]}
          onPress={handleChangePassword}
        >
          <Ionicons name="key-outline" size={22} color={isDarkMode ? "#4a9eff" : "#007AFF"} style={styles.actionIcon} />
          <Text style={[styles.actionText, isDarkMode && { color: darkModeStyles.text.color }]}>Change Password</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.accountActionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" style={styles.actionIcon} />
          <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.statsContainer, isDarkMode && { 
        backgroundColor: darkModeStyles.card.backgroundColor,
        borderColor: darkModeStyles.card.borderColor
      }]}>
        <Text style={[styles.statsTitle, isDarkMode && { color: darkModeStyles.text.color }]}>Your Stats</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDarkMode && { color: "#4a9eff" }]}>12</Text>
            <Text style={[styles.statLabel, isDarkMode && { color: darkModeStyles.subText.color }]}>Notes</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDarkMode && { color: "#4a9eff" }]}>5</Text>
            <Text style={[styles.statLabel, isDarkMode && { color: darkModeStyles.subText.color }]}>Favorites</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDarkMode && { color: "#4a9eff" }]}>4</Text>
            <Text style={[styles.statLabel, isDarkMode && { color: darkModeStyles.subText.color }]}>Categories</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#555',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  editActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#a0c8ff',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  profileInfo: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  infoInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  accountActions: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  accountActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
  },
  logoutText: {
    color: '#FF3B30',
  },
  statsContainer: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 30,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    padding: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
});

export default ProfileScreen;
