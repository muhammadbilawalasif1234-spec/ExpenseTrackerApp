import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { PieChart as PieChartIcon } from "lucide-react-native";
import { COLORS } from "../constants/theme";
import { Currency } from "../types";
import { formatCurrency } from "../utils/formatters";

interface SpendingItem {
  category: string;
  total: number;
  count: number;
  percentage: number;
  color: string;
}

interface CategorySpendingCardProps {
  items: SpendingItem[];
  totalExpense: number;
  currency: Currency;
  periodLabel: string;
  onSelectCategory?: (category: string) => void;
  isLight?: boolean;
}

export const CategorySpendingCard: React.FC<CategorySpendingCardProps> = ({
  items,
  totalExpense,
  currency,
  periodLabel,
  onSelectCategory,
  isLight = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // SVG Donut calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const activeItem = items.find((i) => i.category === selectedCategory);

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <PieChartIcon size={14} color="#00C853" />
          </View>
          <View>
            <Text
              style={[styles.title, isLight && styles.titleLight]}
              numberOfLines={1}
            >
              Spending by Category
            </Text>
            <Text
              style={[styles.subtitle, isLight && styles.subtitleLight]}
              numberOfLines={1}
            >
              {periodLabel}
            </Text>
          </View>
        </View>

        {items.length > 0 && (
          <View style={[styles.badgePill, isLight && styles.badgePillLight]}>
            <Text style={styles.badgeText}>
              {items.length} {items.length === 1 ? "Cat" : "Cats"}
            </Text>
          </View>
        )}
      </View>

      {items.length === 0 || totalExpense === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, isLight && styles.emptyTextLight]}>
            No expenses recorded for this period.
          </Text>
        </View>
      ) : (
        <View>
          {/* Top visual Donut Chart + Main summary */}
          <View
            style={[styles.chartWrapper, isLight && styles.chartWrapperLight]}
          >
            <View style={styles.donutContainer}>
              <Svg width={96} height={96} viewBox="0 0 96 96">
                <G rotation="-90" origin="48, 48">
                  {/* Background base track */}
                  <Circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke={isLight ? "#E2E8F0" : "#2A2A2A"}
                    strokeWidth={11}
                    fill="transparent"
                  />
                  {/* Donut Segments */}
                  {items.map((item) => {
                    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -(
                      (accumulatedPercent / 100) *
                      circumference
                    );
                    accumulatedPercent += item.percentage;
                    const isSelected = selectedCategory === item.category;

                    return (
                      <Circle
                        key={item.category}
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke={item.color}
                        strokeWidth={isSelected ? 14 : 11}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    );
                  })}
                </G>
              </Svg>

              {/* Center Donut Label */}
              <View style={styles.donutCenter}>
                <Text
                  style={[
                    styles.donutCenterLabel,
                    isLight && styles.donutCenterLabelLight,
                  ]}
                  numberOfLines={1}
                >
                  {activeItem ? activeItem.category : "Total"}
                </Text>
                <Text
                  style={[
                    styles.donutCenterVal,
                    isLight && styles.donutCenterValLight,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.65}
                >
                  {activeItem
                    ? `${activeItem.percentage.toFixed(0)}%`
                    : formatCurrency(totalExpense, currency)}
                </Text>
              </View>
            </View>

            {/* Quick side highlight */}
            <View style={styles.donutMeta}>
              <Text
                style={[
                  styles.donutMetaTitle,
                  isLight && styles.donutMetaTitleLight,
                ]}
                numberOfLines={1}
              >
                Top Spending
              </Text>
              {items.slice(0, 2).map((it) => (
                <View key={it.category} style={styles.donutMetaRow}>
                  <View style={[styles.dot, { backgroundColor: it.color }]} />
                  <Text
                    style={[
                      styles.donutMetaName,
                      isLight && styles.donutMetaNameLight,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {it.category}
                  </Text>
                  <Text
                    style={[
                      styles.donutMetaAmount,
                      isLight && styles.donutMetaAmountLight,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                  >
                    {formatCurrency(it.total, currency)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Category Progress Bars */}
          <View style={styles.list}>
            {items.slice(0, 5).map((item) => {
              const isSelected = selectedCategory === item.category;
              return (
                <Pressable
                  key={item.category}
                  style={[
                    styles.itemRow,
                    isSelected &&
                      (isLight
                        ? styles.selectedItemRowLight
                        : styles.selectedItemRow),
                  ]}
                  onPress={() => {
                    const next =
                      selectedCategory === item.category ? null : item.category;
                    setSelectedCategory(next);
                    if (next && onSelectCategory) {
                      onSelectCategory(next);
                    }
                  }}
                >
                  <View style={styles.leftCol}>
                    <View
                      style={[styles.dot, { backgroundColor: item.color }]}
                    />
                    <Text
                      style={[
                        styles.categoryName,
                        isLight && styles.categoryNameLight,
                        isSelected &&
                          (isLight
                            ? styles.selectedCatNameLight
                            : styles.selectedCatName),
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.category}
                    </Text>
                  </View>

                  <View style={styles.centerCol}>
                    <View style={[styles.barBg, isLight && styles.barBgLight]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${Math.min(100, Math.max(5, item.percentage))}%`,
                            backgroundColor: item.color,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.rightCol}>
                    <Text
                      style={[
                        styles.amount,
                        isLight && styles.amountLight,
                        isSelected && { color: item.color },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                    >
                      {formatCurrency(item.total, currency)}
                    </Text>
                    <Text
                      style={[
                        styles.percentage,
                        isLight && styles.percentageLight,
                      ]}
                      numberOfLines={1}
                    >
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
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
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
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
  badgePill: {
    backgroundColor: "rgba(0, 200, 83, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 200, 83, 0.25)",
    flexShrink: 0,
  },
  badgePillLight: {
    backgroundColor: "rgba(0, 200, 83, 0.1)",
    borderColor: "rgba(0, 200, 83, 0.2)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#00C853",
  },
  emptyContainer: {
    paddingVertical: 18,
    alignItems: "center",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 12,
  },
  emptyTextLight: {
    color: "#64748B",
  },
  chartWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#262626",
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#333333",
  },
  chartWrapperLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  donutContainer: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flexShrink: 0,
  },
  donutCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    width: 68,
  },
  donutCenterLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  donutCenterLabelLight: {
    color: "#64748B",
  },
  donutCenterVal: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 1,
    textAlign: "center",
  },
  donutCenterValLight: {
    color: "#0F172A",
  },
  donutMeta: {
    flex: 1,
    marginLeft: 12,
    gap: 6,
    minWidth: 0,
  },
  donutMetaTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#CBD5E1",
    marginBottom: 2,
  },
  donutMetaTitleLight: {
    color: "#64748B",
  },
  donutMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  donutMetaName: {
    fontSize: 11,
    color: "#E2E8F0",
    flex: 1,
    minWidth: 0,
  },
  donutMetaNameLight: {
    color: "#334155",
  },
  donutMetaAmount: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "right",
    flexShrink: 0,
  },
  donutMetaAmountLight: {
    color: "#0F172A",
  },
  list: {
    gap: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  selectedItemRow: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  selectedItemRowLight: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  leftCol: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1.1,
    minWidth: 0,
    maxWidth: 115,
    gap: 6,
    marginRight: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    flexShrink: 0,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#E2E8F0",
    flex: 1,
    minWidth: 0,
  },
  categoryNameLight: {
    color: "#334155",
  },
  selectedCatName: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  selectedCatNameLight: {
    color: "#0F172A",
  },
  centerCol: {
    flex: 1,
    paddingHorizontal: 6,
    minWidth: 0,
  },
  barBg: {
    height: 5,
    backgroundColor: "#2A2A2A",
    borderRadius: 3,
    overflow: "hidden",
  },
  barBgLight: {
    backgroundColor: "#E2E8F0",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  rightCol: {
    alignItems: "flex-end",
    minWidth: 76,
    flexShrink: 0,
    paddingLeft: 4,
  },
  amount: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  amountLight: {
    color: "#0F172A",
  },
  percentage: {
    fontSize: 9,
    color: "#94A3B8",
  },
  percentageLight: {
    color: "#64748B",
  },
});
