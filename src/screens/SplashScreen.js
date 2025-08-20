import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDarkMode } from '../hooks/useDarkMode';

const SplashScreen = ({ onFinish }) => {
  const { isDarkMode } = useDarkMode();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

    // Check authentication status
    const checkAuth = async () => {
      try {
        // Wait for animation to complete (minimum 2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if user is logged in
        const userToken = await AsyncStorage.getItem('AUTH_TOKEN');
        
        // Notify parent component that splash screen is done
        onFinish(userToken !== null);
      } catch (error) {
        console.log('Error checking authentication:', error);
        onFinish(false);
      }
    };

    checkAuth();
  }, [onFinish, fadeAnim, scaleAnim]);

  return (
    <View style={[
      styles.container, 
      styles.containerLight // Always use light mode for splash
    ]}>
      <Animated.View style={[
        styles.logoContainer,
        { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        <Image 
          source={require('../../assets/images/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[
          styles.appName,
          styles.textLight // Always use light mode for splash
        ]}>
          Notes App
        </Text>
        <Text style={[
          styles.tagline,
          styles.subTextLight // Always use light mode for splash
        ]}>
          Organize your thoughts
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerLight: {
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textLight: {
    color: '#333333',
  },
  textDark: {
    color: '#f0f0f0',
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
  },
  subTextLight: {
    color: '#666666',
  },
  subTextDark: {
    color: '#b0b0b0',
  },
});

export default SplashScreen;
