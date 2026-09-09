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
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Tag,
  X,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { Currency, Transaction } from '../types';
import { formatCurrency, formatDateDisplay } from '../utils/formatters';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currency: Currency;
  onSelectTransaction?: (tx: Transaction) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  transactions,
  currency,
  onSelectTransaction,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');

  if (!visible) return null;

  const results = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      t.category.toLowerCase().includes(q) ||
      (t.note && t.note.toLowerCase().includes(q)) ||
      t.amount.toString().includes(q)
    );
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Top Search Input */}
          <View style={styles.searchBarRow}>
            <View style={styles.inputBox}>
              <Search size={16} color={COLORS.grayLight} />
              <TextInput
                style={styles.input}
                placeholder="Search transactions, notes, amount..."
                placeholderTextColor={COLORS.grayDark}
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
                  <X size={14} color={COLORS.grayDark} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterPillsRow}>
            {(['all', 'expense', 'income'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setFilterType(t)}
                style={[
                  styles.filterPill,
                  filterType === t && styles.filterPillActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    filterType === t && styles.filterPillTextActive,
                  ]}
                >
                  {t === 'all' ? 'All' : t === 'expense' ? 'Expenses' : 'Income'}
                </Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.matchCount}>
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </Text>
          </View>

          {/* Results List */}
          <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
            {results.length === 0 ? (
              <View style={styles.emptyBox}>
                <Search size={28} color={COLORS.grayDark} />
                <Text style={styles.emptyTitle}>No matching transactions</Text>
                <Text style={styles.emptySubtitle}>
                  Try searching for a different keyword or amount
                </Text>
              </View>
            ) : (
              results.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <TouchableOpacity
                    key={tx.id}
                    style={styles.txRow}
                    onPress={() => {
                      onSelectTransaction?.(tx);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.txLeft}>
                      <View
                        style={[
                          styles.txIconCircle,
                          isIncome
                            ? { backgroundColor: COLORS.incomeBg }
                            : { backgroundColor: COLORS.expenseBg },
                        ]}
                      >
                        {isIncome ? (
                          <ArrowDownLeft size={16} color={COLORS.income} />
                        ) : (
                          <ArrowUpRight size={16} color={COLORS.expense} />
                        )}
                      </View>
                      <View style={styles.txMeta}>
                        <Text style={styles.txCategory} numberOfLines={1}>
                          {tx.category}
                        </Text>
                        <Text style={styles.txNote} numberOfLines={1}>
                          {tx.note || formatDateDisplay(tx.date)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.txRight}>
                      <Text
                        style={[
                          styles.txAmount,
                          isIncome
                            ? { color: COLORS.income }
                            : { color: COLORS.expense },
                        ]}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount, currency)}
                      </Text>
                      <Text style={styles.txDate}>{formatDateDisplay(tx.date)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-start',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  dialog: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#161B22',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#30363D',
    padding: 16,
    gap: 12,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0D1117',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  closeBtn: {
    paddingHorizontal: 4,
  },
  cancelText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  filterPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#21262D',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  filterPillActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  filterPillTextActive: {
    color: '#000000',
  },
  matchCount: {
    marginLeft: 'auto',
    fontSize: 11,
    color: '#64748B',
  },
  resultsList: {
    maxHeight: 380,
  },
  emptyBox: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#21262D',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  txIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txMeta: {
    flex: 1,
    minWidth: 0,
  },
  txCategory: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  txNote: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  txRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  txDate: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
});
