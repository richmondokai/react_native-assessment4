import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/auth_remote_services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY, USER_KEY } from '../constants';
import { debugAsyncStorage, clearAllAsyncStorage, clearUserSpecificData } from '../utils/debugStorage';

// Create context
export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  register: () => {},
  logout: () => {},
  forgotPassword: () => {},
  updateProfile: () => {},
});

/**
 * Authentication provider component
 */
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });
  
  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get token from storage
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        
        if (token) {
          // Get user profile if token exists
          const userJson = await AsyncStorage.getItem(USER_KEY);
          const user = userJson ? JSON.parse(userJson) : null;
          
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };
    
    initializeAuth();
  }, []);
  
  /**
   * Log in user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login result
   */
  const login = async (email, password) => {
    try {
      // Call API to login
      const response = await apiLogin(email, password);
      
      console.log('Login response:', response);
      
      // Ensure we have a token
      if (!response.token) {
        console.error('No token received in login response');
        return {
          success: false,
          error: 'Authentication failed: No token received'
        };
      }
      
      // Save token and user data
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      
      // Ensure we have proper user data with unique ID
      const userData = response.user || {};
      const userWithId = {
        ...userData,
        id: userData.id || email, // Use email as unique ID if no ID provided
        email: email
      };
      
      console.log('Logging in user with ID:', userWithId.id);
      console.log('Login user data:', userWithId);
      
      // DEBUG: Check storage before saving user (temporarily disabled to fix crash)
      // await debugAsyncStorage();
      
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userWithId));
      response.user = userWithId;
      
      // Update auth state
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error details:', error);
      
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  };
  
  /**
   * Register new user
   * @param {string} name - User name
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Registration result
   */
  // NUCLEAR OPTION: Completely wipe ALL user data
  const clearAllUserData = async () => {
    try {
      console.log('💥 === NUCLEAR DATA CLEAR FOR NEW USER ===');
      
      // STEP 1: Debug what's currently in storage (temporarily disabled to fix crash)
      // await debugAsyncStorage();
      
      // STEP 2: NUCLEAR OPTION - Clear EVERYTHING except auth tokens
      console.log('🗣️ Using NUCLEAR clear - removing ALL data');
      
      // Get current auth data to preserve
      const currentToken = await AsyncStorage.getItem(TOKEN_KEY);
      const currentUser = await AsyncStorage.getItem(USER_KEY);
      
      // COMPLETELY WIPE EVERYTHING
      await clearAllAsyncStorage();
      
      // Restore only auth data if it exists
      if (currentToken) {
        await AsyncStorage.setItem(TOKEN_KEY, currentToken);
      }
      if (currentUser) {
        await AsyncStorage.setItem(USER_KEY, currentUser);
      }
      
      console.log('💥 NUCLEAR CLEAR COMPLETE - All user data wiped');
      
      // STEP 3: Verify storage is clean (temporarily disabled to fix crash)
      // await debugAsyncStorage();
      
    } catch (error) {
      console.error('❌ Error in nuclear clear:', error);
      
      // Fallback: Try the less aggressive method
      try {
        console.log('🔄 Falling back to targeted clear...');
        await clearUserSpecificData();
      } catch (fallbackError) {
        console.error('❌ Fallback clear also failed:', fallbackError);
      }
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('=== REGISTERING NEW USER ===');
      console.log('Email:', email, 'Name:', name);
      
      // STEP 1: COMPLETELY WIPE ALL EXISTING DATA FIRST
      await clearAllUserData();
      
      // STEP 2: Call API to register
      const response = await apiRegister(email, password, name);
      console.log('Registration API response:', response);
      
      // STEP 3: Ensure we have proper user data
      const userData = response.user || {};
      const userWithId = {
        ...userData,
        id: userData.id || email, // Use email as ID if no ID provided
        email: email,
        name: name
      };
      
      console.log('Final user data to save:', userWithId);
      
      // STEP 4: Do NOT save token/user data - let user log in manually
      // This ensures proper account verification flow
      
      // STEP 5: Keep auth state cleared (user needs to login manually)
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      console.log('✅ New user registered successfully - requires manual login');
      console.log('=== END REGISTRATION ===');
      
      return { success: true, user: userWithId };
    } catch (error) {
      console.error('Register error details:', error);
      
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  };
  
  /**
   * Log out user
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      // Clear auth token and user data
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      
      // Update auth state
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Password reset result
   */
  const forgotPassword = async (email) => {
    try {
      // Note: This API endpoint is not implemented in the provided services
      // For now, we'll just return a mock success
      
      return { success: true };
    } catch (error) {
      console.error('Error in forgot password:', error);
      
      return {
        success: false,
        error: error.message || 'Password reset failed'
      };
    }
  };
  
  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Update result
   */
  const updateProfile = async (profileData) => {
    try {
      // Note: This API endpoint is not implemented in the provided services
      // For now, we'll just update the local storage
      
      const userJson = await AsyncStorage.getItem(USER_KEY);
      const currentUser = userJson ? JSON.parse(userJson) : {};
      
      const updatedUser = {
        ...currentUser,
        ...profileData
      };
      
      // Save updated user data
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      
      // Update auth state
      setAuthState(prevState => ({
        ...prevState,
        user: updatedUser,
      }));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // If it's a 401 error, log out
      if (error.status === 401) {
        await logout();
      }
      
      return {
        success: false,
        error: error.message || 'Profile update failed'
      };
    }
  };
  
  // Context value
  const contextValue = {
    ...authState,
    login,
    register,
    logout,
    forgotPassword,
    updateProfile,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context
 */
export const useAuth = () => useContext(AuthContext);
