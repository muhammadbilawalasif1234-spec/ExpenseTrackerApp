import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Plus,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { Currency } from '../types';
import { formatCurrency } from '../utils/formatters';

interface BalanceCardProps {
  totalBalance: number;
  periodIncome: number;
  periodExpense: number;
  currency: Currency;
  periodLabel: string;
  onAddPress?: () => void;
  onTransferPress?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalBalance,
  periodIncome,
  periodExpense,
  currency,
  periodLabel,
  onAddPress,
  onTransferPress,
}) => {
  const netSavings = periodIncome - periodExpense;
  const savingsRate =
    periodIncome > 0 ? Math.max(0, Math.round((netSavings / periodIncome) * 100)) : 0;

  return (
    <View style={styles.cardContainer}>
      {/* Top row: Label & Growth indicator */}
      <View style={styles.topRow}>
        <View style={styles.labelGroup}>
          <View style={styles.walletIcon}>
            <Wallet size={14} color="#FFFFFF" />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            Total Net Balance
          </Text>
        </View>

        <View style={styles.badge}>
          <TrendingUp size={11} color="#10B981" />
          <Text style={styles.badgeText}>+8.45% vs last</Text>
        </View>
      </View>

      {/* Main Balance Figure */}
      <View style={styles.balanceRow}>
        <Text
          style={styles.balanceText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {formatCurrency(totalBalance, currency)}
        </Text>
        <View style={styles.savingsRateRow}>
          <Sparkles size={13} color="#F59E0B" />
          <Text style={styles.savingsRateText} numberOfLines={1}>
            Savings Rate: <Text style={styles.savingsRateBold}>{savingsRate}%</Text> this {periodLabel.toLowerCase()}
          </Text>
        </View>
      </View>

      {/* Income & Expense Breakdown Box */}
      <View style={styles.breakdownBox}>
        {/* Income */}
        <View style={styles.statItem}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <ArrowDownLeft size={16} color="#34D399" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel} numberOfLines={1}>
              Income
            </Text>
            <Text
              style={styles.incomeValue}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              +{formatCurrency(periodIncome, currency)}
            </Text>
          </View>
        </View>

        <View style={styles.verticalDivider} />

        {/* Expense */}
        <View style={styles.statItem}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(244, 63, 94, 0.2)' }]}>
            <ArrowUpRight size={16} color="#FB7185" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel} numberOfLines={1}>
              Expense
            </Text>
            <Text
              style={styles.expenseValue}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              -{formatCurrency(periodExpense, currency)}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAddPress}
          activeOpacity={0.85}
        >
          <Plus size={14} color="#000000" strokeWidth={2.5} />
          <Text style={styles.actionButtonText} numberOfLines={1}>
            Add Money
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryActionButton}
          onPress={onTransferPress}
          activeOpacity={0.85}
        >
          <ArrowRightLeft size={14} color="#FFFFFF" />
          <Text style={styles.secondaryActionButtonText} numberOfLines={1}>
            Transfer
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0F5132',
    borderRadius: 24,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  walletIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D1FAE5',
    flexShrink: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
  },
  balanceRow: {
    marginBottom: 14,
  },
  balanceText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  savingsRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  savingsRateText: {
    fontSize: 11,
    color: '#D1FAE5',
    flexShrink: 1,
  },
  savingsRateBold: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  breakdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  statContent: {
    flex: 1,
    minWidth: 0,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  incomeValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#34D399',
  },
  expenseValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FB7185',
  },
  verticalDivider: {
    width: 1,
    height: '75%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 5,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 5,
  },
  secondaryActionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
