import api from './api';

export interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export const categoryService = {
  getAll: async (type?: 'income' | 'expense'): Promise<Category[]> => {
    const params = type ? { type } : undefined;
    const response = await api.get<{ status: string; data: Category[] }>('/categories', { params });
    return response.data.data;
  },

  create: async (data: {
    name: string;
    icon: string;
    color: string;
  }): Promise<Category> => {
    const response = await api.post<{ status: string; data: Category }>('/categories', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<{
    name: string;
    icon: string;
    color: string;
  }>): Promise<Category> => {
    const response = await api.put<{ status: string; data: Category }>(`/categories/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
