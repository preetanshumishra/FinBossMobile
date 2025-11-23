import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { transactionService, budgetService } from '../src';
import { useTheme } from '../src/hooks/useTheme';
import type { Transaction, TransactionSummary, BudgetStatus, CategoryBreakdown } from '../src/types';

export const DashboardScreen = () => {
  const { colors } = useTheme();
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setError('');
      const [summaryData, { transactions }, budgets] = await Promise.all([
        transactionService.getSummary(),
        transactionService.getAll({ limit: 5 }),
        budgetService.getOverview(),
      ]);

      setSummary(summaryData);
      setRecentTransactions(transactions);
      setBudgetStatus(budgets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {error && (
        <View style={styles.errorBanner}>
          <MaterialIcons name="error" size={20} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Summary Cards */}
      <View style={styles.cardsContainer}>
        <View style={[styles.card, styles.incomeCard]}>
          <View style={styles.cardIcon}>
            <MaterialIcons name="trending-up" size={24} color="#27ae60" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Income</Text>
            <Text style={styles.cardAmount}>{formatCurrency(summary?.totalIncome || 0)}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.expenseCard]}>
          <View style={styles.cardIcon}>
            <MaterialIcons name="trending-down" size={24} color="#e74c3c" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Expense</Text>
            <Text style={styles.cardAmount}>{formatCurrency(summary?.totalExpense || 0)}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.balanceCard]}>
          <View style={styles.cardIcon}>
            <MaterialIcons name="account-balance" size={24} color="#3498db" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Balance</Text>
            <Text style={styles.cardAmount}>{formatCurrency(summary?.netIncome || 0)}</Text>
          </View>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="inbox" size={40} color="#bbb" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {recentTransactions.map((transaction) => (
              <View key={transaction._id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      transaction.type === 'income' ? styles.income : styles.expense,
                    ]}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                  <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Budget Overview */}
      {budgetStatus.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Overview</Text>
          <View style={styles.budgetsList}>
            {budgetStatus.slice(0, 3).map((budget) => (
              <View key={budget.category} style={styles.budgetItem}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetCategory}>{budget.category}</Text>
                  <Text
                    style={[
                      styles.budgetStatus,
                      budget.status === 'on-track' ? styles.statusGood : styles.statusWarning,
                    ]}
                  >
                    {budget.status}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          budget.budgetLimit && budget.spent
                            ? (budget.spent / budget.budgetLimit) * 100
                            : 0,
                          100
                        )}%`,
                      },
                      budget.status === 'on-track' ? styles.fillGood : styles.fillWarning,
                    ]}
                  />
                </View>
                <View style={styles.budgetDetails}>
                  <Text style={styles.budgetAmount}>
                    {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.budgetLimit || 0)}
                  </Text>
                  <Text style={styles.budgetRemaining}>
                    {(budget.remaining || 0) >= 0 ? '✓' : '✗'} {formatCurrency(Math.abs(budget.remaining || 0))}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    backgroundColor: '#fee',
    borderBottomWidth: 1,
    borderBottomColor: '#e74c3c',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    flex: 1,
  },
  cardsContainer: {
    padding: 12,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  incomeCard: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  expenseCard: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  balanceCard: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14,
  },
  transactionsList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  transactionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 12,
    color: '#999',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  income: {
    color: '#27ae60',
  },
  expense: {
    color: '#e74c3c',
  },
  transactionDate: {
    fontSize: 11,
    color: '#999',
  },
  budgetsList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  budgetItem: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  budgetStatus: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusGood: {
    backgroundColor: '#f0fdf4',
    color: '#27ae60',
  },
  statusWarning: {
    backgroundColor: '#fef2f2',
    color: '#e74c3c',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  fillGood: {
    backgroundColor: '#27ae60',
  },
  fillWarning: {
    backgroundColor: '#e74c3c',
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetAmount: {
    fontSize: 12,
    color: '#666',
  },
  budgetRemaining: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});
