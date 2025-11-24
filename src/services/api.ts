import axios from 'axios';
import type { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/authStore';

// Get API base URL from environment or use production default
const getApiBaseUrl = (): string => {
  const apiUrl = process.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL;
  return apiUrl || 'https://finbossapi-production.up.railway.app';
};

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false,
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        try {
          // Get token directly from Zustand auth store
          const accessToken = useAuthStore.getState().accessToken;
          if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        } catch (error) {
          console.error('Error retrieving token from auth store:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Log API errors for debugging
        console.error('API Error Details:', {
          status: error.response?.status,
          method: originalRequest?.method,
          url: originalRequest?.url,
          params: originalRequest?.params,
          data: originalRequest?.data,
          message: error?.response?.data?.message || error?.message,
        });

        // If 401 and haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = useAuthStore.getState().refreshToken;
            if (!refreshToken) {
              return Promise.reject(new Error('No refresh token found'));
            }

            const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data.data;

            // Update the auth state in Zustand store
            useAuthStore.setState({
              accessToken,
              refreshToken: newRefreshToken,
            });

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Clear the auth state on refresh failure
            useAuthStore.setState({
              user: null,
              accessToken: null,
              refreshToken: null,
              error: 'Session expired. Please login again.',
            });
            return Promise.reject(refreshError);
          }
        }

        // Create a new error object with better message handling
        const enhancedError = new Error(
          error?.response?.data?.message ||
          error?.message ||
          'An error occurred while connecting to the server'
        );
        Object.assign(enhancedError, error);
        return Promise.reject(enhancedError);
      }
    );
  }

  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const apiClient = new ApiClient();
export const api = apiClient.getAxiosInstance();
export default api;
