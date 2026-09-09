import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, Clock, Plus, Tag } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { Currency, Transaction } from '../types';
import { formatCurrency, formatDateDisplay } from '../utils/formatters';

interface TransactionsSectionProps {
  transactions: Transaction[];
  currency: Currency;
  onPressTransaction?: (tx: Transaction) => void;
  onAddTransaction: () => void;
  onViewAll?: () => void;
}

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  transactions,
  currency,
  onPressTransaction,
  onAddTransaction,
  onViewAll,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          Recent Activity
        </Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Clock size={32} color={COLORS.grayDark} />
          <Text style={styles.emptyTitle}>No Transactions Yet</Text>
          <Text style={styles.emptyDesc}>
            Tap the plus button below to log your first income or expense!
          </Text>
          <TouchableOpacity
            style={styles.emptyAddBtn}
            onPress={onAddTransaction}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#000000" />
            <Text style={styles.emptyAddBtnText}>Add Transaction</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.txList}>
          {transactions.slice(0, 10).map((tx) => {
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';

            return (
              <TouchableOpacity
                key={tx.id}
                style={styles.txItem}
                onPress={() => onPressTransaction?.(tx)}
                activeOpacity={0.7}
              >
                <View style={styles.leftWrapper}>
                  <View
                    style={[
                      styles.iconCircle,
                      isIncome && { backgroundColor: COLORS.incomeBg },
                      tx.type === 'expense' && { backgroundColor: COLORS.expenseBg },
                      isTransfer && { backgroundColor: COLORS.transferBg },
                    ]}
                  >
                    {isIncome ? (
                      <ArrowDownLeft size={16} color={COLORS.income} />
                    ) : isTransfer ? (
                      <Tag size={16} color={COLORS.transfer} />
                    ) : (
                      <ArrowUpRight size={16} color={COLORS.expense} />
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

                <View style={styles.rightWrapper}>
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
                  <Text style={styles.txDate} numberOfLines={1}>
                    {formatDateDisplay(tx.date)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    flex: 1,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 10,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: COLORS.grayDark,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  txList: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  leftWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  txMeta: {
    flex: 1,
    minWidth: 0,
  },
  txCategory: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  txNote: {
    fontSize: 11,
    color: COLORS.grayDark,
    marginTop: 1,
  },
  rightWrapper: {
    alignItems: 'flex-end',
    minWidth: 80,
    flexShrink: 0,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  txDate: {
    fontSize: 10,
    color: COLORS.grayDark,
    marginTop: 2,
  },
});
