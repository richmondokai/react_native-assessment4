/**
 * Error types for consistent handling
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTHENTICATION_ERROR',
  SERVER: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  STORAGE: 'STORAGE_ERROR',
  SYNC: 'SYNC_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * Simple error handler for consistent error processing
 */
const errorHandler = {
  /**
   * Process an error and determine its type
   * @param {Error|Object} error - Error object
   * @returns {Object} Processed error with type and user-friendly message
   */
  processError: (error) => {
    // Default error structure
    const processedError = {
      type: ERROR_TYPES.UNKNOWN,
      message: error.message || 'An unexpected error occurred',
      originalError: error,
      details: {}
    };
    
    // Determine error type based on available information
    if (error.message && error.message.includes('Network request failed')) {
      processedError.type = ERROR_TYPES.NETWORK;
      processedError.message = 'Network connection error. Please check your internet connection.';
    } 
    else if (error.status === 401) {
      processedError.type = ERROR_TYPES.AUTH;
      processedError.message = 'Authentication error. Please log in again.';
    }
    else if (error.status === 404) {
      processedError.type = ERROR_TYPES.NOT_FOUND;
      processedError.message = 'The requested resource was not found.';
    }
    else if (error.status >= 500) {
      processedError.type = ERROR_TYPES.SERVER;
      processedError.message = 'Server error. Please try again later.';
    }
    
    return processedError;
  }
};

export default errorHandler;