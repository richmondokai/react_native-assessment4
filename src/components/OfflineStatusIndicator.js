import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../context/NetworkContext';
import { useDarkMode } from '../hooks/useDarkMode';
import offlineQueueService from '../services/offline_queue_service';

/**
 * Component to show offline queue status and sync controls
 */
const OfflineStatusIndicator = () => {
  const { isConnected, syncStatus, syncData } = useNetwork();
  const { isDarkMode, styles: darkModeStyles } = useDarkMode();
  const [queueDetails, setQueueDetails] = useState({
    total: 0,
    byType: {}
  });

  // Load queue details
  useEffect(() => {
    const loadQueueDetails = async () => {
      try {
        const queue = await offlineQueueService.getQueue();
        const pendingOps = queue.filter(op => op.status === 'pending');
        
        const byType = pendingOps.reduce((acc, op) => {
          acc[op.type] = (acc[op.type] || 0) + 1;
          return acc;
        }, {});
        
        setQueueDetails({
          total: pendingOps.length,
          byType
        });
      } catch (error) {
        console.error('Error loading queue details:', error);
      }
    };
    
    loadQueueDetails();
    
    // Refresh every 5 seconds
    const interval = setInterval(loadQueueDetails, 5000);
    return () => clearInterval(interval);
  }, [syncStatus.pendingOperations]);

  if (isConnected && queueDetails.total === 0) {
    return null; // Don't show when online and no pending operations
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.statusSection}>
        <View style={styles.statusRow}>
          <Ionicons 
            name={isConnected ? 'cloud-done' : 'cloud-offline'} 
            size={16} 
            color={isConnected ? '#4CD964' : '#FF3B30'} 
          />
          <Text style={[styles.statusText, isDarkMode && styles.darkText]}>
            {isConnected ? 'Online' : 'Offline'}
          </Text>
        </View>
        
        {queueDetails.total > 0 && (
          <View style={styles.statusRow}>
            <Ionicons name="time" size={16} color="#FF9500" />
            <Text style={[styles.statusText, isDarkMode && styles.darkText]}>
              {queueDetails.total} pending
            </Text>
          </View>
        )}
      </View>
      
      {queueDetails.total > 0 && (
        <View style={styles.detailsSection}>
          {Object.entries(queueDetails.byType).map(([type, count]) => (
            <Text key={type} style={[styles.detailText, isDarkMode && styles.darkSubText]}>
              • {count} {type.replace('_', ' ').toLowerCase()}{count > 1 ? 's' : ''}
            </Text>
          ))}
        </View>
      )}
      
      {isConnected && queueDetails.total > 0 && !syncStatus.isSyncing && (
        <TouchableOpacity style={styles.syncButton} onPress={syncData}>
          <Ionicons name="sync" size={16} color="#fff" />
          <Text style={styles.syncButtonText}>Sync Now</Text>
        </TouchableOpacity>
      )}
      
      {syncStatus.isSyncing && (
        <View style={styles.syncingIndicator}>
          <Ionicons name="sync" size={16} color="#007AFF" />
          <Text style={[styles.syncingText, isDarkMode && styles.darkText]}>Syncing...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  darkContainer: {
    backgroundColor: '#2c2c2c',
    borderColor: '#444',
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  darkText: {
    color: '#f0f0f0',
  },
  darkSubText: {
    color: '#b0b0b0',
  },
  detailsSection: {
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  syncingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  syncingText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default OfflineStatusIndicator;
