import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Plus } from "lucide-react-native";
import { Currency } from "../types";
import { formatCurrency } from "../utils/formatters";

export interface IncomeExpenseCardProps {
  periodIncome?: number;
  periodExpense?: number;
  currency: Currency;
  onAddPress?: (type?: "expense" | "income") => void;
  onPressNumbers?: () => void;
  isLight?: boolean;
}

const STATS_FRAME_BG = "#012E4F";

interface ArrowSignProps {
  type: "income" | "expense";
}

const ArrowSign: React.FC<ArrowSignProps> = ({ type }) => {
  const isIncome = type === "income";
  const color = isIncome ? "#53D258" : "#E25C5C";
  const angle = isIncome ? "90deg" : "-90deg";

  return (
    <View style={styles.arrowSignWrapper}>
      <Svg
        width={24}
        height={20}
        viewBox="0 0 20 16"
        fill="none"
        style={{
          width: 24,
          height: 20,
          transform: [{ rotate: angle }],
          opacity: 1,
        }}
      >
        <Path
          d="M 2.5 8 L 17 8 M 11 2.5 L 17 8 L 11 13.5"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

export const IncomeExpenseCard: React.FC<IncomeExpenseCardProps> = ({
  periodIncome = 20000,
  periodExpense = 17000,
  currency,
  onAddPress,
  onPressNumbers,
  isLight = true,
}) => {
  const displayIncome =
    periodIncome !== undefined && !isNaN(periodIncome) ? periodIncome : 20000;
  const displayExpense =
    periodExpense !== undefined && !isNaN(periodExpense)
      ? periodExpense
      : 17000;

  return (
    <View style={styles.cardContainer}>
      {/* Left Column: Income */}
      <View style={styles.statSectionIncome}>
        {/* Plus Badge & Icon: Triggers Add Income modal */}
        <Pressable
          style={styles.iconWrapper}
          onPress={() => onAddPress?.("income")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Add Income"
        >
          <View style={styles.iconBox}>
            <ArrowSign type="income" />
          </View>
          {/* Float badge styling marker */}
          <View style={styles.plusBadge}>
            <Plus size={8} color={STATS_FRAME_BG} strokeWidth={3.5} />
          </View>
        </Pressable>

        {/* Income Number & Label */}
        <View style={styles.textColumn}>
          <Text style={styles.statLabel}>Income</Text>
          <Text
            style={styles.statAmount}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {formatCurrency(displayIncome, currency)}
          </Text>
        </View>
      </View>

      {/* Center Subtle Vertical Divider */}
      <View style={styles.divider} />

      {/* Right Column: Expense */}
      <View style={styles.statSectionExpense}>
        {/* Plus Badge & Icon: Triggers Add Expense modal */}
        <Pressable
          style={styles.iconWrapper}
          onPress={() => onAddPress?.("expense")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Add Expense"
        >
          <View style={styles.iconBox}>
            <ArrowSign type="expense" />
          </View>
          {/* Float badge styling marker */}
          <View style={styles.plusBadge}>
            <Plus size={8} color={STATS_FRAME_BG} strokeWidth={3.5} />
          </View>
        </Pressable>

        {/* Expense Number & Label */}
        <View style={styles.textColumn}>
          <Text style={styles.statLabel}>Expense</Text>
          <Text
            style={styles.statAmount}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {formatCurrency(displayExpense, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    height: 66,
    borderRadius: 10,
    backgroundColor: STATS_FRAME_BG,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statSectionIncome: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 0,
    paddingRight: 4,
  },
  statSectionExpense: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    paddingRight: 0,
  },
  iconWrapper: {
    position: "relative",
    width: 38,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  iconBox: {
    width: 32,
    height: 38,
    borderRadius: 8,
    backgroundColor: STATS_FRAME_BG,
    borderWidth: 1,
    borderColor: "#114B77",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowSignWrapper: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  plusBadge: {
    position: "absolute",
    top: -2,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#D1DFEA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: STATS_FRAME_BG,
  },
  textColumn: {
    marginLeft: 10,
    justifyContent: "center",
    flex: 1,
  },
  statLabel: {
    fontFamily: "Poppins",
    fontSize: 12,
    fontWeight: "400",
    color: "#D3DFE8",
    marginBottom: 1,
  },
  statAmount: {
    fontFamily: "Poppins",
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    marginHorizontal: 0,
  },
});

export default IncomeExpenseCard;
