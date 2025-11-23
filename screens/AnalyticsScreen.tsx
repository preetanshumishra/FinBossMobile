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
import { useTheme } from '../src/hooks/useTheme';
import { MaterialIcons } from '@expo/vector-icons';
import { transactionService, budgetService } from '../src';
import type { Transaction, TransactionSummary, BudgetStatus, CategoryBreakdown } from '../src/types';

export const AnalyticsScreen = () => {
  const { colors } = useTheme();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalyticsData = async () => {
    try {
      setError('');

      const [summaryData, categoryData, budgets] = await Promise.all([
        transactionService.getSummary({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }),
        transactionService.getByCategory({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }),
        budgetService.getOverview(),
      ]);

      setSummary(summaryData);
      setCategoryBreakdown(categoryData);
      setBudgetStatus(budgets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  const handleResetDates = () => {
    setDateRange({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
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

      {/* Date Range Section */}
      <View style={styles.section}>
        <View style={styles.dateRangeHeader}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          <TouchableOpacity onPress={handleResetDates} style={styles.resetBtn}>
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateRangeContainer}>
          <View style={styles.dateInputGroup}>
            <Text style={styles.dateLabel}>From</Text>
            <Text style={styles.dateValue}>{dateRange.startDate}</Text>
          </View>
          <View style={styles.dateInputGroup}>
            <Text style={styles.dateLabel}>To</Text>
            <Text style={styles.dateValue}>{dateRange.endDate}</Text>
          </View>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.cardsContainer}>
          <View style={[styles.card, styles.incomeCard]}>
            <Text style={styles.cardLabel}>Income</Text>
            <Text style={styles.cardAmount}>{formatCurrency(summary?.totalIncome || 0)}</Text>
          </View>

          <View style={[styles.card, styles.expenseCard]}>
            <Text style={styles.cardLabel}>Expense</Text>
            <Text style={styles.cardAmount}>{formatCurrency(summary?.totalExpense || 0)}</Text>
          </View>

          <View style={[styles.card, styles.balanceCard]}>
            <Text style={styles.cardLabel}>Net</Text>
            <Text style={styles.cardAmount}>{formatCurrency(summary?.netIncome || 0)}</Text>
          </View>
        </View>
      </View>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <View style={styles.categoryList}>
            {categoryBreakdown.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.category}</Text>
                  <View style={styles.categoryBar}>
                    <View
                      style={[
                        styles.categoryBarFill,
                        {
                          width: `${getPercentage(
                            category.totalAmount,
                            categoryBreakdown.reduce((sum, c) => sum + c.totalAmount, 0)
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.categoryAmount}>
                  <Text style={styles.categoryValue}>{formatCurrency(category.totalAmount)}</Text>
                  <Text style={styles.categoryPercent}>
                    {getPercentage(category.totalAmount, categoryBreakdown.reduce((sum, c) => sum + c.totalAmount, 0))}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Budget Status */}
      {budgetStatus.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Status</Text>
          <View style={styles.budgetList}>
            {budgetStatus.map((budget) => (
              <View key={budget.category} style={styles.budgetItem}>
                <View style={styles.budgetInfo}>
                  <Text style={styles.budgetCategory}>{budget.category}</Text>
                  <Text style={styles.budgetAmount}>
                    {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.budgetLimit || 0)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.budgetStatus,
                    budget.status === 'on-track' ? styles.statusGood : styles.statusWarning,
                  ]}
                >
                  {budget.status}
                </Text>
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
  section: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  dateRangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  resetBtnText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dateRangeContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    gap: 16,
  },
  dateInputGroup: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    borderRadius: 8,
    padding: 16,
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
  cardLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  categoryItem: {
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  categoryBar: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  categoryAmount: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  categoryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  categoryPercent: {
    fontSize: 11,
    color: '#999',
  },
  budgetList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  budgetItem: {
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  budgetInfo: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 12,
    color: '#666',
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
});
