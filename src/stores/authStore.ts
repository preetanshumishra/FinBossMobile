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
          if (status === 404 || status === 400 || status === 401) {
            errorMessage = 'Incorrect email or password';
          } else if (message) {
            errorMessage = message;
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
          const errorMessage = error?.response?.data?.message || error?.message || 'Registration failed';
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
