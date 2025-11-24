import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/index';

interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  budgetAlerts: boolean;
  weeklyReport: boolean;
}

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<{ status: string; message: string; data: AuthResponse }>('/auth/register', data);
    return response.data.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<{ status: string; message: string; data: AuthResponse }>('/auth/login', data);
    return response.data.data;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<{ status: string; data: AuthResponse }>('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<{ status: string; data: User }>('/auth/profile');
    return response.data.data;
  },

  updateProfile: async (data: ProfileUpdateRequest): Promise<User> => {
    const response = await api.put<{ status: string; data: User }>('/auth/profile', data);
    return response.data.data;
  },

  changePassword: async (data: PasswordChangeRequest): Promise<{ message: string }> => {
    const response = await api.post<{ status: string; message: string }>('/auth/change-password', data);
    return { message: response.data.message };
  },

  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await api.delete<{ status: string; message: string }>('/auth/account');
    return { message: response.data.message };
  },

  getPreferences: async (): Promise<UserPreferences> => {
    const response = await api.get<{ status: string; data: UserPreferences }>('/auth/preferences');
    return response.data.data;
  },

  savePreferences: async (data: Partial<UserPreferences>): Promise<UserPreferences> => {
    const response = await api.post<{ status: string; data: UserPreferences }>('/auth/preferences', data);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  },
};
