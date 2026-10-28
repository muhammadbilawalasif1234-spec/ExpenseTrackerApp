import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Category, Currency, TimeTab, Transaction } from "../types";
import { getCategoryColor } from "../utils/categoryColors";
import { CategoryIconView } from "./CategoryIconView";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { SwipeableItem } from "./SwipeableItem";

interface TransactionsSectionProps {
  transactions: Transaction[];
  currency: Currency;
  periodLabel?: string;
  timeTab?: TimeTab;
  selectedDate?: Date;
  categories?: Category[];
  onPressTransaction?: (tx: Transaction) => void;
  onAddTransaction: () => void;
  onDeleteTransaction?: (id: string) => void;
  onViewAll?: () => void;
  isLight?: boolean;
  isHomeScreen?: boolean;
}

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  transactions,
  currency,
  periodLabel,
  timeTab,
  selectedDate,
  categories = [],
  onPressTransaction,
  onAddTransaction,
  onDeleteTransaction,
  onViewAll,
  isLight = true,
  isHomeScreen = false,
}) => {
  const displayItems = transactions.slice(0, 5);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const subtitleText = React.useMemo(() => {
    if (periodLabel) return periodLabel;
    if (timeTab === "Custom") return "";
    if (timeTab === "Daily" && selectedDate) {
      const now = new Date();
      const isToday =
        selectedDate.getDate() === now.getDate() &&
        selectedDate.getMonth() === now.getMonth() &&
        selectedDate.getFullYear() === now.getFullYear();
      if (isToday) return "Today";
      return selectedDate.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return "";
  }, [periodLabel, timeTab, selectedDate]);

  const renderIcon = (
    category: string,
    subcategory?: string,
    type?: string,
    txColor?: string,
    txIcon?: string,
  ) => {
    const matchedCat = (categories || []).find(
      (c) =>
        c && c.name && c.name.toLowerCase() === (category || "").toLowerCase(),
    );
    let matchedSub = null;
    if (subcategory && matchedCat && matchedCat.subcategories) {
      matchedSub = matchedCat.subcategories.find(
        (s) =>
          s && s.name && s.name.toLowerCase() === subcategory.toLowerCase(),
      );
    }
    const iconName = txIcon || matchedSub?.icon || matchedCat?.icon || category;
    const catColor = txColor || matchedCat?.color || getCategoryColor(category);

    return (
      <CategoryIconView
        iconName={iconName}
        color={catColor}
        size={22}
        containerSize={46}
        customBg={catColor + "22"}
        customColor={catColor}
        isLight={isLight}
      />
    );
  };

  const titleColor = isLight ? "#0F2C4C" : "#FFFFFF";
  const seeAllColor = isLight ? "#0284C7" : "#38BDF8";
  const cardBg = isLight ? "#F1F4FF" : "#1E293B";
  const catTextColor = isLight ? "#1E293B" : "#F8FAFC";

  return (
    <View style={styles.container}>
      <View style={styles.transactionTextWrapper}>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: titleColor }]}>
            Transactions
          </Text>
          {onViewAll && displayItems.length > 0 && (
            <Pressable onPress={onViewAll} hitSlop={8}>
              <Text style={[styles.seeAllText, { color: seeAllColor }]}>
                See All
              </Text>
            </Pressable>
          )}
        </View>

        {displayItems.length > 0 && (
          <View style={styles.todayRow}>
            <Text style={styles.todayText}>{subtitleText || "Today"}</Text>
          </View>
        )}
      </View>

      <View style={styles.txList}>
        {displayItems.length === 0 ? (
          <View style={[styles.emptyContainer, styles.emptyContainerHome]}>
            <View
              style={[
                styles.outerCircle,
                { backgroundColor: isLight ? "#EDF1F5" : "#1C2432" },
              ]}
            >
              <View
                style={[
                  styles.innerCircle,
                  { backgroundColor: isLight ? "#DFE5EC" : "#273545" },
                ]}
              >
                <View style={styles.badgeIcon}>
                  <View style={styles.badgeLine1} />
                  <View style={styles.badgeLine2} />
                  <View style={styles.badgeLine3} />
                </View>
              </View>
            </View>

            <Text
              style={[
                styles.emptyTitle,
                { color: isLight ? "#012E4F" : "#F8FAFC" },
              ]}
            >
              No Transactions Yet
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: isLight ? "#5D7285" : "#94A3B8" },
              ]}
            >
              Your recent spending and income history{"\n"}will show up here.
            </Text>
          </View>
        ) : (
          displayItems.map((tx) => {
            const isIncome = tx.type === "income";

            return (
              <SwipeableItem
                key={tx.id}
                onDelete={
                  onDeleteTransaction ? () => setTxToDelete(tx) : undefined
                }
                isLight={isLight}
              >
                <Pressable
                  style={[styles.txCard, { backgroundColor: cardBg }]}
                  onPress={() => onPressTransaction?.(tx)}
                  accessibilityRole="button"
                >
                  <View style={styles.dataNameContainer}>
                    {renderIcon(
                      tx.category,
                      tx.subcategory,
                      tx.type,
                      (tx as any).categoryColor,
                      (tx as any).categoryIcon,
                    )}

                    <View style={styles.textColumn}>
                      <Text
                        style={[styles.txCategory, { color: catTextColor }]}
                        numberOfLines={1}
                      >
                        {tx.category}
                      </Text>
                      <Text
                        style={[styles.txNote, { color: "#707070" }]}
                        numberOfLines={1}
                      >
                        {tx.subcategory
                          ? tx.note
                            ? `${tx.subcategory}\n${tx.note}`
                            : tx.subcategory
                          : tx.note || (isIncome ? "Salary" : "General")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rightWrapper}>
                    <Text
                      style={[
                        styles.txAmount,
                        isIncome ? styles.incomeText : styles.expenseText,
                      ]}
                      numberOfLines={1}
                    >
                      {isIncome ? "+" : ""}
                      {tx.amount.toFixed(2)}
                    </Text>
                  </View>
                </Pressable>
              </SwipeableItem>
            );
          })
        )}
      </View>

      <DeleteConfirmModal
        visible={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={() => {
          if (txToDelete && onDeleteTransaction) {
            onDeleteTransaction(txToDelete.id);
          }
        }}
        title="Delete Record?"
        message="Are you sure you want to delete this record? This action cannot be undone."
        itemDetails={
          txToDelete
            ? {
                category: txToDelete.category,
                amount: `${currency.symbol}${txToDelete.amount.toFixed(2)}`,
                note: txToDelete.note,
              }
            : undefined
        }
        isLight={isLight}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  transactionTextWrapper: {
    width: "100%",
    height: 52,
    justifyContent: "center",
    gap: 4,
    marginBottom: 4,
  },
  headerRow: {
    height: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: "Poppins",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 26,
  },
  emptyContainerHome: {
    width: "100%",
    maxWidth: 320,
    minHeight: 160,
    alignSelf: "center",
    marginTop: -8,
    marginBottom: 8,
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  seeAllText: {
    fontFamily: "Poppins",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  todayRow: {
    width: 380,
    height: 20,
    justifyContent: "center",
  },
  todayText: {
    fontFamily: "Poppins",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 19.6,
    color: "#707070",
  },
  txList: {
    gap: 12,
  },
  txCard: {
    width: "100%",
    height: 70,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F1F4FF",
    padding: 12,
    alignSelf: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  dataNameContainer: {
    width: 158,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textColumn: {
    flex: 1,
    height: 46,
    justifyContent: "center",
    minWidth: 0,
  },
  txCategory: {
    fontFamily: "Poppins",
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    lineHeight: 22,
  },
  txNote: {
    fontFamily: "Poppins",
    fontSize: 13,
    fontWeight: "400",
    color: "#707070",
    lineHeight: 18,
  },
  rightWrapper: {
    height: 22,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingLeft: 8,
  },
  txAmount: {
    fontFamily: "Poppins",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  incomeText: {
    color: "#10B981",
  },
  expenseText: {
    color: "#EF4444",
  },
  emptyContainer: {
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  outerCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeIcon: {
    width: 34,
    height: 30,
    borderRadius: 6,
    backgroundColor: "#012E4F",
    paddingHorizontal: 7,
    paddingVertical: 6,
    justifyContent: "center",
    gap: 3,
  },
  badgeLine1: {
    width: 20,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: "#FFFFFF",
  },
  badgeLine2: {
    width: 14,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: "#FFFFFF",
  },
  badgeLine3: {
    width: 9,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: "#FFFFFF",
  },
  emptyTitle: {
    fontFamily: "Poppins",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
    textAlign: "center",
    marginTop: 10,
  },
  emptySubtitle: {
    fontFamily: "Poppins",
    fontSize: 13,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 4,
    paddingHorizontal: 10,
  },
});

export default TransactionsSection;
