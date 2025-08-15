import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDarkMode } from '../../hooks/useDarkMode';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode, styles: darkModeStyles } = useDarkMode();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, you would create an account with an API
      // For this demo, we'll just simulate a successful signup
      await AsyncStorage.setItem('userToken', 'demo-token');
      
      // Just set the token and let AppNavigator handle the navigation
      // The AppNavigator will detect the token and show the main app
    } catch (error) {
      console.log('Signup error:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, darkModeStyles.container]}>
      <Text style={[styles.title, isDarkMode && { color: darkModeStyles.text.color }]}>Create Account</Text>
      <Text style={[styles.subtitle, isDarkMode && { color: darkModeStyles.subText.color }]}>Sign up to get started</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, isDarkMode && { color: darkModeStyles.text.color }]}>Full Name</Text>
          <TextInput
            style={[styles.input, isDarkMode && darkModeStyles.input]}
            placeholder="Enter your full name"
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, isDarkMode && { color: darkModeStyles.text.color }]}>Email</Text>
          <TextInput
            style={[styles.input, isDarkMode && darkModeStyles.input]}
            placeholder="Enter your email"
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, isDarkMode && { color: darkModeStyles.text.color }]}>Password</Text>
          <TextInput
            style={[styles.input, isDarkMode && darkModeStyles.input]}
            placeholder="Create a password"
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, isDarkMode && { color: darkModeStyles.text.color }]}>Confirm Password</Text>
          <TextInput
            style={[styles.input, isDarkMode && darkModeStyles.input]}
            placeholder="Confirm your password"
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.button, 
            isLoading && styles.buttonDisabled,
            isDarkMode && darkModeStyles.button
          ]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, isDarkMode && { color: darkModeStyles.subText.color }]}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.loginLink, isDarkMode && { color: '#4a9eff' }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 80,
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonDisabled: {
    backgroundColor: '#a0c8ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default SignupScreen;