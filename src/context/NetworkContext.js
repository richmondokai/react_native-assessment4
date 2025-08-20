import React, { createContext, useState, useEffect, useContext } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotes } from '../services/notes_remote_services';
import { addAllNotes, getLocalNotes } from '../services/notes_local_services';
import offlineQueueService from '../services/offline_queue_service';
import syncService from '../services/sync_service';

// Create context
export const NetworkContext = createContext({
  isConnected: true,
  isInternetReachable: true,
  lastConnectedAt: null,
  lastDisconnectedAt: null,
  syncStatus: {
    isSyncing: false,
    lastSyncTime: null,
    pendingOperations: 0
  },
  syncData: () => {},
});

/**
 * Network provider component to track and manage network status
 */
export const NetworkProvider = ({ children }) => {
  const [networkState, setNetworkState] = useState({
    isConnected: true,
    isInternetReachable: true,
    lastConnectedAt: null,
    lastDisconnectedAt: null,
    syncStatus: {
      isSyncing: false,
      lastSyncTime: null,
      pendingOperations: 0
    }
  });
  
  // Initialize network state
  useEffect(() => {
    const initializeNetworkState = async () => {
      try {
        // Get initial network state
        const netInfo = await NetInfo.fetch();
        
        // Get last sync time if available
        const lastSyncTimeStr = await AsyncStorage.getItem('LAST_SYNC_TIME');
        const lastSyncTime = lastSyncTimeStr ? parseInt(lastSyncTimeStr, 10) : null;
        
        setNetworkState(prevState => ({
          ...prevState,
          isConnected: netInfo.isConnected,
          isInternetReachable: netInfo.isInternetReachable,
          syncStatus: {
            ...prevState.syncStatus,
            lastSyncTime
          }
        }));
        
        // Update pending operations count
        updatePendingOperationsCount();
      } catch (error) {
        console.error('Error initializing network state:', error);
      }
    };
    
    initializeNetworkState();
  }, []);
  
  // Subscribe to network changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const now = Date.now();
      
      // Update network state
      setNetworkState(prevState => {
        const wasConnected = prevState.isConnected && prevState.isInternetReachable;
        const isConnected = state.isConnected && state.isInternetReachable;
        
        // Track connection/disconnection times
        let lastConnectedAt = prevState.lastConnectedAt;
        let lastDisconnectedAt = prevState.lastDisconnectedAt;
        
        if (!wasConnected && isConnected) {
          // Just connected
          lastConnectedAt = now;
          
          // Trigger sync when reconnecting
          setTimeout(() => syncData(), 1000);
        } else if (wasConnected && !isConnected) {
          // Just disconnected
          lastDisconnectedAt = now;
        }
        
        return {
          ...prevState,
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          lastConnectedAt,
          lastDisconnectedAt
        };
      });
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);
  
  // Update pending operations count using our new queue service
  const updatePendingOperationsCount = async () => {
    try {
      const pendingCount = await offlineQueueService.getPendingCount();
      
      setNetworkState(prevState => ({
        ...prevState,
        syncStatus: {
          ...prevState.syncStatus,
          pendingOperations: pendingCount
        }
      }));
      
      console.log('Updated pending operations count:', pendingCount);
    } catch (error) {
      console.error('Error updating pending operations count:', error);
      
      setNetworkState(prevState => ({
        ...prevState,
        syncStatus: {
          ...prevState.syncStatus,
          pendingOperations: 0
        }
      }));
    }
  };
  
  // Enhanced sync data with server using our new sync service
  const syncData = async () => {
    // Don't sync if already syncing or offline
    if (networkState.syncStatus.isSyncing || !networkState.isConnected) {
      console.log('Skipping sync - already syncing or offline');
      return;
    }
    
    console.log('=== STARTING NETWORK CONTEXT SYNC ===');
    
    try {
      // Set syncing state
      setNetworkState(prevState => ({
        ...prevState,
        syncStatus: {
          ...prevState.syncStatus,
          isSyncing: true
        }
      }));
      
      // Use our enhanced sync service for bidirectional sync
      const syncResult = await syncService.performFullSync();
      
      console.log('Sync completed with result:', syncResult);
      
      // Update pending operations count
      const pendingCount = await offlineQueueService.getPendingCount();
      
      // Update state after sync attempt
      setNetworkState(prevState => ({
        ...prevState,
        syncStatus: {
          isSyncing: false,
          lastSyncTime: Date.now(),
          pendingOperations: pendingCount // Update with actual count
        }
      }));
      
      console.log('=== NETWORK CONTEXT SYNC COMPLETED ===');
      return syncResult;
      
    } catch (error) {
      console.error('Error in network context sync:', error);
      
      // Update state after failed sync
      setNetworkState(prevState => ({
        ...prevState,
        syncStatus: {
          ...prevState.syncStatus,
          isSyncing: false
        }
      }));
      
      return { success: false, error: error.message };
    }
  };
  
  // Context value
  const contextValue = {
    ...networkState,
    syncData
  };
  
  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};

/**
 * Custom hook to use network context
 * @returns {Object} Network context
 */
export const useNetwork = () => useContext(NetworkContext);
