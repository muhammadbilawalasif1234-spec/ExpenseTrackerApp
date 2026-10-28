import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  X
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/theme";
import { Currency, Transaction } from "../types";
import { formatCurrency, formatDateDisplay } from "../utils/formatters";

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currency: Currency;
  onSelectTransaction?: (tx: Transaction) => void;
  isLight?: boolean;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  transactions,
  currency,
  onSelectTransaction,
  isLight = false,
}) => {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">(
    "all",
  );

  const insets = useSafeAreaInsets();
  const topDistance = Math.max(insets.top, 16);
  const bottomDistance = insets.bottom > 0 ? insets.bottom : 16;

  if (!visible) return null;

  const results = (transactions || []).filter((t) => {
    if (!t) return false;
    if (filterType !== "all" && t.type !== filterType) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      t.category.toLowerCase().includes(q) ||
      (t.note && t.note.toLowerCase().includes(q)) ||
      t.amount.toString().includes(q)
    );
  });

  return (
    <Modal
      visible={visible}
      transparent={false}
      presentationStyle="fullScreen"
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: isLight ? "#FFFFFF" : "#0D1117",
            paddingTop: topDistance + 8,
            paddingBottom: bottomDistance,
          },
        ]}
      >
        <View style={[styles.dialog, isLight && styles.dialogLight]}>
          <View style={styles.searchBarRow}>
            <View style={[styles.inputBox, isLight && styles.inputBoxLight]}>
              <Search
                size={16}
                color={isLight ? "#64748B" : COLORS.grayLight}
              />
              <TextInput
                style={[styles.input, isLight && styles.inputLight]}
                placeholder="Search transactions, notes, amount..."
                placeholderTextColor={isLight ? "#94A3B8" : COLORS.grayDark}
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery("")}>
                  <X size={14} color={isLight ? "#94A3B8" : COLORS.grayDark} />
                </Pressable>
              )}
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text
                style={[styles.cancelText, isLight && styles.cancelTextLight]}
              >
                Cancel
              </Text>
            </Pressable>
          </View>

          <View style={styles.filterPillsRow}>
            {(["all", "expense", "income"] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setFilterType(t)}
                style={[
                  styles.filterPill,
                  isLight && styles.filterPillLight,
                  filterType === t &&
                    (isLight
                      ? styles.filterPillActiveLight
                      : styles.filterPillActive),
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isLight && styles.filterPillTextLight,
                    filterType === t &&
                      (isLight
                        ? styles.filterPillTextActiveLight
                        : styles.filterPillTextActive),
                  ]}
                >
                  {t === "all"
                    ? "All"
                    : t === "expense"
                      ? "Expenses"
                      : "Income"}
                </Text>
              </Pressable>
            ))}
            <Text
              style={[styles.matchCount, isLight && styles.matchCountLight]}
            >
              {results.length} {results.length === 1 ? "result" : "results"}
            </Text>
          </View>

          <ScrollView
            style={styles.resultsList}
            showsVerticalScrollIndicator={false}
          >
            {results.length === 0 ? (
              <View style={styles.emptyBox}>
                <Search
                  size={28}
                  color={isLight ? "#94A3B8" : COLORS.grayDark}
                />
                <Text
                  style={[styles.emptyTitle, isLight && styles.emptyTitleLight]}
                >
                  No matching transactions
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    isLight && styles.emptySubtitleLight,
                  ]}
                >
                  Try searching for a different keyword or amount
                </Text>
              </View>
            ) : (
              results.map((tx) => {
                const isIncome = tx.type === "income";
                return (
                  <Pressable
                    key={tx.id}
                    style={[styles.txRow, isLight && styles.txRowLight]}
                    onPress={() => {
                      onSelectTransaction?.(tx);
                      onClose();
                    }}
                  >
                    <View style={styles.txLeft}>
                      <View
                        style={[
                          styles.txIconCircle,
                          isIncome
                            ? {
                                backgroundColor: isLight
                                  ? "rgba(0, 200, 83, 0.12)"
                                  : COLORS.incomeBg,
                              }
                            : {
                                backgroundColor: isLight
                                  ? "rgba(255, 61, 0, 0.12)"
                                  : COLORS.expenseBg,
                              },
                        ]}
                      >
                        {isIncome ? (
                          <ArrowDownLeft size={16} color={COLORS.income} />
                        ) : (
                          <ArrowUpRight size={16} color={COLORS.expense} />
                        )}
                      </View>
                      <View style={styles.txMeta}>
                        <Text
                          style={[
                            styles.txCategory,
                            isLight && styles.txCategoryLight,
                          ]}
                          numberOfLines={1}
                        >
                          {tx.category}
                        </Text>
                        <Text
                          style={[styles.txNote, isLight && styles.txNoteLight]}
                          numberOfLines={1}
                        >
                          {tx.note || formatDateDisplay(tx.date)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.txRight}>
                      <Text
                        style={[
                          styles.txAmount,
                          isIncome
                            ? { color: COLORS.income }
                            : { color: COLORS.expense },
                        ]}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(tx.amount, currency)}
                      </Text>
                      <Text
                        style={[styles.txDate, isLight && styles.txDateLight]}
                      >
                        {formatDateDisplay(tx.date)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    position: "relative",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  dialog: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
    gap: 16,
  },
  dialogLight: {
    backgroundColor: "transparent",
  },
  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0D1117",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: "#30363D",
  },
  inputBoxLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
  },
  inputLight: {
    color: "#0F172A",
  },
  closeBtn: {
    paddingHorizontal: 4,
  },
  cancelText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
  cancelTextLight: {
    color: "#64748B",
  },
  filterPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 2,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#21262D",
    borderWidth: 1,
    borderColor: "#30363D",
  },
  filterPillLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  filterPillActive: {
    backgroundColor: "#F59E0B",
    borderColor: "#F59E0B",
  },
  filterPillActiveLight: {
    backgroundColor: "#00C853",
    borderColor: "#00C853",
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
  },
  filterPillTextLight: {
    color: "#64748B",
  },
  filterPillTextActive: {
    color: "#000000",
  },
  filterPillTextActiveLight: {
    color: "#FFFFFF",
  },
  matchCount: {
    marginLeft: "auto",
    fontSize: 11,
    color: "#64748B",
  },
  matchCountLight: {
    color: "#94A3B8",
  },
  resultsList: {
    flex: 1,
  },
  emptyBox: {
    paddingVertical: 36,
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#CBD5E1",
  },
  emptyTitleLight: {
    color: "#1E293B",
  },
  emptySubtitle: {
    fontSize: 11,
    color: "#64748B",
  },
  emptySubtitleLight: {
    color: "#94A3B8",
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#21262D",
  },
  txRowLight: {
    borderBottomColor: "#E2E8F0",
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  txIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  txMeta: {
    flex: 1,
    minWidth: 0,
  },
  txCategory: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  txCategoryLight: {
    color: "#0F172A",
  },
  txNote: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 1,
  },
  txNoteLight: {
    color: "#64748B",
  },
  txRight: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: "800",
  },
  txDate: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
  },
  txDateLight: {
    color: "#94A3B8",
  },
});

export default SearchModal;
