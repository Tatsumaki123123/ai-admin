/* eslint-disable */

/**
 * API Client
 * Axios instance with request/response interceptors for authentication and error handling
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { tokenStorage } from '../auth/tokenStorage';
import { ApiErrorResponse } from '../../types/api/generic';
import { store } from '../../redux/store';
import { message } from 'antd';
import {
  convertToMockEndpoint,
  isMockOnlyEndpoint,
} from './mockEndpointMapper';

// DEBUG: Module loaded
console.log('[API Client] Module loaded!');

// API Configuration
const API_HOST = import.meta.env.VITE_API_BASE_URL || 'https://ai.apecode.site';
// Only append /api if not already present
const API_BASE_URL = API_HOST.endsWith('/api') ? API_HOST : `${API_HOST}/api`;

console.log('[API Client] Configuration:', {
  API_HOST,
  API_BASE_URL,
  storeAvailable: !!store,
});

/**
 * Create axios instance with default configuration
 * Session-based authentication: withCredentials enables automatic Cookie handling
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  withCredentials: true, // Enable automatic Cookie sending for Session-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('[API Client] Axios instance created');

/**
 * Request Interceptor
 * - Checks dataMode to route to mock or real API
 * - Adds authorization token to all requests
 */
console.log('[API Client] Setting up request interceptor...');

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('[API Client] ===== INTERCEPTOR CALLED =====');
    console.log('[API Client] Request URL:', config.url);
    console.log('[API Client] Request Method:', config.method);

    // Get current data mode from Redux store
    const state = store.getState();
    const useMockData = state.dataMode?.useMockData ?? false;

    // DEBUG: Log the actual state value
    console.log('[API Client Debug] Redux State:', {
      fullState: state,
      dataModeState: state.dataMode,
      useMockData: useMockData,
      storeExists: !!store,
    });

    // Get the request URL
    const requestUrl = config.url || '';

    // Check if this is a mock-only endpoint (always use mock)
    const forceMock = isMockOnlyEndpoint(requestUrl);

    // Determine if we should use mock data
    const shouldUseMock = forceMock || useMockData;

    if (shouldUseMock) {
      // Convert to mock endpoint
      const mockEndpoint = convertToMockEndpoint(requestUrl);

      if (mockEndpoint) {
        // Update config to use mock endpoint
        config.url = mockEndpoint;
        config.baseURL = ''; // Clear base URL for mock files (served from public/)

        // Don't send auth token for mock requests
        if (config.headers) {
          delete config.headers.Authorization;
        }

        if (import.meta.env.DEV) {
          console.log(
            `[API Request - Mock Mode] ${config.method?.toUpperCase()}`,
            {
              original: requestUrl,
              mock: mockEndpoint,
              forcedMock: forceMock,
            }
          );
        }

        return config;
      }
    }

    // For live mode or when no mock mapping exists
    // new-api uses Authorization header with access_token
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken && config.headers) {
      config.headers['Authorization'] = accessToken;
    }

    // Attach user id header required by new-api
    const currentUser = tokenStorage.getUser();
    if (currentUser?.id && config.headers) {
      config.headers['new-api-user'] = String(currentUser.id);
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(
        `[API Request - Live Mode] ${config.method?.toUpperCase()} ${
          config.url
        }`,
        {
          params: config.params,
          data: config.data,
          authMethod: 'Session-based (Cookie)',
        }
      );
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles responses and errors globally
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        response.data
      );
    }

    // Check if the API response indicates an error (success: false)
    const responseData = response.data;
    if (
      responseData &&
      typeof responseData === 'object' &&
      'success' in responseData
    ) {
      if (responseData.success === false) {
        // Create a custom error with the API message
        const error = new Error(
          responseData.message || 'Request failed'
        ) as AxiosError;
        (error as any).response = response;
        (error as any).status = 200; // HTTP 200 but API says failed

        if (import.meta.env.DEV) {
          console.error('[API Business Error]', {
            message: responseData.message,
            success: responseData.success,
            url: response.config.url,
          });
        }

        message.error(responseData.message || '请求失败');
        return Promise.reject(error);
      }
    }

    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('[API Response Error]', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
      });
    }

    // Handle 401 Unauthorized - Session expired
    // For Session-based auth, server manages session via Cookie
    // 401 means session is invalid/expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear user data from localStorage
      tokenStorage.clearAuth();

      // Only redirect if not already on auth pages and not a background init check
      const isAuthPage = window.location.pathname.startsWith('/auth');
      const isSelfCheck = originalRequest.url?.includes('/user/self');
      if (!isAuthPage && !isSelfCheck) {
        if (import.meta.env.DEV) {
          console.warn('[Session Expired] Redirecting to login...');
        }
        window.location.href = '/auth/signin';
      }

      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error(
        '[Access Denied] You do not have permission to access this resource'
      );
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('[Not Found] The requested resource was not found');
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('[Server Error] An internal server error occurred');
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to handle API errors consistently
 */
export const handleApiError = (error: unknown): ApiErrorResponse => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // Get message from custom error message or API response
    let message =
      (error as any).message ||
      axiosError.response?.data?.message ||
      axiosError.message ||
      'An unexpected error occurred';

    return {
      success: false,
      message: message,
      errors: axiosError.response?.data?.errors,
      statusCode: axiosError.response?.status,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
    };
  }

  return {
    success: false,
    message: 'An unexpected error occurred',
    statusCode: 500,
  };
};

/**
 * Type-safe API request wrapper
 */
export const apiRequest = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    console.log('[apiRequest.get] Called with URL:', url);
    return apiClient.get<T>(url, config).then((response) => response.data);
  },

  post: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    console.log('[apiRequest.post] Called with URL:', url);
    return apiClient
      .post<T>(url, data, config)
      .then((response) => response.data);
  },

  put: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    console.log('[apiRequest.put] Called with URL:', url);
    return apiClient
      .put<T>(url, data, config)
      .then((response) => response.data);
  },

  patch: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    console.log('[apiRequest.patch] Called with URL:', url);
    return apiClient
      .patch<T>(url, data, config)
      .then((response) => response.data);
  },

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    console.log('[apiRequest.delete] Called with URL:', url);
    return apiClient.delete<T>(url, config).then((response) => response.data);
  },
};

console.log('[API Client] apiRequest wrapper exported');

export default apiClient;
