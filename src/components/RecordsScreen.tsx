import { Calendar as CalendarIcon, Plus, Search } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Account, Category, Currency, Transaction } from "../types";
import { getCategoryColor } from "../utils/categoryColors";
import { CategoryIconView } from "./CategoryIconView";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { SwipeableItem } from "./SwipeableItem";

interface RecordsScreenProps {
  transactions: Transaction[];
  currency: Currency;
  accounts?: Account[];
  categories?: Category[];
  onAddNewClick: () => void;
  onPressTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onBack?: () => void;
  isLight?: boolean;
}

export const RecordsScreen: React.FC<RecordsScreenProps> = ({
  transactions,
  currency,
  accounts = [],
  categories = [],
  onAddNewClick,
  onPressTransaction,
  onDeleteTransaction,
  onBack,
  isLight = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    let list = transactions || [];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter((tx) => {
        const cat = tx.category.toLowerCase();
        const note = (tx.note || "").toLowerCase();
        const amt = tx.amount.toString();
        return (
          cat.includes(query) || note.includes(query) || amt.includes(query)
        );
      });
    }
    return [...list].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [transactions, searchQuery]);

  const groupedTransactions = useMemo(() => {
    const groups: { dateHeader: string; items: Transaction[] }[] = [];
    const map = new Map<string, Transaction[]>();
    filteredTransactions.forEach((tx) => {
      const d = new Date(tx.date);
      const header = d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!map.has(header)) map.set(header, []);
      map.get(header)!.push(tx);
    });
    map.forEach((items, dateHeader) => groups.push({ dateHeader, items }));
    return groups;
  }, [filteredTransactions]);

  const getAccountLabel = (item: Transaction) => {
    if (item.subcategory) {
      return item.note
        ? `${item.subcategory} • ${item.note}`
        : item.subcategory;
    }
    if (accounts && accounts.length > 0 && item.accountId) {
      const found = accounts.find((a) => a.id === item.accountId);
      if (found) return found.name;
    }
    if (item.note && item.note.trim()) return item.note;
    return item.type === "income" ? "Cash / Salary" : "Credit Card";
  };

  const formatItemDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const containerBg = isLight ? "#FFFFFF" : "#0D1117";
  const textColor = isLight ? "#0F172A" : "#F8FAFC";
  const subTextColor = isLight ? "#64748B" : "#94A3B8";
  const dateTextColor = isLight ? "#64748B" : "#94A3B8";
  const searchBg = isLight ? "#F1F5F9" : "#161B22";
  const borderColor = isLight ? "#E2E8F0" : "#30363D";
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const isContentOverflowing =
    scrollViewHeight > 0 && contentHeight > scrollViewHeight + 2;
  const fallbackShouldScroll =
    filteredTransactions.length > (SCREEN_HEIGHT < 700 ? 6 : 8);
  const shouldScroll =
    scrollViewHeight > 0 ? isContentOverflowing : fallbackShouldScroll;

  return (
    <View style={[styles.rootContainer, { backgroundColor: containerBg }]}>
      <View
        style={[styles.fixedTopContainer, { backgroundColor: containerBg }]}
      >
        <View
          style={[
            styles.titleBar,
            { borderBottomColor: borderColor, backgroundColor: containerBg },
          ]}
        >
          <View style={{ height: 38, justifyContent: "center", paddingTop: 8 }}>
            <Text
              style={[
                styles.screenTitle,
                { color: isLight ? "#012E4F" : "#FFFFFF" },
              ]}
            >
              Records
            </Text>
          </View>
          <Pressable
            style={styles.roundAddBtn}
            onPress={onAddNewClick}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={[
          styles.container,
          { backgroundColor: containerBg },
          !shouldScroll && { overflow: "hidden" },
        ]}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: 12, paddingBottom: 12 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={shouldScroll}
        bounces={false}
        overScrollMode="never"
        onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
        onContentSizeChange={(_, h) => setContentHeight(h)}
      >
        <View style={[styles.searchBar, { backgroundColor: searchBg }]}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search Record"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.recordsList}>
          {groupedTransactions.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: isLight ? "#F8FAFC" : "#161B22",
                  borderColor,
                },
              ]}
            >
              <View style={styles.emptyIconCircle}>
                <CalendarIcon size={16} color={subTextColor} />
              </View>
              <Text style={[styles.emptyTitle, { color: textColor }]}>
                No records found
              </Text>
              <Text style={[styles.emptyDesc, { color: subTextColor }]}>
                No transactions recorded for this period.
              </Text>
              <Pressable style={styles.emptyAddBtn} onPress={onAddNewClick}>
                <Text style={styles.emptyAddBtnText}>+ Add Record</Text>
              </Pressable>
            </View>
          ) : (
            groupedTransactions.map((group, gIdx) => (
              <View key={gIdx} style={styles.groupBlock}>
                {gIdx > 0 && (
                  <View
                    style={[
                      styles.groupSeparator,
                      { backgroundColor: isLight ? "#0000000D" : "#FFFFFF0D" },
                    ]}
                  />
                )}
                <View style={styles.dateHeaderRow}>
                  <Text
                    style={[styles.groupDateHeader, { color: dateTextColor }]}
                  >
                    {group.dateHeader}
                  </Text>
                </View>
                <View style={styles.groupItems}>
                  {group.items.map((item, itemIdx) => {
                    const isIncome = item.type === "income";
                    const matchedCat = (categories || []).find(
                      (c) =>
                        c &&
                        c.name &&
                        c.name.toLowerCase() ===
                          (item.category || "").toLowerCase(),
                    );
                    let matchedSub = null;
                    if (
                      item.subcategory &&
                      matchedCat &&
                      matchedCat.subcategories
                    ) {
                      matchedSub = matchedCat.subcategories.find(
                        (s) =>
                          s &&
                          s.name &&
                          s.name.toLowerCase() ===
                            (item.subcategory || "").toLowerCase(),
                      );
                    }
                    const iconName =
                      (item as any).categoryIcon ||
                      matchedSub?.icon ||
                      matchedCat?.icon ||
                      item.category;
                    const catColor =
                      (item as any).categoryColor ||
                      matchedSub?.color ||
                      matchedCat?.color ||
                      getCategoryColor(item.category);
                    const accountLabel = getAccountLabel(item);
                    const itemFormattedDate = formatItemDate(item.date);
                    return (
                      <React.Fragment key={item.id}>
                        <SwipeableItem
                          onDelete={
                            onDeleteTransaction
                              ? () => setTxToDelete(item)
                              : undefined
                          }
                          isLight={isLight}
                          height={44}
                          width="100%"
                        >
                          <Pressable
                            style={[
                              styles.recordRow,
                              { backgroundColor: containerBg },
                            ]}
                            onPress={() => onPressTransaction?.(item)}
                          >
                            <View style={styles.recordLeft}>
                              <CategoryIconView
                                iconName={iconName}
                                color={catColor}
                                size={18}
                                containerSize={40}
                                customBg={catColor + "22"}
                                customColor={catColor}
                                isLight={isLight}
                              />
                              <View style={styles.recordMeta}>
                                <Text
                                  style={[
                                    styles.recordCategory,
                                    { color: textColor },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {item.category}
                                </Text>
                                <Text
                                  style={[
                                    styles.recordAccount,
                                    { color: subTextColor },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {accountLabel}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.recordRight}>
                              <Text
                                style={[
                                  styles.recordAmount,
                                  isIncome
                                    ? styles.incomeText
                                    : styles.expenseText,
                                ]}
                                numberOfLines={1}
                              >
                                {isIncome ? "+" : "-"}
                                {item.amount.toFixed(2)}
                              </Text>
                              <Text
                                style={[
                                  styles.recordDateText,
                                  { color: subTextColor },
                                ]}
                              >
                                {itemFormattedDate}
                              </Text>
                            </View>
                          </Pressable>
                        </SwipeableItem>
                        {itemIdx < group.items.length - 1 && (
                          <View style={styles.itemSeparator} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <DeleteConfirmModal
        visible={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={() => {
          if (txToDelete && onDeleteTransaction)
            onDeleteTransaction(txToDelete.id);
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
  rootContainer: { flex: 1, alignItems: "center", width: "100%" },
  fixedTopContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingTop: 0,
    zIndex: 10,
    marginBottom: 4,
  },
  container: { flex: 1, width: "100%" },
  contentContainer: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    width: "100%",
  },
  titleBar: {
    maxWidth: 412,
    width: "100%",
    height: 56,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingTop: 0,
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  roundAddBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#002F52",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#002F52",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBar: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    height: 48,
    borderRadius: 10,
    gap: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 13, padding: 0 },
  recordsList: { width: "100%", maxWidth: 380, alignSelf: "center", gap: 12 },
  emptyCard: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  emptyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(148, 163, 184, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 13, fontWeight: "600" },
  emptyDesc: { fontSize: 11, textAlign: "center", paddingHorizontal: 16 },
  emptyAddBtn: {
    marginTop: 4,
    backgroundColor: "#012E4F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emptyAddBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "600" },
  groupBlock: { width: "100%", maxWidth: 380, alignSelf: "center" },
  groupSeparator: {
    width: "100%",
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 8,
  },
  itemSeparator: { width: "100%", height: 1, backgroundColor: "transparent" },
  dateHeaderRow: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    height: 28,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  groupDateHeader: { fontSize: 12.5, fontWeight: "500" },
  groupItems: { gap: 10, width: "100%", maxWidth: 380, alignSelf: "center" },
  recordRow: {
    width: "100%",
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  recordLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  recordMeta: { flex: 1, gap: 1 },
  recordCategory: { fontSize: 13.5, fontWeight: "600" },
  recordAccount: { fontSize: 11, fontWeight: "400" },
  recordRight: { alignItems: "flex-end", gap: 2, paddingLeft: 8 },
  recordAmount: { fontSize: 13.5, fontWeight: "600" },
  incomeText: { color: "#10B981" },
  expenseText: { color: "#EF4444" },
  recordDateText: { fontSize: 10.5, fontWeight: "400" },
});
export default RecordsScreen;
