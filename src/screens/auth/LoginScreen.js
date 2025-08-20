import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../hooks/useDarkMode';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isDarkMode, styles: darkModeStyles } = useDarkMode();

  const { login } = useAuth();

  // Email validation function
  const validateEmail = (emailValue) => {
    // Basic email regex pattern that requires @xxx.com format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailValue) {
      setEmailError('');
      setIsEmailValid(false);
      return false;
    }
    
    if (!emailValue.includes('@')) {
      setEmailError('Email must contain "@" symbol');
      setIsEmailValid(false);
      return false;
    }
    
    if (!emailValue.includes('.')) {
      setEmailError('Email must contain domain extension (e.g., .com)');
      setIsEmailValid(false);
      return false;
    }
    
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email format (e.g., user@example.com)');
      setIsEmailValid(false);
      return false;
    }
    
    // Check for common domain extensions
    const domainPart = emailValue.split('@')[1];
    if (!domainPart || !domainPart.includes('.')) {
      setEmailError('Email must have proper domain (e.g., @gmail.com)');
      setIsEmailValid(false);
      return false;
    }
    
    setEmailError('');
    setIsEmailValid(true);
    return true;
  };

  // Handle email input change with real-time validation
  const handleEmailChange = (value) => {
    setEmail(value);
    // Only validate if user has typed something
    if (value.length > 0) {
      validateEmail(value);
    } else {
      setEmailError('');
      setIsEmailValid(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate email format before attempting login
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', emailError || 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (!result.success) {
        Alert.alert('Login Failed', result.error || 'Invalid email or password');
      }
      // No need to navigate - the AuthContext will update isAuthenticated
      // and AppNavigator will automatically show the main app
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, darkModeStyles.container]}>
      <Text style={[styles.title, isDarkMode && { color: darkModeStyles.text.color }]}>Welcome Back</Text>
      <Text style={[styles.subtitle, isDarkMode && { color: darkModeStyles.subText.color }]}>Sign in to continue</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, isDarkMode && { color: darkModeStyles.text.color }]}>Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input, 
                isDarkMode && darkModeStyles.input,
                emailError && styles.inputError,
                isEmailValid && styles.inputValid
              ]}
              placeholder="Enter your email"
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
            />
            {email.length > 0 && (
              <View style={styles.validationIcon}>
                {isEmailValid ? (
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                ) : emailError ? (
                  <Ionicons name="close-circle" size={20} color="#F44336" />
                ) : null}
              </View>
            )}
          </View>
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, isDarkMode && { color: darkModeStyles.text.color }]}>Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                isDarkMode && darkModeStyles.input
              ]}
              placeholder="Enter your password"
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              style={styles.eyeButton} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye' : 'eye-off'} 
                size={20} 
                color={isDarkMode ? '#888' : '#666'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={[styles.forgotPasswordText, isDarkMode && { color: '#4a9eff' }]}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.button, 
            isLoading && styles.buttonDisabled,
            isDarkMode && darkModeStyles.button
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={[styles.signupText, isDarkMode && { color: darkModeStyles.subText.color }]}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={[styles.signupLink, isDarkMode && { color: '#4a9eff' }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    marginTop: 100,
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
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
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    paddingRight: 45, // Make room for validation icon
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#ffeaea',
  },
  inputValid: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f8f0',
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50, // Make room for eye icon
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 5,
  },
  validationIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#a0c8ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default LoginScreen;