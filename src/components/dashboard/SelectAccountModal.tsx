import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  X,
  CreditCard,
  Coins,
  Landmark,
  PiggyBank,
  TrendingUp,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Account, Currency } from "../../types";

interface SelectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  currency: Currency;
  selectedAccountId: string | null;
  onSelectAccount: (id: string | null) => void;
  totalBalance?: number;
  showTotalBalance?: boolean;
  isLight?: boolean;
}

export const SelectAccountModal: React.FC<SelectAccountModalProps> = ({
  isOpen,
  onClose,
  accounts = [],
  selectedAccountId,
  onSelectAccount,
  totalBalance,
  showTotalBalance = true,
  isLight = true,
}) => {
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    onClose();
  };

  const formatAmount = (amount: number) =>
    amount.toLocaleString("en-US", {
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    });

  const getAccountLabel = (account: Account) => {
    switch (account.type) {
      case "credit":
        return "Credit Card";
      case "debit":
      case "bank":
        return "Debit Card";
      case "cash":
        return "Cash";
      case "savings":
        return "Savings";
      case "investment":
        return "Investments";
    }
  };

  const getAccountIcon = (account: Account) => {
    const iconColor = dark ? "#F8FAFC" : "#050505";
    switch (account.type) {
      case "credit":
      case "debit":
        return <CreditCard size={22} color={iconColor} strokeWidth={1.8} />;
      case "bank":
        return <Landmark size={22} color={iconColor} strokeWidth={1.8} />;
      case "cash":
        return <Coins size={22} color={iconColor} strokeWidth={1.8} />;
      case "savings":
        return <PiggyBank size={22} color={iconColor} strokeWidth={1.8} />;
      case "investment":
        return <TrendingUp size={22} color={iconColor} strokeWidth={1.8} />;
    }
  };

  const accountTypeCounts = accounts.reduce<
    Partial<Record<Account["type"], number>>
  >((counts, account) => {
    counts[account.type] = (counts[account.type] || 0) + 1;
    return counts;
  }, {});

  const dark = !isLight;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
          accessibilityLabel="Close account selector"
        />
        <View
          style={[
            styles.sheet,
            dark ? styles.sheetDark : styles.sheetLight,
            {
              paddingBottom: Math.max(
                insets.bottom + 16,
                Platform.OS === "android" ? 36 : 24,
              ),
            },
          ]}
        >
          <View style={[styles.dragHandle, dark && styles.dragHandleDark]} />
          <View style={styles.header}>
            <Text style={[styles.title, dark && styles.textDark]}>
              Select account
            </Text>
            <Pressable
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={20} color={dark ? "#A1A1AA" : "#71717A"} />
            </Pressable>
          </View>
          <View style={[styles.separator, dark && styles.separatorDark]} />

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {showTotalBalance && (
              <Pressable
                onPress={() => {
                  onSelectAccount(null);
                  handleClose();
                }}
                style={styles.dataRow}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedAccountId === null }}
                accessibilityLabel={`Total Balance ${formatAmount(totalBalance || 0)}`}
              >
                <View style={styles.dataIcon}>
                  <Landmark
                    size={22}
                    color={dark ? "#F8FAFC" : "#050505"}
                    strokeWidth={1.8}
                  />
                </View>
                <View style={styles.dataText}>
                  <Text style={[styles.dataTitle, dark && styles.textDark]}>
                    Total Balance
                  </Text>
                  <Text style={styles.dataAmount}>
                    {formatAmount(totalBalance || 0)}
                  </Text>
                </View>
              </Pressable>
            )}

            {[...accounts]
              .sort((a, b) => {
                const order: Account["type"][] = [
                  "credit",
                  "debit",
                  "bank",
                  "cash",
                  "savings",
                  "investment",
                ];
                return order.indexOf(a.type) - order.indexOf(b.type);
              })
              .map((account) => {
                const accountLabel = getAccountLabel(account);
                const displayLabel =
                  (accountTypeCounts[account.type] || 0) > 1
                    ? account.name
                    : accountLabel;

                return (
                  <Pressable
                    key={account.id}
                    onPress={() => {
                      onSelectAccount(account.id);
                      handleClose();
                    }}
                    style={styles.dataRow}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: selectedAccountId === account.id,
                    }}
                    accessibilityLabel={`${displayLabel}, ${formatAmount(account.balance)}`}
                  >
                    <View style={styles.dataIcon}>
                      {getAccountIcon(account)}
                    </View>
                    <View style={styles.dataText}>
                      <Text
                        numberOfLines={1}
                        style={[styles.dataTitle, dark && styles.textDark]}
                      >
                        {displayLabel}
                      </Text>
                      <Text style={styles.dataAmount}>
                        {formatAmount(
                          account.type === "credit"
                            ? Math.abs(account.balance || 0)
                            : account.balance || 0,
                        )}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "96%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    overflow: "hidden",
    alignSelf: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetLight: {
    backgroundColor: "#FFFFFF",
  },
  sheetDark: {
    backgroundColor: "#18181B",
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E4E4E7",
    marginBottom: 12,
    opacity: 0.8,
    alignSelf: "center",
  },
  dragHandleDark: {
    backgroundColor: "#3F3F46",
  },
  header: {
    width: "100%",
    minHeight: 38,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    position: "relative",
  },
  title: {
    color: "#0F172A",
    fontFamily: "Plus Jakarta Sans",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  textDark: {
    color: "#FFFFFF",
  },
  closeButton: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -14 }],
    padding: 4,
    borderRadius: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#E4E4E7",
    marginBottom: 4,
  },
  separatorDark: {
    backgroundColor: "#27272A",
  },
  list: {
    width: "100%",
    flexGrow: 0,
    paddingHorizontal: 24,
  },
  listContent: {
    gap: 26,
    paddingTop: 14,
    paddingBottom: 16,
  },
  dataRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  dataIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F1F3FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dataText: {
    flex: 1,
    minWidth: 0,
  },
  dataTitle: {
    color: "#050505",
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "600",
  },
  dataAmount: {
    color: "#858585",
    fontFamily: "Plus Jakarta Sans",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 5,
  },
});
