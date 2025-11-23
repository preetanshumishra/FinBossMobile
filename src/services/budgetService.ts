import api from './api';
import type { Budget, BudgetRequest, BudgetStatus } from './types/index';

export const budgetService = {
  getAll: async (): Promise<Budget[]> => {
    const response = await api.get<{ status: string; data: Budget[] }>('/budgets');
    return response.data.data;
  },

  getById: async (id: string): Promise<Budget> => {
    const response = await api.get<{ status: string; data: Budget }>(`/budgets/${id}`);
    return response.data.data;
  },

  create: async (data: BudgetRequest): Promise<Budget> => {
    const response = await api.post<{ status: string; data: Budget }>('/budgets', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<BudgetRequest>): Promise<Budget> => {
    const response = await api.put<{ status: string; data: Budget }>(`/budgets/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/budgets/${id}`);
  },

  getOverview: async (): Promise<BudgetStatus[]> => {
    const response = await api.get<{ status: string; data: BudgetStatus[] }>('/budgets/status/overview');
    return response.data.data;
  },
};
