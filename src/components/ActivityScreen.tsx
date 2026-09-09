import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Plus,
  Search,
  Tag,
  Trash2,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { Account, Category, Currency, Transaction, TransactionType } from '../types';
import { formatCurrency, formatDateDisplay } from '../utils/formatters';

interface ActivityScreenProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  currency: Currency;
  onAddTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({
  transactions,
  categories,
  accounts,
  currency,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Expense' | 'Income' | 'Transfer'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter((tx) => {
    if (activeTab !== 'All' && tx.type !== activeTab.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCat = tx.category.toLowerCase().includes(q);
      const matchNote = tx.note?.toLowerCase().includes(q);
      return matchCat || matchNote;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color={COLORS.grayDark} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by category, note..."
          placeholderTextColor={COLORS.grayDark}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs: All, Expense, Income, Transfer */}
      <View style={styles.tabsRow}>
        {(['All', 'Expense', 'Income', 'Transfer'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions List */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Transactions Found</Text>
            <Text style={styles.emptyDesc}>
              Try searching with another term or log a new transaction.
            </Text>
            <TouchableOpacity style={styles.addBtn} onPress={onAddTransaction} activeOpacity={0.8}>
              <Plus size={16} color="#000000" />
              <Text style={styles.addBtnText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardWrapper}>
            {filtered.map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';

              return (
                <View key={tx.id} style={styles.txRow}>
                  <View style={styles.txLeft}>
                    <View
                      style={[
                        styles.iconCircle,
                        isIncome && { backgroundColor: COLORS.incomeBg },
                        tx.type === 'expense' && { backgroundColor: COLORS.expenseBg },
                        isTransfer && { backgroundColor: COLORS.transferBg },
                      ]}
                    >
                      {isIncome ? (
                        <ArrowDownLeft size={18} color={COLORS.income} />
                      ) : isTransfer ? (
                        <Tag size={18} color={COLORS.transfer} />
                      ) : (
                        <ArrowUpRight size={18} color={COLORS.expense} />
                      )}
                    </View>

                    <View style={styles.txMeta}>
                      <Text style={styles.txCategory} numberOfLines={1} ellipsizeMode="tail">
                        {tx.category}
                      </Text>
                      <Text style={styles.txNote} numberOfLines={1} ellipsizeMode="tail">
                        {tx.note || formatDateDisplay(tx.date)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.txRight}>
                    <Text
                      style={[
                        styles.txAmount,
                        isIncome && { color: COLORS.income },
                        tx.type === 'expense' && { color: COLORS.expense },
                        isTransfer && { color: COLORS.transfer },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                    >
                      {isIncome ? '+' : tx.type === 'expense' ? '-' : ''}
                      {formatCurrency(tx.amount, currency)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => onDeleteTransaction(tx.id)}
                      style={styles.deleteAction}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={13} color={COLORS.grayDark} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    padding: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
  },
  tabTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  scrollList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  emptyContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.grayDark,
    textAlign: 'center',
    marginBottom: 18,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  cardWrapper: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  txMeta: {
    flex: 1,
    minWidth: 0,
  },
  txCategory: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  txNote: {
    fontSize: 12,
    color: COLORS.grayDark,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
    minWidth: 80,
    flexShrink: 0,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteAction: {
    padding: 4,
  },
});
