import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Check, Plus, Tag, Trash2, X } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { Budget, Category, Currency, SavingsGoal } from '../types';
import { formatCurrency } from '../utils/formatters';
import { SavingsGoalsSection } from './SavingsGoalsSection';

interface BudgetsScreenProps {
  budgets: Budget[];
  categories: Category[];
  currency: Currency;
  periodExpensesByCategory: Record<string, number>;
  savingsGoals?: SavingsGoal[];
  onAddOrUpdateBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
  onAddSavingsGoal?: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateSavingsGoal?: (id: string, update: Partial<SavingsGoal>) => void;
  onDeleteSavingsGoal?: (id: string) => void;
}

export const BudgetsScreen: React.FC<BudgetsScreenProps> = ({
  budgets,
  categories,
  currency,
  periodExpensesByCategory,
  savingsGoals = [],
  onAddOrUpdateBudget,
  onDeleteBudget,
  onAddSavingsGoal,
  onUpdateSavingsGoal,
  onDeleteSavingsGoal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories.filter((c) => c.type === 'expense')[0]?.name || 'Food'
  );
  const [limitAmount, setLimitAmount] = useState<string>('');

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleSave = () => {
    const num = parseFloat(limitAmount);
    if (isNaN(num) || num <= 0) return;

    onAddOrUpdateBudget({
      id: `b-${Date.now()}`,
      category: selectedCategory,
      limit: num,
      period: 'monthly',
      alertThreshold: 80,
    });

    setLimitAmount('');
    setIsModalOpen(false);
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpentInBudgets = budgets.reduce(
    (sum, b) => sum + (periodExpensesByCategory[b.category.toLowerCase()] || 0),
    0
  );
  const totalPercent = totalBudget > 0 ? Math.round((totalSpentInBudgets / totalBudget) * 100) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Savings Goals Section with Circular Progress Rings */}
      <SavingsGoalsSection
        goals={savingsGoals}
        currency={currency}
        onAddGoal={onAddSavingsGoal}
        onUpdateGoal={onUpdateSavingsGoal}
        onDeleteGoal={onDeleteSavingsGoal}
      />

      {/* Header Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel} numberOfLines={1}>
          TOTAL MONTHLY BUDGET
        </Text>
        <Text
          style={styles.summaryAmount}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          {formatCurrency(totalBudget, currency)}
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, totalPercent)}%`,
                  backgroundColor:
                    totalSpentInBudgets > totalBudget
                      ? COLORS.expense
                      : totalPercent > 80
                      ? COLORS.warning
                      : COLORS.primary,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text
              style={styles.spentText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              Spent: {formatCurrency(totalSpentInBudgets, currency)} ({totalPercent}%)
            </Text>
            <Text
              style={styles.remainingText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {totalBudget - totalSpentInBudgets >= 0
                ? `${formatCurrency(totalBudget - totalSpentInBudgets, currency)} left`
                : `${formatCurrency(Math.abs(totalBudget - totalSpentInBudgets), currency)} over`}
            </Text>
          </View>
        </View>
      </View>

      {/* Category Limits List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle} numberOfLines={1}>
          Category Spending Limits
        </Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.8}
        >
          <Plus size={14} color={COLORS.primary} />
          <Text style={styles.addBtnText}>Set Limit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.budgetList}>
        {budgets.map((b) => {
          const spent = periodExpensesByCategory[b.category.toLowerCase()] || 0;
          const percent = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
          const isOver = spent > b.limit;

          return (
            <View key={b.id} style={styles.budgetItem}>
              <View style={styles.itemTopRow}>
                <View style={styles.categoryInfo}>
                  <View style={styles.tagIcon}>
                    <Tag size={14} color={COLORS.primary} />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={1} ellipsizeMode="tail">
                    {b.category}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => onDeleteBudget(b.id)}
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color={COLORS.grayDark} />
                </TouchableOpacity>
              </View>

              <View style={styles.itemAmountRow}>
                <Text
                  style={styles.spentAmount}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  {formatCurrency(spent, currency)}{' '}
                  <Text style={styles.limitAmount}>/ {formatCurrency(b.limit, currency)}</Text>
                </Text>
                <Text
                  style={[
                    styles.percentBadge,
                    isOver && { color: COLORS.expense },
                    !isOver && percent > 80 && { color: COLORS.warning },
                  ]}
                  numberOfLines={1}
                >
                  {percent}%
                </Text>
              </View>

              <View style={styles.itemProgressBg}>
                <View
                  style={[
                    styles.itemProgressFill,
                    {
                      width: `${Math.min(100, percent)}%`,
                      backgroundColor: isOver
                        ? COLORS.expense
                        : percent > 80
                        ? COLORS.warning
                        : COLORS.primary,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Set Budget Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide" onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Category Budget</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={20} color={COLORS.grayLight} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Select Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catChipsRow}>
              {expenseCategories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catChip, isSelected && styles.catChipActive]}
                    onPress={() => setSelectedCategory(cat.name)}
                  >
                    <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.inputLabel}>Monthly Limit ({currency.symbol})</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="e.g. 15000"
              placeholderTextColor={COLORS.grayDark}
              keyboardType="decimal-pad"
              value={limitAmount}
              onChangeText={setLimitAmount}
              autoFocus
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Check size={18} color="#000000" />
              <Text style={styles.saveBtnText}>Save Budget</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.grayDark,
    letterSpacing: 1,
    marginBottom: 6,
  },
  summaryAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 16,
  },
  progressContainer: {
    gap: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#262626',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spentText: {
    fontSize: 12,
    color: COLORS.grayLight,
    fontWeight: '600',
  },
  remainingText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 83, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  budgetList: {
    gap: 12,
  },
  budgetItem: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  tagIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    flex: 1,
    minWidth: 0,
  },
  deleteBtn: {
    padding: 4,
    flexShrink: 0,
  },
  itemAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
  },
  spentAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    flex: 1,
    minWidth: 0,
  },
  limitAmount: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.grayDark,
  },
  percentBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    flexShrink: 0,
  },
  itemProgressBg: {
    height: 6,
    backgroundColor: '#262626',
    borderRadius: 3,
    overflow: 'hidden',
  },
  itemProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 8,
    marginTop: 10,
  },
  catChipsRow: {
    gap: 8,
    paddingBottom: 6,
  },
  catChip: {
    backgroundColor: '#262626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
  },
  catChipText: {
    fontSize: 13,
    color: COLORS.grayLight,
  },
  catChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  amountInput: {
    backgroundColor: '#141414',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
});
