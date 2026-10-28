import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { BarChart3, TrendingUp } from "lucide-react-native";
import { COLORS } from "../constants/theme";
import { Currency } from "../types";
import { formatCurrency } from "../utils/formatters";

export interface MonthlyCashFlow {
  label: string;
  income: number;
  expense: number;
  net: number;
}

interface MonthlyOverviewChartProps {
  data: MonthlyCashFlow[];
  currency: Currency;
  isLight?: boolean;
}

export const MonthlyOverviewChart: React.FC<MonthlyOverviewChartProps> = ({
  data,
  currency,
  isLight = false,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<MonthlyCashFlow | null>(
    data.length > 0 ? data[data.length - 1] : null,
  );

  // Maximum value for scaling bar heights
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense)),
    1000,
  );

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      {/* Header with side-by-side title & status legend pills */}
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <View style={styles.iconBadge}>
            <BarChart3 size={14} color="#00C853" />
          </View>
          <View style={styles.titleTextContainer}>
            <Text
              style={[styles.title, isLight && styles.titleLight]}
              numberOfLines={1}
            >
              Monthly Overview
            </Text>
            <Text
              style={[styles.subtitle, isLight && styles.subtitleLight]}
              numberOfLines={1}
            >
              Income vs Expense
            </Text>
          </View>
        </View>

        {/* Legend status pills sitting strictly side-by-side */}
        <View style={styles.legendRow}>
          <View style={[styles.legendItem, isLight && styles.legendItemLight]}>
            <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
            <Text
              style={[styles.legendText, isLight && styles.legendTextLight]}
              numberOfLines={1}
            >
              Income
            </Text>
          </View>
          <View style={[styles.legendItem, isLight && styles.legendItemLight]}>
            <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
            <Text
              style={[styles.legendText, isLight && styles.legendTextLight]}
              numberOfLines={1}
            >
              Expense
            </Text>
          </View>
        </View>
      </View>

      {/* Selected Month Tooltip / Details Banner */}
      {selectedMonth && (
        <View
          style={[styles.inspectBanner, isLight && styles.inspectBannerLight]}
        >
          <View style={styles.inspectBannerHeader}>
            <Text
              style={[
                styles.inspectMonthTitle,
                isLight && styles.inspectMonthTitleLight,
              ]}
              numberOfLines={1}
            >
              {selectedMonth.label} Breakdown
            </Text>
            <View
              style={[
                styles.netStatusPill,
                selectedMonth.net >= 0
                  ? styles.netStatusPositive
                  : styles.netStatusNegative,
              ]}
            >
              <Text
                style={[
                  styles.netStatusText,
                  selectedMonth.net >= 0
                    ? styles.netPositive
                    : styles.netNegative,
                ]}
                numberOfLines={1}
              >
                {selectedMonth.net >= 0 ? "Surplus" : "Deficit"}
              </Text>
            </View>
          </View>

          <View style={styles.inspectValuesRow}>
            <View
              style={[
                styles.inspectBadgeItem,
                isLight && styles.inspectBadgeItemLight,
              ]}
            >
              <Text
                style={[
                  styles.inspectSubLabel,
                  isLight && styles.inspectSubLabelLight,
                ]}
                numberOfLines={1}
              >
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

            <View
              style={[
                styles.inspectBadgeItem,
                isLight && styles.inspectBadgeItemLight,
              ]}
            >
              <Text
                style={[
                  styles.inspectSubLabel,
                  isLight && styles.inspectSubLabelLight,
                ]}
                numberOfLines={1}
              >
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

            <View
              style={[
                styles.inspectBadgeItem,
                isLight && styles.inspectBadgeItemLight,
              ]}
            >
              <Text
                style={[
                  styles.inspectSubLabel,
                  isLight && styles.inspectSubLabelLight,
                ]}
                numberOfLines={1}
              >
                NET FLOW
              </Text>
              <Text
                style={[
                  styles.netVal,
                  selectedMonth.net >= 0
                    ? styles.netPositive
                    : styles.netNegative,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.65}
              >
                {selectedMonth.net >= 0 ? "+" : ""}
                {formatCurrency(selectedMonth.net, currency)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Bar Chart Area */}
      <View
        style={[styles.chartContainer, isLight && styles.chartContainerLight]}
      >
        {data.map((item, idx) => {
          const incomeHeight = maxVal > 0 ? (item.income / maxVal) * 100 : 0;
          const expenseHeight = maxVal > 0 ? (item.expense / maxVal) * 100 : 0;
          const isSelected = selectedMonth?.label === item.label;

          return (
            <Pressable
              key={idx}
              style={[
                styles.barColumn,
                isSelected &&
                  (isLight
                    ? styles.selectedBarColumnLight
                    : styles.selectedBarColumn),
              ]}
              onPress={() => setSelectedMonth(item)}
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
                        backgroundColor: "#10B981",
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
                        backgroundColor: "#EF4444",
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
                  isLight && styles.monthLabelLight,
                  isSelected && styles.selectedMonthLabel,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Bottom Hint */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <TrendingUp size={12} color="#00C853" />
          <Text style={[styles.footerText, isLight && styles.footerTextLight]}>
            Rolling 6-month performance
          </Text>
        </View>
        <Text style={[styles.footerHint, isLight && styles.footerHintLight]}>
          Tap column to inspect
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1E1E1E",
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#2E2E2E",
  },
  containerLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },
  titleTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(0, 200, 83, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  titleLight: {
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 1,
  },
  subtitleLight: {
    color: "#64748B",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  legendItemLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    color: "#E2E8F0",
    fontWeight: "700",
  },
  legendTextLight: {
    color: "#334155",
  },
  inspectBanner: {
    backgroundColor: "#262626",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#383838",
  },
  inspectBannerLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  inspectBannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  inspectMonthTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  inspectMonthTitleLight: {
    color: "#0F172A",
  },
  netStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  netStatusPositive: {
    backgroundColor: "rgba(0, 200, 83, 0.15)",
  },
  netStatusNegative: {
    backgroundColor: "rgba(255, 61, 0, 0.15)",
  },
  netStatusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  inspectValuesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  inspectBadgeItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "#333333",
  },
  inspectBadgeItemLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  inspectSubLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
    marginBottom: 2,
    textAlign: "center",
  },
  inspectSubLabelLight: {
    color: "#64748B",
  },
  incomeVal: {
    fontSize: 11,
    fontWeight: "700",
    color: "#00C853",
    textAlign: "center",
  },
  expenseVal: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF3D00",
    textAlign: "center",
  },
  netVal: {
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  netPositive: {
    color: "#00C853",
  },
  netNegative: {
    color: "#FF3D00",
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 135,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E",
    gap: 4,
  },
  chartContainerLight: {
    borderBottomColor: "#E2E8F0",
  },
  barColumn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    borderRadius: 8,
    paddingVertical: 2,
    minWidth: 0,
  },
  selectedBarColumn: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  selectedBarColumnLight: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  barsGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 3,
    width: "100%",
    flex: 1,
  },
  barSlot: {
    width: 8,
    height: "100%",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  monthLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 6,
    textAlign: "center",
  },
  monthLabelLight: {
    color: "#64748B",
  },
  selectedMonthLabel: {
    color: "#00C853",
    fontWeight: "800",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 8,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  footerText: {
    fontSize: 10,
    color: "#94A3B8",
    flex: 1,
    minWidth: 0,
  },
  footerTextLight: {
    color: "#64748B",
  },
  footerHint: {
    fontSize: 10,
    color: "#64748B",
    flexShrink: 0,
  },
  footerHintLight: {
    color: "#94A3B8",
  },
});
