import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useTheme } from '../src/hooks/useTheme';
import { MaterialIcons } from '@expo/vector-icons';
import { budgetService, categoryService } from '../src';
import type { Budget, BudgetStatus, Category } from '../src/types/index';

export const BudgetsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    category: '',
    budgetLimit: '',
  });

  const fetchBudgets = async () => {
    try {
      setError('');
      const [allBudgets, statusData] = await Promise.all([
        budgetService.getAll(),
        budgetService.getOverview(),
      ]);
      setBudgets(allBudgets);
      setBudgetStatus(statusData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budgets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await categoryService.getAll();
      setCategories(cats.map((c: Category) => c.name || c));
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBudgets();
  };

  const handleAddBudget = async () => {
    if (!formData.category || !formData.budgetLimit) {
      setError('All fields are required');
      return;
    }

    const limit = parseFloat(formData.budgetLimit);
    if (isNaN(limit) || limit <= 0) {
      setError('Budget amount must be a positive number');
      return;
    }

    try {
      await budgetService.create({
        category: formData.category,
        limit,
        period: 'monthly',
      });

      setShowForm(false);
      setFormData({ category: '', budgetLimit: '' });
      fetchBudgets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add budget');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await budgetService.delete(id);
      fetchBudgets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.content, { backgroundColor: colors.background }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {error && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error" size={20} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {budgetStatus.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="inbox" size={40} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No budgets yet</Text>
          </View>
        ) : (
          <View style={styles.budgetsList}>
            {budgetStatus.map((budget) => (
              <View key={budget.category} style={styles.budgetItem}>
                <View style={styles.budgetHeader}>
                  <View style={styles.budgetTitleSection}>
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
                  <TouchableOpacity
                    onPress={() => {
                      const b = budgets.find((x) => x.category === budget.category);
                      if (b) handleDeleteBudget(b._id);
                    }}
                    style={styles.deleteBtn}
                  >
                    <MaterialIcons name="delete" size={18} color="#e74c3c" />
                  </TouchableOpacity>
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
                  <View>
                    <Text style={styles.detailLabel}>Spent</Text>
                    <Text style={styles.detailAmount}>{formatCurrency(budget.spent || 0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Budget</Text>
                    <Text style={styles.detailAmount}>{formatCurrency(budget.budgetLimit || 0)}</Text>
                  </View>
                  <View style={styles.remainingSection}>
                    <Text style={styles.detailLabel}>Remaining</Text>
                    <Text
                      style={[
                        styles.detailAmount,
                        (budget.remaining || 0) >= 0 ? styles.positive : styles.negative,
                      ]}
                    >
                      {formatCurrency(Math.abs(budget.remaining || 0))}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)}>
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Text style={styles.closeBtn}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Budget</Text>
            <TouchableOpacity onPress={handleAddBudget}>
              <Text style={styles.saveBtn}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                <FlatList
                  data={categories}
                  keyExtractor={(item) => item}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.categoryItem,
                        formData.category === item && styles.categoryItemActive,
                      ]}
                      onPress={() => setFormData({ ...formData, category: item })}
                    >
                      <Text style={styles.categoryItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Budget Limit</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.budgetLimit}
                onChangeText={(text) => setFormData({ ...formData, budgetLimit: text })}
                keyboardType="decimal-pad"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    color: colors.textTertiary,
    fontSize: 14,
  },
  budgetsList: {
    padding: 12,
    gap: 12,
  },
  budgetItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  budgetTitleSection: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  budgetStatus: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusGood: {
    backgroundColor: '#f0fdf4',
    color: '#27ae60',
  },
  statusWarning: {
    backgroundColor: '#fef2f2',
    color: '#e74c3c',
  },
  deleteBtn: {
    padding: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
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
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  detailAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  remainingSection: {
    alignItems: 'flex-end',
  },
  positive: {
    color: '#27ae60',
  },
  negative: {
    color: '#e74c3c',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeBtn: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    padding: 12,
    fontSize: 14,
    color: colors.text,
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    maxHeight: 200,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  categoryItemActive: {
    backgroundColor: '#f0f9ff',
  },
  categoryItemText: {
    fontSize: 14,
    color: colors.text,
  },
});
