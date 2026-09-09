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
import { Check, X } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { Account, Category, Currency, Transaction, TransactionType } from '../types';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => void;
  categories: Category[];
  accounts: Account[];
  currency: Currency;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  onSave,
  categories,
  accounts,
  currency,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    accounts[0]?.id || ''
  );
  const [note, setNote] = useState<string>('');

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    onSave({
      type,
      amount: numericAmount,
      category: selectedCategory || (filteredCategories[0]?.name ?? 'Other'),
      accountId: selectedAccountId || accounts[0]?.id || 'acc-cash',
      date: new Date().toISOString(),
      note: note.trim() || undefined,
    });

    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>New Transaction</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.grayLight} />
            </TouchableOpacity>
          </View>

          {/* Type Switcher */}
          <View style={styles.typeSwitcher}>
            {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeTab,
                  type === t && styles.activeTypeTab,
                  type === t && t === 'expense' && { backgroundColor: COLORS.expense },
                  type === t && t === 'income' && { backgroundColor: COLORS.income },
                  type === t && t === 'transfer' && { backgroundColor: COLORS.transfer },
                ]}
                onPress={() => setType(t)}
              >
                <Text
                  style={[
                    styles.typeText,
                    type === t && { color: '#FFFFFF', fontWeight: '700' },
                  ]}
                >
                  {t.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount Input */}
          <View style={styles.amountBox}>
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={COLORS.grayDark}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Category Selector */}
            <Text style={styles.sectionLabel}>Select Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {filteredCategories.map((cat) => {
                const isSelected =
                  selectedCategory === cat.name ||
                  (!selectedCategory && filteredCategories[0]?.name === cat.name);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      isSelected && {
                        borderColor: cat.color,
                        backgroundColor: `${cat.color}20`,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat.name)}
                  >
                    <View
                      style={[styles.categoryDot, { backgroundColor: cat.color }]}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        isSelected && { color: COLORS.white, fontWeight: '700' },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Account Selector */}
            <Text style={styles.sectionLabel}>Account</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {accounts.map((acc) => {
                const isSelected = selectedAccountId === acc.id;
                return (
                  <TouchableOpacity
                    key={acc.id}
                    style={[
                      styles.accountChip,
                      isSelected && styles.activeAccountChip,
                    ]}
                    onPress={() => setSelectedAccountId(acc.id)}
                  >
                    <Text
                      style={[
                        styles.accountChipText,
                        isSelected && { color: COLORS.primary, fontWeight: '700' },
                      ]}
                    >
                      {acc.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Note Input */}
            <Text style={styles.sectionLabel}>Note (Optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="e.g. Lunch with team, monthly fuel"
              placeholderTextColor={COLORS.grayDark}
              value={note}
              onChangeText={setNote}
            />
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Check size={18} color="#000000" />
            <Text style={styles.saveBtnText}>Save Transaction</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  closeBtn: {
    padding: 6,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTypeTab: {},
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.grayDark,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141414',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 8,
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    minWidth: 140,
    textAlign: 'center',
  },
  formScroll: {
    maxHeight: 240,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 8,
    marginTop: 10,
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#262626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.grayLight,
  },
  accountChip: {
    backgroundColor: '#262626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeAccountChip: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
  },
  accountChipText: {
    fontSize: 13,
    color: COLORS.grayLight,
  },
  noteInput: {
    backgroundColor: '#141414',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.white,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginTop: 16,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
});
