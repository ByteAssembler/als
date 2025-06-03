// Define a function that will be populated later to avoid circular dependencies
let _clearCacheFunction: () => void;

/**
 * Sets the clear cache function from outside this module
 * This breaks the circular dependency
 */
export function setClearCacheFunction(fn: () => void) {
  _clearCacheFunction = fn;
}

/**
 * Administrative handlers for system operations
 */
export const adminHandlers = {
  /**
   * Clears the entire server cache.
   * This should be called after data modifications in the admin panel.
   */
  clearCache: async () => {
    if (_clearCacheFunction) {
      _clearCacheFunction();
    } else {
      console.warn("Cache clearing function not set yet");
    }
    return { success: true, message: "Cache successfully cleared" };
  }
};
