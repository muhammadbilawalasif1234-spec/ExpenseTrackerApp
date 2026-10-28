import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import {
  CreditCard,
  Laptop,
  Plus,
  Search,
  ShoppingBag,
  Tag,
  Trash2,
} from "lucide-react-native";
import { COLORS } from "../constants/theme";
import {
  Account,
  Category,
  Currency,
  Transaction,
  TransactionType,
} from "../types";
import { formatCurrency, formatDateDisplay } from "../utils/formatters";
import { SwipeableItem } from "./SwipeableItem";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface ActivityScreenProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  currency: Currency;
  onAddTransaction: () => void;
  onPressTransaction?: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  isLight?: boolean;
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({
  transactions,
  categories,
  accounts,
  currency,
  onAddTransaction,
  onPressTransaction,
  onDeleteTransaction,
  isLight = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    "All" | "Expense" | "Income" | "Transfer"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const renderIcon = (category: string, isIncome: boolean) => {
    const cat = category.toLowerCase();

    // Netflix & Dribbble: Circular pastel warm yellow/peach container with golden outline laptop
    if (cat.includes("netflix") || cat.includes("dribbble")) {
      return (
        <View style={[styles.iconCircle, { backgroundColor: "#FDECCB" }]}>
          <Laptop size={22} color="#D98A17" strokeWidth={2.2} />
        </View>
      );
    }

    // Clothes / Shopping: Circular light lavender-pink container with pink shopping bag
    if (cat.includes("cloth") || cat.includes("shopping")) {
      return (
        <View style={[styles.iconCircle, { backgroundColor: "#F9E8FA" }]}>
          <ShoppingBag size={22} color="#DE6EB8" strokeWidth={2.2} />
        </View>
      );
    }

    // Game Storm / Salary / Income: Circular light mint-green container with green credit card
    if (cat.includes("game") || cat.includes("salary") || isIncome) {
      return (
        <View style={[styles.iconCircle, { backgroundColor: "#D2F5DC" }]}>
          <CreditCard size={22} color="#00BA5E" strokeWidth={2.2} />
        </View>
      );
    }

    return (
      <View style={[styles.iconCircle, { backgroundColor: "#E3EDF7" }]}>
        <Tag size={22} color="#0284C7" strokeWidth={2.2} />
      </View>
    );
  };

  const filtered = (transactions || []).filter((tx) => {
    if (!tx) return false;
    if (activeTab !== "All" && tx.type !== activeTab.toLowerCase()) {
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

  const hasActivityData = filtered.length > 0;
  const shouldScrollActivity = filtered.length > 4;

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      {/* Search Input Bar */}
      <View style={[styles.searchBar, isLight && styles.searchBarLight]}>
        <Search size={18} color={isLight ? "#64748B" : COLORS.grayDark} />
        <TextInput
          style={[styles.searchInput, isLight && styles.searchInputLight]}
          placeholder="Search by category, note..."
          placeholderTextColor={isLight ? "#94A3B8" : COLORS.grayDark}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs: All, Expense, Income, Transfer */}
      <View style={styles.tabsRow}>
        {(["All", "Expense", "Income", "Transfer"] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              style={[
                styles.tab,
                isActive
                  ? styles.tabActive
                  : { backgroundColor: "#FFFFFF", borderColor: "#E2E8F0" },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive ? styles.tabTextActive : { color: "#000000" },
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Transactions List */}
      <ScrollView
        style={[
          styles.scrollList,
          !shouldScrollActivity && { overflow: "hidden" },
        ]}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: shouldScrollActivity ? 90 : 20 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={shouldScrollActivity}
        bounces={false}
        overScrollMode="never"
      >
        {filtered.length === 0 ? (
          <View
            style={[
              styles.emptyContainer,
              isLight && styles.emptyContainerLight,
            ]}
          >
            <Text
              style={[styles.emptyTitle, isLight && styles.emptyTitleLight]}
            >
              No Transactions Found
            </Text>
            <Text style={[styles.emptyDesc, isLight && styles.emptyDescLight]}>
              Try searching with another term or log a new transaction.
            </Text>
            <Pressable style={styles.addBtn} onPress={onAddTransaction}>
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addBtnText}>Add Transaction</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.txListContainer}>
            {filtered.map((tx) => {
              const isIncome = tx.type === "income";

              return (
                <SwipeableItem
                  key={tx.id}
                  onDelete={() => setTxToDelete(tx)}
                  isLight={isLight}
                >
                  <Pressable
                    style={[
                      styles.txCard,
                      {
                        backgroundColor: isLight ? "#FFFFFF" : "#161B22",
                        borderColor: isLight ? "#E2E8F0" : "#30363D",
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() => onPressTransaction?.(tx)}
                  >
                    <View style={styles.txLeft}>
                      {renderIcon(tx.category, isIncome)}

                      <View style={styles.txMeta}>
                        <Text
                          style={styles.txCategory}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {tx.category}
                        </Text>
                        <Text
                          style={styles.txNote}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {tx.note || (isIncome ? "Salary" : "Subcription fee")}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.txRight}>
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
            })}
          </View>
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={() => {
          if (txToDelete) {
            onDeleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }
        }}
        title="Delete Record?"
        message="Are you sure you want to delete this record? This action cannot be undone."
        itemDetails={{
          category: txToDelete?.category,
          amount: txToDelete
            ? `${currency?.symbol || ""}${txToDelete.amount.toFixed(2)}`
            : "",
          note: txToDelete?.note,
        }}
        isLight={isLight}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerLight: {
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
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
  searchBarLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    padding: 0,
  },
  searchInputLight: {
    color: "#0F172A",
  },
  tabsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 14,
    gap: 10,
  },
  tabsRowLight: {
    backgroundColor: "transparent",
  },
  tab: {
    flex: 1,
    height: 42,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  tabActive: {
    backgroundColor: "#5D7D95",
    borderColor: "transparent",
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: "400",
    color: "#000000",
  },
  tabTextLight: {
    color: "#000000",
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "400",
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
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 20,
  },
  emptyContainerLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 6,
  },
  emptyTitleLight: {
    color: "#0F172A",
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.grayDark,
    textAlign: "center",
    marginBottom: 18,
  },
  emptyDescLight: {
    color: "#64748B",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
  },
  txListContainer: {
    gap: 12,
  },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
    minWidth: 0,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  txMeta: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  txCategory: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: -0.2,
  },
  txNote: {
    fontSize: 13,
    fontWeight: "400",
    color: "#64748B",
  },
  txRight: {
    alignItems: "flex-end",
    gap: 4,
    paddingLeft: 8,
  },
  txAmount: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  incomeText: {
    color: "#00BA5E",
  },
  expenseText: {
    color: "#D85A5A",
  },
  deleteAction: {
    padding: 4,
    marginTop: 2,
  },
});
