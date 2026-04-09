/**
 * Session Storage Utility
 * Manages storage of user information for Session-based authentication
 * Session ID is stored in HTTP-only Cookie by the server, not in localStorage
 */

const USER_KEY = 'user';
const SESSION_FLAG_KEY = 'sessionActive';

export const tokenStorage = {
  /**
   * Store user profile data
   */
  setUser: (user: any): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Mark session as active when user is stored
    localStorage.setItem(SESSION_FLAG_KEY, 'true');
  },

  /**
   * Get user profile data
   */
  getUser: (): any | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Clear all authentication data
   */
  clearAuth: (): void => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_FLAG_KEY);
  },

  /**
   * Check if user is authenticated
   * For session-based auth, check if user data exists in localStorage
   * The actual session validation is done by the server via Cookie
   */
  isAuthenticated: (): boolean => {
    return !!tokenStorage.getUser();
  },

  /**
   * Legacy methods kept for backward compatibility
   * These are no longer used in Session-based auth but kept to avoid breaking existing code
   */
  setAccessToken: (): void => {
    // No-op for session-based auth
  },

  getAccessToken: (): string | null => {
    // Session-based auth doesn't use tokens
    return null;
  },

  setRefreshToken: (): void => {
    // No-op for session-based auth
  },

  getRefreshToken: (): string | null => {
    // Session-based auth doesn't use tokens
    return null;
  },

  setTokens: (): void => {
    // No-op for session-based auth
  },
};
