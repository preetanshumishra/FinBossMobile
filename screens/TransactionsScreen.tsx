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
import { transactionService, categoryService } from '../src';
import type { Transaction, TransactionRequest } from '../src/types';

export const TransactionsScreen = () => {
  const { colors } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchTransactions = async () => {
    try {
      setError('');
      const { transactions: data } = await transactionService.getAll({ limit: 100 });
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await categoryService.getAll();
      setCategories(cats.map((c: any) => c.name || c));
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const handleAddTransaction = async () => {
    if (!formData.category || !formData.description || !formData.amount) {
      setError('All fields are required');
      return;
    }

    try {
      await transactionService.create({
        type: formData.type,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
      });

      setShowForm(false);
      setFormData({
        type: 'expense',
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await transactionService.delete(id);
      fetchTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
    }
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
      year: 'numeric',
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.content, { backgroundColor: colors.background }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {error && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error" size={20} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="inbox" size={40} color="#bbb" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((transaction) => (
              <View key={transaction._id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
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
                  <TouchableOpacity
                    onPress={() => handleDeleteTransaction(transaction._id)}
                    style={styles.deleteBtn}
                  >
                    <MaterialIcons name="delete" size={16} color="#e74c3c" />
                  </TouchableOpacity>
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
            <Text style={styles.modalTitle}>Add Transaction</Text>
            <TouchableOpacity onPress={handleAddTransaction}>
              <Text style={styles.saveBtn}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[styles.typeBtn, formData.type === 'income' && styles.typeBtnActive]}
                  onPress={() => setFormData({ ...formData, type: 'income' })}
                >
                  <Text style={styles.typeBtnText}>Income</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, formData.type === 'expense' && styles.typeBtnActive]}
                  onPress={() => setFormData({ ...formData, type: 'expense' })}
                >
                  <Text style={styles.typeBtnText}>Expense</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                <FlatList
                  data={categories}
                  keyExtractor={(item) => item}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.categoryItem, formData.category === item && styles.categoryItemActive]}
                      onPress={() => setFormData({ ...formData, category: item })}
                    >
                      <Text style={styles.categoryItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    color: '#999',
    fontSize: 14,
  },
  transactionsList: {
    padding: 12,
    gap: 8,
  },
  transactionItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
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
    color: '#666',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 11,
    color: '#999',
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  income: {
    color: '#27ae60',
  },
  expense: {
    color: '#e74c3c',
  },
  deleteBtn: {
    padding: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
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
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeBtn: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    fontSize: 14,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 200,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryItemActive: {
    backgroundColor: '#f0f9ff',
  },
  categoryItemText: {
    fontSize: 14,
    color: '#333',
  },
});
