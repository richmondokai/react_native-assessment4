import NetInfo from '@react-native-community/netinfo';

/**
 * Network utility functions for handling online/offline status
 */
const networkUtils = {
  /**
   * Check if the device is currently connected to the internet
   * @returns {Promise<boolean>} True if connected, false otherwise
   */
  isConnected: async () => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected && netInfo.isInternetReachable;
  },
  
  /**
   * Subscribe to network status changes
   * @param {Function} callback - Function to call when network status changes
   * @returns {Function} Unsubscribe function
   */
  subscribeToNetworkChanges: (callback) => {
    return NetInfo.addEventListener(state => {
      const isConnected = state.isConnected && state.isInternetReachable;
      callback(isConnected);
    });
  }
};

export default networkUtils;