import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart3, TrendingUp } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { Currency } from '../types';
import { formatCurrency } from '../utils/formatters';

export interface MonthlyCashFlow {
  label: string;
  income: number;
  expense: number;
  net: number;
}

interface MonthlyOverviewChartProps {
  data: MonthlyCashFlow[];
  currency: Currency;
}

export const MonthlyOverviewChart: React.FC<MonthlyOverviewChartProps> = ({
  data,
  currency,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<MonthlyCashFlow | null>(
    data.length > 0 ? data[data.length - 1] : null
  );

  // Maximum value for scaling bar heights
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense)),
    1000
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <View style={styles.iconBadge}>
            <BarChart3 size={15} color="#00C853" />
          </View>
          <View>
            <Text style={styles.title}>Monthly Overview</Text>
            <Text style={styles.subtitle}>Income vs. Expense Trend</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#00C853' }]} />
            <Text style={styles.legendText}>Income</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF3D00' }]} />
            <Text style={styles.legendText}>Expense</Text>
          </View>
        </View>
      </View>

      {/* Selected Month Tooltip / Details Banner */}
      {selectedMonth && (
        <View style={styles.inspectBanner}>
          <View style={styles.inspectBannerHeader}>
            <Text style={styles.inspectMonthTitle} numberOfLines={1}>
              {selectedMonth.label} Breakdown
            </Text>
            <View
              style={[
                styles.netStatusPill,
                selectedMonth.net >= 0 ? styles.netStatusPositive : styles.netStatusNegative,
              ]}
            >
              <Text
                style={[
                  styles.netStatusText,
                  selectedMonth.net >= 0 ? styles.netPositive : styles.netNegative,
                ]}
                numberOfLines={1}
              >
                {selectedMonth.net >= 0 ? 'Surplus' : 'Deficit'}
              </Text>
            </View>
          </View>

          <View style={styles.inspectValuesRow}>
            <View style={styles.inspectBadgeItem}>
              <Text style={styles.inspectSubLabel} numberOfLines={1}>
                INCOME
              </Text>
              <Text
                style={styles.incomeVal}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.65}
              >
                +{formatCurrency(selectedMonth.income, currency)}
              </Text>
            </View>

            <View style={styles.inspectBadgeItem}>
              <Text style={styles.inspectSubLabel} numberOfLines={1}>
                EXPENSE
              </Text>
              <Text
                style={styles.expenseVal}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.65}
              >
                -{formatCurrency(selectedMonth.expense, currency)}
              </Text>
            </View>

            <View style={styles.inspectBadgeItem}>
              <Text style={styles.inspectSubLabel} numberOfLines={1}>
                NET FLOW
              </Text>
              <Text
                style={[
                  styles.netVal,
                  selectedMonth.net >= 0 ? styles.netPositive : styles.netNegative,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.65}
              >
                {selectedMonth.net >= 0 ? '+' : ''}
                {formatCurrency(selectedMonth.net, currency)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Bar Chart Area */}
      <View style={styles.chartContainer}>
        {data.map((item, idx) => {
          const incomeHeight = maxVal > 0 ? (item.income / maxVal) * 100 : 0;
          const expenseHeight = maxVal > 0 ? (item.expense / maxVal) * 100 : 0;
          const isSelected = selectedMonth?.label === item.label;

          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.barColumn,
                isSelected && styles.selectedBarColumn,
              ]}
              onPress={() => setSelectedMonth(item)}
              activeOpacity={0.7}
            >
              {/* Bars Group */}
              <View style={styles.barsGroup}>
                {/* Income Bar */}
                <View style={styles.barSlot}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${Math.max(incomeHeight, 5)}%`,
                        backgroundColor: '#00C853',
                        opacity: isSelected ? 1 : 0.85,
                      },
                    ]}
                  />
                </View>

                {/* Expense Bar */}
                <View style={styles.barSlot}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${Math.max(expenseHeight, 5)}%`,
                        backgroundColor: '#FF3D00',
                        opacity: isSelected ? 1 : 0.85,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Month Label */}
              <Text
                style={[
                  styles.monthLabel,
                  isSelected && styles.selectedMonthLabel,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom Hint */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <TrendingUp size={12} color="#00C853" />
          <Text style={styles.footerText}>
            Rolling 6-month performance
          </Text>
        </View>
        <Text style={styles.footerHint}>Tap column to inspect</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#2E2E2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  inspectBanner: {
    backgroundColor: '#262626',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#383838',
  },
  inspectBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inspectMonthTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  netStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  netStatusPositive: {
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
  },
  netStatusNegative: {
    backgroundColor: 'rgba(255, 61, 0, 0.15)',
  },
  netStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  inspectValuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  inspectBadgeItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  inspectSubLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
    textAlign: 'center',
  },
  incomeVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00C853',
    textAlign: 'center',
  },
  expenseVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF3D00',
    textAlign: 'center',
  },
  netVal: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  netPositive: {
    color: '#00C853',
  },
  netNegative: {
    color: '#FF3D00',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 135,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#2E2E2E',
    gap: 4,
  },
  barColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 8,
    paddingVertical: 2,
    minWidth: 0,
  },
  selectedBarColumn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  barsGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
    width: '100%',
    flex: 1,
  },
  barSlot: {
    width: 8,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  monthLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
  },
  selectedMonthLabel: {
    color: '#00C853',
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  footerText: {
    fontSize: 10,
    color: '#94A3B8',
    flex: 1,
    minWidth: 0,
  },
  footerHint: {
    fontSize: 10,
    color: '#64748B',
    flexShrink: 0,
  },
});
