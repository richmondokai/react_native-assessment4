import AsyncStorage from '@react-native-async-storage/async-storage';
import { PENDING_OPERATIONS_KEY } from '../constants';

/**
 * Offline operation types
 */
export const OPERATION_TYPES = {
  CREATE_NOTE: 'CREATE_NOTE',
  UPDATE_NOTE: 'UPDATE_NOTE',
  DELETE_NOTE: 'DELETE_NOTE',
  TOGGLE_FAVORITE: 'TOGGLE_FAVORITE',
  UPDATE_PROFILE: 'UPDATE_PROFILE'
};

/**
 * Operation priority levels
 */
export const OPERATION_PRIORITY = {
  HIGH: 1,    // Profile updates, critical changes
  NORMAL: 2,  // Note CRUD operations
  LOW: 3      // Non-critical operations
};

/**
 * Offline operations queue service
 */
class OfflineQueueService {
  constructor() {
    this.isProcessing = false;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second base delay
  }

  /**
   * Add an operation to the offline queue
   * @param {string} type - Operation type
   * @param {Object} data - Operation data
   * @param {number} priority - Operation priority
   * @returns {Promise<string>} Operation ID
   */
  async addOperation(type, data, priority = OPERATION_PRIORITY.NORMAL) {
    try {
      const operation = {
        id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        priority,
        timestamp: new Date().toISOString(),
        retryCount: 0,
        status: 'pending', // pending, processing, completed, failed
        lastAttempt: null,
        error: null
      };

      console.log('=== ADDING OFFLINE OPERATION ===');
      console.log('Operation:', operation);

      const queue = await this.getQueue();
      queue.push(operation);
      
      // Sort by priority (lower number = higher priority)
      queue.sort((a, b) => a.priority - b.priority || new Date(a.timestamp) - new Date(b.timestamp));
      
      await this.saveQueue(queue);
      console.log('Operation added to queue. Total operations:', queue.length);
      console.log('=== END ADD OFFLINE OPERATION ===');

      return operation.id;
    } catch (error) {
      console.error('Error adding operation to queue:', error);
      throw error;
    }
  }

  /**
   * Get all operations in the queue
   * @returns {Promise<Array>} Array of operations
   */
  async getQueue() {
    try {
      const queueData = await AsyncStorage.getItem(PENDING_OPERATIONS_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Error getting queue:', error);
      return [];
    }
  }

  /**
   * Save the queue to storage
   * @param {Array} queue - Operations queue
   */
  async saveQueue(queue) {
    try {
      await AsyncStorage.setItem(PENDING_OPERATIONS_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving queue:', error);
    }
  }

  /**
   * Get pending operations count
   * @returns {Promise<number>} Number of pending operations
   */
  async getPendingCount() {
    try {
      const queue = await this.getQueue();
      return queue.filter(op => op.status === 'pending').length;
    } catch (error) {
      console.error('Error getting pending count:', error);
      return 0;
    }
  }

  /**
   * Remove an operation from the queue
   * @param {string} operationId - Operation ID to remove
   */
  async removeOperation(operationId) {
    try {
      const queue = await this.getQueue();
      const updatedQueue = queue.filter(op => op.id !== operationId);
      await this.saveQueue(updatedQueue);
      
      console.log(`Removed operation ${operationId} from queue`);
    } catch (error) {
      console.error('Error removing operation:', error);
    }
  }

  /**
   * Update operation status
   * @param {string} operationId - Operation ID
   * @param {string} status - New status
   * @param {string} error - Error message if failed
   */
  async updateOperationStatus(operationId, status, error = null) {
    try {
      const queue = await this.getQueue();
      const operationIndex = queue.findIndex(op => op.id === operationId);
      
      if (operationIndex !== -1) {
        queue[operationIndex].status = status;
        queue[operationIndex].lastAttempt = new Date().toISOString();
        if (error) {
          queue[operationIndex].error = error;
        }
        
        await this.saveQueue(queue);
        console.log(`Updated operation ${operationId} status to ${status}`);
      }
    } catch (error) {
      console.error('Error updating operation status:', error);
    }
  }

  /**
   * Increment retry count for an operation
   * @param {string} operationId - Operation ID
   */
  async incrementRetryCount(operationId) {
    try {
      const queue = await this.getQueue();
      const operationIndex = queue.findIndex(op => op.id === operationId);
      
      if (operationIndex !== -1) {
        queue[operationIndex].retryCount += 1;
        queue[operationIndex].lastAttempt = new Date().toISOString();
        await this.saveQueue(queue);
      }
    } catch (error) {
      console.error('Error incrementing retry count:', error);
    }
  }

  /**
   * Clear all completed operations
   */
  async clearCompleted() {
    try {
      const queue = await this.getQueue();
      const activeQueue = queue.filter(op => op.status !== 'completed');
      await this.saveQueue(activeQueue);
      
      console.log(`Cleared ${queue.length - activeQueue.length} completed operations`);
    } catch (error) {
      console.error('Error clearing completed operations:', error);
    }
  }

  /**
   * Clear all operations (use with caution)
   */
  async clearAll() {
    try {
      await this.saveQueue([]);
      console.log('Cleared all operations from queue');
    } catch (error) {
      console.error('Error clearing all operations:', error);
    }
  }

  /**
   * Get operations by type
   * @param {string} type - Operation type
   * @returns {Promise<Array>} Operations of the specified type
   */
  async getOperationsByType(type) {
    try {
      const queue = await this.getQueue();
      return queue.filter(op => op.type === type && op.status === 'pending');
    } catch (error) {
      console.error('Error getting operations by type:', error);
      return [];
    }
  }

  /**
   * Check if an operation exists for a specific note
   * @param {string|number} noteId - Note ID
   * @param {string} type - Operation type
   * @returns {Promise<boolean>} True if operation exists
   */
  async hasOperationForNote(noteId, type) {
    try {
      const queue = await this.getQueue();
      return queue.some(op => 
        op.data.noteId === noteId && 
        op.type === type && 
        op.status === 'pending'
      );
    } catch (error) {
      console.error('Error checking operation for note:', error);
      return false;
    }
  }

  /**
   * Get retry delay based on attempt count (exponential backoff)
   * @param {number} retryCount - Current retry count
   * @returns {number} Delay in milliseconds
   */
  getRetryDelay(retryCount) {
    return this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
  }
}

// Export singleton instance
export default new OfflineQueueService();
