import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowDownLeft,
  ArrowUpRight,
  PieChart as PieChartIcon,
  TrendingUp,
} from 'lucide-react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { COLORS } from '../constants/theme';
import { Currency, TimeTab, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { MonthlyCashFlow, MonthlyOverviewChart } from './MonthlyOverviewChart';

interface AnalyticsScreenProps {
  transactions: Transaction[];
  categoryItems: {
    category: string;
    total: number;
    count: number;
    percentage: number;
    color: string;
  }[];
  totalExpense: number;
  currency: Currency;
  timeTab: TimeTab;
  periodStats: {
    income: number;
    expense: number;
    netSavings: number;
    savingsRate: number;
  };
  cashFlowTrendData?: MonthlyCashFlow[];
  onPeriodChange: (tab: TimeTab) => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  transactions,
  categoryItems,
  totalExpense,
  currency,
  timeTab,
  periodStats,
  cashFlowTrendData = [],
  onPeriodChange,
}) => {
  // SVG Donut calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Time Tab Switcher */}
      <View style={styles.tabContainer}>
        {(['Daily', 'Monthly', 'Yearly'] as TimeTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, timeTab === tab && styles.activeTab]}
            onPress={() => onPeriodChange(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, timeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cash Flow Summary Cards */}
      <View style={styles.cashFlowGrid}>
        <View style={[styles.statCard, { borderColor: 'rgba(0, 200, 83, 0.3)' }]}>
          <View style={styles.statCardHeader}>
            <Text style={styles.statCardLabel} numberOfLines={1}>
              TOTAL INCOME
            </Text>
            <View style={[styles.iconPill, { backgroundColor: COLORS.incomeBg }]}>
              <ArrowDownLeft size={14} color={COLORS.income} />
            </View>
          </View>
          <Text
            style={[styles.statCardValue, { color: COLORS.income }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            +{formatCurrency(periodStats.income, currency)}
          </Text>
        </View>

        <View style={[styles.statCard, { borderColor: 'rgba(255, 61, 0, 0.3)' }]}>
          <View style={styles.statCardHeader}>
            <Text style={styles.statCardLabel} numberOfLines={1}>
              TOTAL EXPENSE
            </Text>
            <View style={[styles.iconPill, { backgroundColor: COLORS.expenseBg }]}>
              <ArrowUpRight size={14} color={COLORS.expense} />
            </View>
          </View>
          <Text
            style={[styles.statCardValue, { color: COLORS.expense }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            -{formatCurrency(periodStats.expense, currency)}
          </Text>
        </View>
      </View>

      {/* Net Savings & Rate Card */}
      <View style={styles.savingsCard}>
        <View style={styles.savingsRow}>
          <View style={styles.savingsInfo}>
            <Text style={styles.savingsLabel} numberOfLines={1}>
              NET SAVINGS
            </Text>
            <Text
              style={[
                styles.savingsValue,
                periodStats.netSavings < 0 && { color: COLORS.expense },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {formatCurrency(periodStats.netSavings, currency)}
            </Text>
          </View>
          <View style={styles.savingsBadge}>
            <TrendingUp size={16} color={COLORS.primary} />
            <Text style={styles.savingsBadgeText} numberOfLines={1}>
              {periodStats.savingsRate}% Rate
            </Text>
          </View>
        </View>
      </View>

      {/* Monthly Overview Chart */}
      {cashFlowTrendData && cashFlowTrendData.length > 0 && (
        <View style={styles.chartSectionWrapper}>
          <MonthlyOverviewChart data={cashFlowTrendData} currency={currency} />
        </View>
      )}

      {/* Spending by Category Graph Card */}
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownHeader}>
          <View style={styles.breakdownHeaderLeft}>
            <View style={styles.breakdownIconBadge}>
              <PieChartIcon size={15} color="#00C853" />
            </View>
            <View>
              <Text style={styles.breakdownTitle}>Spending by Category</Text>
              <Text style={styles.breakdownSubtitle}>
                Total {formatCurrency(totalExpense, currency)} across categories
              </Text>
            </View>
          </View>
          {categoryItems.length > 0 && (
            <View style={styles.catCountBadge}>
              <Text style={styles.catCountText}>
                {categoryItems.length} {categoryItems.length === 1 ? 'Cat' : 'Cats'}
              </Text>
            </View>
          )}
        </View>

        {categoryItems.length === 0 || totalExpense === 0 ? (
          <Text style={styles.emptyText}>No expenses logged for this period.</Text>
        ) : (
          <View>
            {/* Visual Donut Chart */}
            <View style={styles.donutRow}>
              <View style={styles.donutContainer}>
                <Svg width={110} height={110} viewBox="0 0 110 110">
                  <G rotation="-90" origin="55, 55">
                    <Circle
                      cx="55"
                      cy="55"
                      r={radius}
                      stroke="#2A2A2A"
                      strokeWidth={12}
                      fill="transparent"
                    />
                    {categoryItems.map((item) => {
                      const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                      const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                      accumulatedPercent += item.percentage;

                      return (
                        <Circle
                          key={item.category}
                          cx="55"
                          cy="55"
                          r={radius}
                          stroke={item.color}
                          strokeWidth={12}
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      );
                    })}
                  </G>
                </Svg>

                <View style={styles.donutCenterText}>
                  <Text style={styles.donutCenterTop}>Expenses</Text>
                  <Text style={styles.donutCenterValue} numberOfLines={1}>
                    {formatCurrency(totalExpense, currency)}
                  </Text>
                </View>
              </View>

              {/* Top 3 Legend Highlights */}
              <View style={styles.topCatsList}>
                <Text style={styles.topCatsHeader}>Top Distributions</Text>
                {categoryItems.slice(0, 3).map((item) => (
                  <View key={item.category} style={styles.topCatItem}>
                    <View style={[styles.catColorDot, { backgroundColor: item.color }]} />
                    <Text style={styles.topCatName} numberOfLines={1}>
                      {item.category}
                    </Text>
                    <Text style={styles.topCatPercent}>
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Detailed Category Progress Rows */}
            <View style={styles.categoryList}>
              {categoryItems.map((item) => (
                <View key={item.category} style={styles.categoryRow}>
                  <View style={styles.catLeft}>
                    <View style={[styles.catColorDot, { backgroundColor: item.color }]} />
                    <Text style={styles.catName} numberOfLines={1}>
                      {item.category}
                    </Text>
                  </View>

                  <View style={styles.catMiddle}>
                    <View style={styles.catBarBg}>
                      <View
                        style={[
                          styles.catBarFill,
                          {
                            width: `${Math.min(100, item.percentage)}%`,
                            backgroundColor: item.color,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.catRight}>
                    <Text style={styles.catAmount} numberOfLines={1}>
                      {formatCurrency(item.total, currency)}
                    </Text>
                    <Text style={styles.catPercent}>{item.percentage.toFixed(1)}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 50,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '700',
  },
  cashFlowGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.grayDark,
    letterSpacing: 0.5,
  },
  iconPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  savingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  savingsInfo: {
    flex: 1,
    minWidth: 0,
  },
  savingsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.grayDark,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  savingsValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    flexShrink: 0,
  },
  savingsBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  chartSectionWrapper: {
    marginHorizontal: -16,
    marginBottom: 12,
  },
  breakdownCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  breakdownHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  breakdownIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },
  breakdownSubtitle: {
    fontSize: 11,
    color: COLORS.grayDark,
    marginTop: 1,
  },
  catCountBadge: {
    backgroundColor: 'rgba(0, 200, 83, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 83, 0.25)',
    flexShrink: 0,
  },
  catCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00C853',
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#262626',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  donutContainer: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  donutCenterText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  donutCenterTop: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  donutCenterValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  topCatsList: {
    flex: 1,
    marginLeft: 14,
    gap: 8,
  },
  topCatsHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 2,
  },
  topCatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topCatName: {
    fontSize: 11,
    color: '#E2E8F0',
    flex: 1,
  },
  topCatPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoryList: {
    gap: 12,
  },
  emptyText: {
    color: COLORS.grayDark,
    textAlign: 'center',
    marginVertical: 14,
    fontSize: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 95,
  },
  catColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.grayLight,
  },
  catMiddle: {
    flex: 1,
    paddingHorizontal: 10,
  },
  catBarBg: {
    height: 6,
    backgroundColor: '#262626',
    borderRadius: 3,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  catRight: {
    alignItems: 'flex-end',
    minWidth: 75,
  },
  catAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  catPercent: {
    fontSize: 10,
    color: COLORS.grayDark,
  },
});
