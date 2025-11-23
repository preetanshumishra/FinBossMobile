import api from './api';

export interface BudgetComparison {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  period: 'monthly' | 'yearly';
}

export const analyticsService = {
  getBudgetVsActual: async (filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<BudgetComparison[]> => {
    const response = await api.get<{ status: string; data: BudgetComparison[] }>(
      '/analytics/budget-vs-actual',
      { params: filters }
    );
    return response.data.data;
  },
};
