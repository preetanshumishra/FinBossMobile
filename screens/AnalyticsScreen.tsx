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
  const styles = getStyles(colors);
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
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
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
          <MaterialIcons name="error" size={20} color={colors.error} />
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
            <Text style={styles.cardAmount}>{formatCurrency(summary?.income || 0)}</Text>
          </View>

          <View style={[styles.card, styles.expenseCard]}>
            <Text style={styles.cardLabel}>Expense</Text>
            <Text style={styles.cardAmount}>{formatCurrency(summary?.expense || 0)}</Text>
          </View>

          <View style={[styles.card, styles.balanceCard]}>
            <Text style={styles.cardLabel}>Net</Text>
            <Text style={styles.cardAmount}>{formatCurrency(summary?.balance || 0)}</Text>
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
                  <Text style={styles.categoryName}>{category._id}</Text>
                  <View style={styles.categoryBar}>
                    <View
                      style={[
                        styles.categoryBarFill,
                        {
                          width: `${getPercentage(
                            category.total,
                            categoryBreakdown.reduce((sum, c) => sum + c.total, 0)
                          )}%` as any,
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.categoryAmount}>
                  <Text style={styles.categoryValue}>{formatCurrency(category.total)}</Text>
                  <Text style={styles.categoryPercent}>
                    {getPercentage(category.total, categoryBreakdown.reduce((sum, c) => sum + c.total, 0))}%
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

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    backgroundColor: colors.errorLight,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: colors.error,
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
    color: colors.text,
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
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  resetBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  dateRangeContainer: {
    backgroundColor: colors.surface,
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
    color: colors.textTertiary,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
    color: colors.textSecondary,
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  categoryList: {
    backgroundColor: colors.surface,
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
    color: colors.text,
    marginBottom: 6,
  },
  categoryBar: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  categoryAmount: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  categoryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  categoryPercent: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  budgetList: {
    backgroundColor: colors.surface,
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
    borderBottomColor: colors.borderLight,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 12,
    color: colors.textSecondary,
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
