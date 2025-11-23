// Authentication
export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface AuthResponse {
  status: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt?: string;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Transactions
export interface Transaction {
  _id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextRecurrenceDate?: string;
  createdAt: string;
}

export interface TransactionRequest {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

// Budgets
export interface Budget {
  _id: string;
  userId: string;
  category: string;
  limit: number;
  period: 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface BudgetRequest {
  category: string;
  limit: number;
  period: 'monthly' | 'yearly';
}

export interface BudgetStatus {
  category: string;
  budgetLimit: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: 'on-track' | 'warning' | 'exceeded';
}

// Categories
export interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

// API Error
export interface ApiError {
  status: string;
  message: string;
}

// API Response
export interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
}
