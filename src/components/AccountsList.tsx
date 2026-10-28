import React from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import {
  CreditCard,
  Landmark,
  PiggyBank,
  Plus,
  Wallet,
} from "lucide-react-native";
import { COLORS } from "../constants/theme";
import { Account, Currency } from "../types";
import { formatCurrency } from "../utils/formatters";

interface AccountsListProps {
  accounts: Account[];
  selectedAccountId: string | null;
  onSelectAccount: (id: string | null) => void;
  onAddAccount: () => void;
  currency: Currency;
  isLight?: boolean;
}

export const AccountsList: React.FC<AccountsListProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onAddAccount,
  currency,
  isLight = false,
}) => {
  const getIcon = (type: Account["type"], color: string) => {
    switch (type) {
      case "bank":
        return <Landmark size={18} color={color} />;
      case "credit":
        return <CreditCard size={18} color={color} />;
      case "savings":
        return <PiggyBank size={18} color={color} />;
      default:
        return <Wallet size={18} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text
          style={[styles.title, isLight && styles.titleLight]}
          numberOfLines={1}
        >
          Accounts & Wallets
        </Text>
        <Pressable onPress={onAddAccount} style={styles.addButton}>
          <Plus size={14} color={COLORS.primary} />
          <Text style={styles.addText}>Add</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable
          onPress={() => onSelectAccount(null)}
          style={[
            styles.accountCard,
            isLight && styles.accountCardLight,
            selectedAccountId === null &&
              (isLight
                ? styles.accountCardActiveLight
                : styles.accountCardActive),
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              isLight
                ? { backgroundColor: "#E2E8F0" }
                : { backgroundColor: "#334155" },
            ]}
          >
            <Wallet size={18} color={isLight ? "#0F172A" : COLORS.white} />
          </View>
          <Text
            style={[styles.accountName, isLight && styles.accountNameLight]}
            numberOfLines={1}
          >
            All Accounts
          </Text>
          <Text
            style={[
              styles.accountBalance,
              isLight && styles.accountBalanceLight,
            ]}
            numberOfLines={1}
          >
            Overview
          </Text>
        </Pressable>

        {accounts.map((acc, index) => {
          const isSelected = selectedAccountId === acc.id;
          return (
            <Pressable
              key={`${acc.id}-${index}`}
              onPress={() => onSelectAccount(isSelected ? null : acc.id)}
              style={[
                styles.accountCard,
                isLight && styles.accountCardLight,
                isSelected &&
                  (isLight
                    ? styles.accountCardActiveLight
                    : styles.accountCardActive),
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${acc.color}20` },
                ]}
              >
                {getIcon(acc.type, acc.color)}
              </View>
              <Text
                style={[styles.accountName, isLight && styles.accountNameLight]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {acc.name}
              </Text>
              <Text
                style={[
                  styles.accountBalance,
                  isLight && styles.accountBalanceLight,
                  acc.balance < 0 && { color: COLORS.expense },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {formatCurrency(acc.balance, currency)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  titleLight: {
    color: "#0F172A",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(1, 46, 79, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
  },
  addText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  accountCard: {
    width: 135,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "space-between",
  },
  accountCardLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  accountCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#1E2C22",
  },
  accountCardActiveLight: {
    borderColor: COLORS.primary,
    backgroundColor: "#ECFDF5",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  accountName: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.grayLight,
    marginBottom: 4,
  },
  accountNameLight: {
    color: "#475569",
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.white,
  },
  accountBalanceLight: {
    color: "#0F172A",
  },
});
