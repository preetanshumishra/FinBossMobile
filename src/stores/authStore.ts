import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import type { User, LoginRequest, RegisterRequest } from '../types/index';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          set({
            user: {
              userId: response.userId,
              email: response.email,
              firstName: response.firstName,
              lastName: response.lastName,
              createdAt: response.createdAt || new Date().toISOString(),
            },
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
          });
        } catch (error: any) {
          let errorMessage = 'Login failed. Please try again.';
          const status = error?.response?.status;
          const message = error?.response?.data?.message || error?.message;

          // Handle specific error status codes
          if (status === 401 || status === 403) {
            errorMessage = 'Incorrect email or password';
          } else if (status === 404) {
            errorMessage = 'User not found. Please check your email or register.';
          } else if (status === 400) {
            errorMessage = 'Invalid email or password format';
          } else if (status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (status === 503) {
            errorMessage = 'Service unavailable. Please try again later.';
          } else if (message && !message.includes('status code')) {
            errorMessage = message;
          } else if (error?.message?.includes('Network')) {
            errorMessage = 'Network error. Please check your internet connection.';
          } else if (!status) {
            errorMessage = 'Unable to connect to server. Check your internet connection.';
          }

          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          set({
            user: {
              userId: response.userId,
              email: response.email,
              firstName: response.firstName,
              lastName: response.lastName,
              createdAt: response.createdAt || new Date().toISOString(),
            },
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
          });
        } catch (error: any) {
          let errorMessage = 'Registration failed. Please try again.';
          const status = error?.response?.status;
          const message = error?.response?.data?.message || error?.message;

          // Handle specific error status codes
          if (status === 409) {
            errorMessage = 'Email already registered. Please login or use a different email.';
          } else if (status === 400) {
            errorMessage = message || 'Invalid input. Please check your email and password format.';
          } else if (status === 403) {
            errorMessage = 'Registration not allowed. Please contact support.';
          } else if (status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (status === 503) {
            errorMessage = 'Service unavailable. Please try again later.';
          } else if (message && !message.includes('status code')) {
            errorMessage = message;
          } else if (error?.message?.includes('Network')) {
            errorMessage = 'Network error. Please check your internet connection.';
          } else if (!status) {
            errorMessage = 'Unable to connect to server. Check your internet connection.';
          }

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
