import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../context/NetworkContext';
import { useDarkMode } from '../hooks/useDarkMode';
import offlineQueueService from '../services/offline_queue_service';

const NetworkStatusBar = () => {
  const { isConnected, syncStatus, syncData } = useNetwork();
  const { isDarkMode, styles: darkModeStyles } = useDarkMode();
  const [visible, setVisible] = useState(false);
  const [animatedHeight] = useState(new Animated.Value(0));
  const [detailedPendingInfo, setDetailedPendingInfo] = useState('');
  
  // Load detailed pending info when needed
  useEffect(() => {
    const loadPendingInfo = async () => {
      if (syncStatus.pendingOperations > 0) {
        try {
          const queue = await offlineQueueService.getQueue();
          const pendingOps = queue.filter(op => op.status === 'pending');
          
          const opCounts = pendingOps.reduce((acc, op) => {
            acc[op.type] = (acc[op.type] || 0) + 1;
            return acc;
          }, {});
          
          const details = Object.entries(opCounts).map(([type, count]) => {
            const friendlyType = type.replace('_', ' ').toLowerCase();
            return `${count} ${friendlyType}${count > 1 ? 's' : ''}`;
          }).join(', ');
          
          setDetailedPendingInfo(details);
        } catch (error) {
          console.error('Error loading pending info:', error);
          setDetailedPendingInfo('');
        }
      } else {
        setDetailedPendingInfo('');
      }
    };
    
    loadPendingInfo();
  }, [syncStatus.pendingOperations]);

  // Show/hide based on connection status
  useEffect(() => {
    if (!isConnected) {
      showStatusBar();
    } else if (syncStatus.pendingOperations > 0) {
      showStatusBar();
    } else {
      hideStatusBar();
    }
  }, [isConnected, syncStatus.pendingOperations]);
  
  // Show the status bar
  const showStatusBar = () => {
    setVisible(true);
    Animated.timing(animatedHeight, {
      toValue: 40,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
  // Hide the status bar
  const hideStatusBar = () => {
    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setVisible(false);
    });
  };
  
  // Don't render if not visible
  if (!visible) {
    return null;
  }
  
  // Get status message and style
  const getStatusInfo = () => {
    if (!isConnected) {
      return {
        message: 'You are offline',
        icon: 'cloud-offline-outline',
        style: styles.offline
      };
    } else if (syncStatus.isSyncing) {
      return {
        message: 'Syncing...',
        icon: 'sync-outline',
        style: styles.syncing
      };
    } else if (syncStatus.pendingOperations > 0) {
      const message = detailedPendingInfo 
        ? `${syncStatus.pendingOperations} pending: ${detailedPendingInfo}`
        : `${syncStatus.pendingOperations} changes pending sync`;
      return {
        message,
        icon: 'time-outline',
        style: styles.pending
      };
    } else {
      return {
        message: 'Online',
        icon: 'cloud-done-outline',
        style: styles.online
      };
    }
  };
  
  const { message, icon, style } = getStatusInfo();
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        style,
        { height: animatedHeight },
        isDarkMode && {
          borderBottomColor: darkModeStyles.separator.backgroundColor
        }
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={icon} size={18} color="#fff" style={styles.icon} />
        <Text style={styles.text}>{message}</Text>
      </View>
      
      {isConnected && syncStatus.pendingOperations > 0 && !syncStatus.isSyncing && (
        <TouchableOpacity 
          style={styles.syncButton}
          onPress={syncData}
        >
          <Text style={styles.syncText}>Sync</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  offline: {
    backgroundColor: '#FF3B30',
    borderBottomColor: '#CC2F26',
  },
  online: {
    backgroundColor: '#4CD964',
    borderBottomColor: '#3CB54E',
  },
  syncing: {
    backgroundColor: '#007AFF',
    borderBottomColor: '#0062CC',
  },
  pending: {
    backgroundColor: '#FF9500',
    borderBottomColor: '#CC7600',
  },
  syncButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  syncText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default NetworkStatusBar;
