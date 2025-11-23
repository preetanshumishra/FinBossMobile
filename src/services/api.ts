import axios from 'axios';
import type { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get API base URL from environment or use default
const getApiBaseUrl = (): string => {
  const apiUrl = process.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL;
  return apiUrl || 'http://localhost:5000';
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
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error retrieving token from AsyncStorage:', error);
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

        // If 401 and haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            try {
              await AsyncStorage.removeItem('accessToken');
              await AsyncStorage.removeItem('refreshToken');
            } catch (storageError) {
              console.error('Error clearing AsyncStorage:', storageError);
            }
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
