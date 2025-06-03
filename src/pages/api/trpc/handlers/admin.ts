import { clearCache } from "../serverHelpers";

/**
 * Administrative handlers for system operations
 */
export const adminHandlers = {
  /**
   * Clears the entire server cache.
   * This should be called after data modifications in the admin panel.
   */
  clearCache: async () => {
    clearCache();
    return { success: true, message: "Cache successfully cleared" };
  }
};
