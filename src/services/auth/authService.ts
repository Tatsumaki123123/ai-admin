/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { ApiResponseOfObject } from '../../types/api/generic.ts';
import {
  ChangePasswordRequestDto,
  ForgotPasswordRequestDto,
  LoginDto,
  LoginResponse,
  RefreshTokenResponse,
  RegisterDto,
  ResetPasswordRequestDto,
} from '../../types/api/auth.types';
import { apiRequest } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { tokenStorage } from './tokenStorage';

export const authService = {
  /**
   * Login with username and password
   * Session-based authentication: Server returns Set-Cookie header with session ID
   * Browser automatically manages the cookie with withCredentials: true
   */
  login: async (credentials: LoginDto): Promise<LoginResponse> => {
    const response = await apiRequest.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    // The response from apiRequest.post is already the data (AxiosResponse.data)
    // Handle different response formats
    const userData =
      (response as any)?.user || (response as any)?.data?.user || response;

    // Store user data in localStorage
    if (userData && typeof userData === 'object' && 'id' in userData) {
      if (import.meta.env.DEV) {
        console.log('[Auth Service] Session established, storing user:', {
          userId: userData.id,
          email: userData.email,
          roles: userData.roles,
        });
      }

      tokenStorage.setUser(userData);

      // Verify storage
      if (import.meta.env.DEV) {
        console.log('[Auth Service] User stored. Verification:', {
          isAuthenticated: tokenStorage.isAuthenticated(),
          storedUser: tokenStorage.getUser(),
        });
      }
    }

    // Return in LoginResponse format
    const loginResponse: LoginResponse = {
      ...(typeof response === 'object' ? response : {}),
      user: userData as any,
    } as LoginResponse;

    return loginResponse;
  },

  /**
   * Register a new user
   */
  register: async (userData: RegisterDto): Promise<ApiResponseOfObject> => {
    const response = await apiRequest.post<ApiResponseOfObject>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    return response;
  },

  /**
   * Logout current user
   * Session-based: Simply call logout API to clear server-side session
   * Browser cookie is managed automatically by the server
   */
  logout: async (): Promise<void> => {
    try {
      await apiRequest.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage regardless of API response
      tokenStorage.clearAuth();
    }
  },

  /**
   * Refresh session
   * Session-based: Not typically needed as server maintains session via Cookie
   * This method is deprecated for Session-based auth
   */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    // For session-based auth, session refresh is handled server-side
    // This method is kept for backward compatibility but may not be needed
    console.warn(
      '[Auth Service] refreshToken called, but using Session-based auth. Session is maintained server-side.'
    );

    try {
      const response = await apiRequest.post<RefreshTokenResponse>(
        API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        {}
      );
      return response;
    } catch (error) {
      throw new Error('Session refresh failed');
    }
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (email: string): Promise<ApiResponseOfObject> => {
    const request: ForgotPasswordRequestDto = { email };
    const response = await apiRequest.post<ApiResponseOfObject>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      request
    );
    return response;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (
    data: ResetPasswordRequestDto
  ): Promise<ApiResponseOfObject> => {
    const response = await apiRequest.post<ApiResponseOfObject>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );
    return response;
  },

  /**
   * Change password for authenticated user
   */
  changePassword: async (
    data: ChangePasswordRequestDto
  ): Promise<ApiResponseOfObject> => {
    const response = await apiRequest.post<ApiResponseOfObject>(
      API_ENDPOINTS.PROFILE.CHANGE_PASSWORD,
      data
    );
    return response;
  },

  /**
   * Get current user from storage
   */
  getCurrentUser: () => {
    return tokenStorage.getUser();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return tokenStorage.isAuthenticated();
  },
};
