import {
  AlertTriangle,
  Banknote,
  ChevronLeft,
  Coins,
  CreditCard,
  Lock,
  Pencil,
  PiggyBank,
  Plus,
  Wallet,
  X,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/theme";
import { Account, Currency, Profile } from "../types";
import { formatCurrency } from "../utils/formatters";
import { CurrencyLockedModal } from "./CurrencyLockedModal";
import { SwipeableItem } from "./SwipeableItem";

interface WalletsScreenProps {
  accounts: Account[];
  currency: Currency;
  onAddAccount: (account: Omit<Account, "id" | "balance">) => void;
  onUpdateAccount?: (id: string, account: Partial<Account>) => void;
  onDeleteAccount: (id: string) => void;
  onBack?: () => void;
  isLight?: boolean;
  profile?: Profile;
}

export const WalletsScreen: React.FC<WalletsScreenProps> = ({
  accounts,
  currency,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onBack,
  isLight = true,
  profile,
}) => {
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const textColor = isLight ? "#0F172A" : "#F1F5F9";
  const subtextColor = isLight ? "#64748B" : "#94A3B8";
  const borderColor = isLight ? "#E2E8F0" : "#1E293B";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("credit");
  const [initialBalance, setInitialBalance] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency);
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
  const [isOtherTypesGridOpen, setIsOtherTypesGridOpen] = useState(false);
  const [customTypeName, setCustomTypeName] = useState("Cash");
  const [isCurrencyLockedModalOpen, setIsCurrencyLockedModalOpen] =
    useState(false);
  const nameInputRef = useRef<TextInput>(null);
  const amountInputRef = useRef<TextInput>(null);

  React.useEffect(() => {
    setSelectedCurrency(currency);
  }, [currency]);

  const totalNetWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
  const netWorthStr = formatCurrency(totalNetWorth, currency);
  const isAmountZero =
    !initialBalance ||
    initialBalance.trim() === "" ||
    initialBalance === "0" ||
    initialBalance === "0.00" ||
    parseFloat(initialBalance.replace(/,/g, "")) <= 0 ||
    isNaN(parseFloat(initialBalance.replace(/,/g, "")));

  const getAccountIcon = (
    accType: Account["type"],
    color: string,
    size = 18,
  ) => {
    switch (accType) {
      case "debit":
      case "bank":
        return <CreditCard size={size} color={color} />;
      case "credit":
        return <CreditCard size={size} color={color} />;
      case "savings":
        return <PiggyBank size={size} color={color} />;
      case "cash":
      default:
        return <Banknote size={size} color={color} />;
    }
  };

  const getTypeLabel = (accType: Account["type"]) => {
    switch (accType) {
      case "debit":
      case "bank":
        return "Debit Card";
      case "credit":
        return "Credit Card";
      case "savings":
        return "Savings";
      case "cash":
      default:
        return "Cash";
    }
  };

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setName("");
    setType("cash");
    setCustomTypeName("Cash");
    setInitialBalance("");
    setAccountNumber("");
    setSelectedCurrency(currency);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setCustomTypeName(
      acc.type === "cash"
        ? "Cash"
        : acc.type === "credit"
          ? "Card"
          : acc.type === "bank"
            ? "Accounts"
            : acc.type === "debit"
              ? "Debit Card"
              : acc.type === "savings"
                ? "Savings"
                : "Cash",
    );
    const amountVal =
      acc.balance !== undefined
        ? Math.abs(acc.balance).toString()
        : acc.initialBalance !== undefined
          ? Math.abs(acc.initialBalance).toString()
          : "0";
    setInitialBalance(amountVal === "0" ? "" : amountVal);
    setAccountNumber(acc.accountNumber || "");
    setSelectedCurrency(currency);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const finalName =
      name.trim() ||
      (type === "credit" ? "My Card" : customTypeName || "My Account");
    const bal = parseFloat(initialBalance.replace(/,/g, "")) || 0;

    let color = "#A29BFE";
    if (type === "bank") color = "#4ECDC4";
    if (type === "credit") color = "#A29BFE";
    if (type === "savings") color = "#FFD93D";
    if (type === "cash") color = "#00C896";

    const icon =
      type === "bank"
        ? "Landmark"
        : type === "credit"
          ? "CreditCard"
          : type === "savings"
            ? "PiggyBank"
            : "Wallet";

    if (editingAccount) {
      if (onUpdateAccount) {
        onUpdateAccount(editingAccount.id, {
          name: finalName,
          type,
          balance: type === "credit" ? (bal > 0 ? -bal : bal) : bal,
          initialBalance: type === "credit" ? (bal > 0 ? -bal : bal) : bal,
          icon,
          color: editingAccount.color || color,
          accountNumber: accountNumber.trim() || undefined,
        });
      }
    } else {
      onAddAccount({
        name: finalName,
        type,
        initialBalance: bal,
        icon,
        color,
        accountNumber: accountNumber.trim() || undefined,
      });
    }

    setName("");
    setInitialBalance("");
    setAccountNumber("");
    setType("credit");
    setEditingAccount(null);
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (accountToDelete) {
      onDeleteAccount(accountToDelete.id);
      setAccountToDelete(null);
    }
  };

  const safeAccounts = React.useMemo(() => {
    const list = accounts || [];
    const seen = new Set<string>();
    const result: Account[] = [];
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (!a) continue;
      if (seen.has(a.id)) {
        if (
          result.some(
            (existing) => existing.id === a.id && existing.name === a.name,
          )
        ) {
          continue;
        }
        const uniqueId = `${a.id}-${i}`;
        result.push({ ...a, id: uniqueId });
      } else {
        seen.add(a.id);
        result.push(a);
      }
    }
    return result;
  }, [accounts]);
  const normalAccounts = safeAccounts.filter(
    (acc) => acc && acc.type !== "credit",
  );
  const creditCards = safeAccounts.filter(
    (acc) => acc && acc.type === "credit",
  );

  const totalAssets = safeAccounts
    .filter((a) => a && a.balance >= 0 && a.type !== "credit")
    .reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalLiabilities = safeAccounts
    .filter((a) => a && (a.balance < 0 || a.type === "credit"))
    .reduce((sum, a) => sum + Math.abs(a.balance || 0), 0);

  const hasAccountsData = normalAccounts.length > 0 || creditCards.length > 0;
  const shouldScrollAccounts = hasAccountsData;

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      {/* Top Header Row matching Ledger screen properties */}
      <View
        style={[
          styles.headerRow,
          {
            borderBottomColor: isLight ? "#E2E8F0" : "#30363D",
            backgroundColor: isLight ? "#FFFFFF" : "#0D1117",
          },
        ]}
      >
        <View style={{ height: 38, justifyContent: "center", paddingTop: 8 }}>
          <Text
            style={[
              styles.headerTitle,
              { color: isLight ? "#012E4F" : "#FFFFFF" },
            ]}
            numberOfLines={1}
          >
            Accounts
          </Text>
        </View>
        <Pressable
          style={styles.circleActionButton}
          onPress={handleOpenAdd}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Add Account"
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      </View>

      <ScrollView
        style={[
          styles.container,
          isLight && styles.containerLight,
          !shouldScrollAccounts && { overflow: "hidden" },
        ]}
        contentContainerStyle={[
          styles.contentContainer,
          {
            backgroundColor: isLight ? "#FFFFFF" : "#0D1117",
            paddingTop: 16,
            paddingBottom: 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={shouldScrollAccounts}
        bounces={false}
        overScrollMode="never"
      >
        {/* Stacked Cards Area */}
        <View style={styles.stackedCardContainer}>
          {/* Total Net Worth Card (behind) */}
          <View
            style={[
              styles.balanceCardBehind,
              { backgroundColor: isLight ? "#114B73" : "#161B22" },
            ]}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: "#FFFFFF",
                opacity: 0.9,
                letterSpacing: 0.8,
                marginBottom: 6,
                textTransform: "uppercase",
                zIndex: 10,
                textAlign: "left",
              }}
            >
              TOTAL NET WORTH
            </Text>
            <Text
              style={{
                fontSize: 27,
                fontWeight: "700",
                color: "#FFFFFF",
                letterSpacing: -0.5,
                zIndex: 10,
                textAlign: "left",
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {netWorthStr}
            </Text>
          </View>

          {/* Assets & Liabilities Split Card */}
          <View style={styles.statsFrame}>
            {/* Assets Side */}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                minWidth: 0,
              }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 2,
                  borderColor: "#53D258",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#53D258",
                  }}
                />
              </View>
              <View style={{ flexDirection: "column", flex: 1, minWidth: 0 }}>
                <Text
                  style={{ fontSize: 13, fontWeight: "500", color: "#FFFFFF" }}
                  numberOfLines={1}
                >
                  Assets
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#FFFFFF",
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatCurrency(totalAssets, currency)}
                </Text>
              </View>
            </View>

            {/* Vertical Divider */}
            <View
              style={{
                width: 1,
                height: 34,
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                marginHorizontal: 6,
              }}
            />

            {/* Liabilities Side */}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 10,
                minWidth: 0,
              }}
            >
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "flex-end",
                  minWidth: 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#FFFFFF",
                    textAlign: "right",
                  }}
                  numberOfLines={1}
                >
                  Liabilities
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#FFFFFF",
                    marginTop: 2,
                    textAlign: "right",
                  }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatCurrency(totalLiabilities, currency)}
                </Text>
              </View>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 2,
                  borderColor: "#E25C5C",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#E25C5C",
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Accounts Section Header */}
        <View style={styles.accountsHeaderBar}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isLight ? "#0F172A" : "#FFFFFF" },
            ]}
          >
            Accounts
          </Text>
          <Pressable onPress={() => {}}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#5D7D95" }}>
              See All
            </Text>
          </Pressable>
        </View>

        {/* Regular Accounts List */}
        <View style={styles.dataCardsFrame}>
          {normalAccounts.length === 0 ? (
            <View
              style={{
                padding: 20,
                alignItems: "center",
                backgroundColor: isLight ? "#F8FAFC" : "#161B22",
                borderRadius: 12,
                borderStyle: "dashed",
                borderWidth: 1,
                borderColor: isLight ? "#E2E8F0" : "#30363D",
                height: 70,
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#94A3B8", fontSize: 12.5 }}>
                No active accounts. Tap &quot;+&quot; to add one.
              </Text>
            </View>
          ) : (
            normalAccounts.map((acc, index) => {
              let pastelBg = isLight ? `${acc.color}15` : `${acc.color}25`;
              let iconColor = acc.color;
              if (
                acc.type === "cash" ||
                acc.name.toLowerCase().includes("cash")
              ) {
                pastelBg = isLight ? "#ECFDF5" : "#064E3B40";
                iconColor = isLight ? "#10B981" : "#34D399";
              } else if (acc.name.toLowerCase().includes("meezan")) {
                pastelBg = isLight ? "#EEF2FF" : "#312E8140";
                iconColor = isLight ? "#4F46E5" : "#818CF8";
              } else if (acc.name.toLowerCase().includes("jazz")) {
                pastelBg = isLight ? "#FFFBEB" : "#78350F40";
                iconColor = isLight ? "#F59E0B" : "#FBBF24";
              } else if (acc.name.toLowerCase().includes("easy")) {
                pastelBg = isLight ? "#ECFDF5" : "#064E3B40";
                iconColor = isLight ? "#10B981" : "#34D399";
              }

              return (
                <SwipeableItem
                  key={`${acc.id}-${index}`}
                  onDelete={
                    accounts.length > 1
                      ? () => setAccountToDelete(acc)
                      : undefined
                  }
                  isLight={isLight}
                >
                  <Pressable
                    onPress={() => handleOpenEdit(acc)}
                    style={({ pressed }) => [
                      styles.singleDataCard,
                      {
                        backgroundColor: isLight ? "#FFFFFF" : "#161B22",
                        borderColor: isLight ? "#E2E8F0" : "#30363D",
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <View style={styles.leftCol}>
                      <View
                        style={[styles.iconBox, { backgroundColor: pastelBg }]}
                      >
                        {getAccountIcon(acc.type, iconColor, 20)}
                      </View>
                      <View style={styles.accountInfo}>
                        <Text
                          style={[
                            styles.accountName,
                            { color: isLight ? "#1E293B" : "#FFFFFF" },
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {acc.name}
                        </Text>
                        <Text
                          style={[
                            styles.accountMeta,
                            { color: isLight ? "#64748B" : "#94A3B8" },
                          ]}
                          numberOfLines={1}
                        >
                          {acc.accountNumber ||
                            (acc.type === "cash"
                              ? "Cash"
                              : acc.type === "bank"
                                ? "Bank Account"
                                : acc.type.toUpperCase())}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.rightCol}>
                      <Text
                        style={[
                          styles.accountBalance,
                          { color: isLight ? "#0F172A" : "#FFFFFF" },
                          acc.balance < 0 && {
                            color: isLight ? "#E11D48" : COLORS.expense,
                          },
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.75}
                      >
                        {formatCurrency(acc.balance, currency)}
                      </Text>
                    </View>
                  </Pressable>
                </SwipeableItem>
              );
            })
          )}
        </View>

        {/* Credit Cards Section Header */}
        <View style={styles.accountsHeaderBar}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isLight ? "#0F172A" : "#FFFFFF" },
            ]}
          >
            Credit Cards
          </Text>
        </View>

        {/* Credit Cards List */}
        <View style={{ gap: 12, marginBottom: 20 }}>
          {creditCards.length === 0 ? (
            <View
              style={{
                padding: 20,
                alignItems: "center",
                backgroundColor: isLight ? "#F8FAFC" : "#161B22",
                borderRadius: 12,
                borderStyle: "dashed",
                borderWidth: 1,
                borderColor: isLight ? "#E2E8F0" : "#30363D",
                height: 70,
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#94A3B8", fontSize: 12.5 }}>
                No active credit cards. Add one using the &quot;+&quot; button.
              </Text>
            </View>
          ) : (
            creditCards.map((acc, index) => {
              let pastelBg = isLight ? `${acc.color}15` : `${acc.color}25`;
              let iconColor = acc.color;
              if (acc.name.toLowerCase().includes("meezan")) {
                pastelBg = isLight ? "#EEF2FF" : "#312E8140";
                iconColor = isLight ? "#4F46E5" : "#818CF8";
              } else if (acc.name.toLowerCase().includes("cash")) {
                pastelBg = isLight ? "#ECFDF5" : "#064E3B40";
                iconColor = isLight ? "#10B981" : "#34D399";
              } else if (acc.name.toLowerCase().includes("jazz")) {
                pastelBg = isLight ? "#FFFBEB" : "#78350F40";
                iconColor = isLight ? "#F59E0B" : "#FBBF24";
              } else if (acc.name.toLowerCase().includes("easy")) {
                pastelBg = isLight ? "#ECFDF5" : "#064E3B40";
                iconColor = isLight ? "#10B981" : "#34D399";
              }

              return (
                <SwipeableItem
                  key={`${acc.id}-${index}`}
                  onDelete={
                    accounts.length > 1
                      ? () => setAccountToDelete(acc)
                      : undefined
                  }
                  isLight={isLight}
                >
                  <Pressable
                    onPress={() => handleOpenEdit(acc)}
                    style={({ pressed }) => [
                      styles.creditCardBox,
                      {
                        backgroundColor: isLight ? "#FFFFFF" : "#161B22",
                        borderColor: isLight ? "#E2E8F0" : "#30363D",
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: 46,
                      }}
                    >
                      <View style={styles.leftCol}>
                        <View
                          style={[
                            styles.iconBox,
                            { backgroundColor: pastelBg },
                          ]}
                        >
                          {getAccountIcon(acc.type, iconColor, 20)}
                        </View>
                        <View style={styles.accountInfo}>
                          <Text
                            style={[
                              styles.accountName,
                              { color: isLight ? "#1E293B" : "#FFFFFF" },
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {acc.name}
                          </Text>
                          <Text
                            style={[
                              styles.accountMeta,
                              { color: isLight ? "#64748B" : "#94A3B8" },
                            ]}
                            numberOfLines={1}
                          >
                            Credit Card
                          </Text>
                        </View>
                      </View>

                      <View style={styles.rightCol}>
                        <Text
                          style={[styles.accountBalance, { color: "#EF4444" }]}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.75}
                        >
                          {formatCurrency(acc.balance, currency)}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        height: 1,
                        backgroundColor: isLight ? "#F1F5F9" : "#30363D",
                        marginVertical: 8,
                      }}
                    />

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 4,
                      }}
                    >
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <Text
                          style={{
                            fontSize: 9.5,
                            color: "#94A3B8",
                            fontWeight: "500",
                            textTransform: "uppercase",
                          }}
                        >
                          Credit Limit
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: isLight ? "#0F172A" : "#FFFFFF",
                            marginTop: 1,
                          }}
                        >
                          {formatCurrency(
                            acc.initialBalance
                              ? Math.abs(acc.initialBalance)
                              : 100000,
                            currency,
                          )}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 1,
                          height: 20,
                          backgroundColor: isLight ? "#F1F5F9" : "#30363D",
                        }}
                      />
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <Text
                          style={{
                            fontSize: 9.5,
                            color: "#94A3B8",
                            fontWeight: "500",
                            textTransform: "uppercase",
                          }}
                        >
                          Available Credit
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: isLight ? "#0F172A" : "#FFFFFF",
                            marginTop: 1,
                          }}
                        >
                          {formatCurrency(
                            (acc.initialBalance
                              ? Math.abs(acc.initialBalance)
                              : 100000) - Math.abs(acc.balance || 0),
                            currency,
                          )}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </SwipeableItem>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Add / Edit Account Modal */}
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setIsModalOpen(false);
          setEditingAccount(null);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            flex: 1,
            width: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              flex: 1,
              width: "100%",
              backgroundColor: isLight ? "#FFFFFF" : "#18181B",
              paddingTop: Math.max(insets.top, 16),
              paddingBottom: Math.max(insets.bottom, 16),
              alignItems: "center",
            }}
          >
            {/* Top Bar matching Accounts Screen Header Properties & Padding */}
            <View
              style={[
                styles.headerRow,
                {
                  borderBottomColor: isLight ? "#E2E8F0" : "#30363D",
                  backgroundColor: isLight ? "#FFFFFF" : "#18181B",
                  marginBottom: 0,
                },
              ]}
            >
              <Pressable
                onPress={() => {
                  setIsModalOpen(false);
                  setEditingAccount(null);
                }}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: isLight ? "#F4F4F5" : "#27272A",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Back"
              >
                <ChevronLeft size={20} color={textColor} />
              </Pressable>

              <View
                style={{
                  height: 38,
                  justifyContent: "center",
                  paddingTop: 8,
                  flex: 1,
                  alignItems: "center",
                }}
              >
                <Text
                  style={[
                    styles.headerTitle,
                    {
                      color: textColor,
                      fontSize: 20,
                      fontWeight: "700",
                      textAlign: "center",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {editingAccount ? "Edit Account" : "Add Account"}
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  setIsModalOpen(false);
                  setEditingAccount(null);
                }}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: isLight ? "#F4F4F5" : "#27272A",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={18} color={textColor} strokeWidth={2.4} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
              style={{ width: "100%", flex: 1 }}
              contentContainerStyle={{
                alignItems: "center",
                paddingTop: 25,
                paddingBottom: 24,
                paddingHorizontal: 16,
              }}
            >
              <Pressable
                onPress={() => amountInputRef.current?.focus()}
                style={{
                  width: "100%",
                  height: 111,
                  borderRadius: 12,
                  borderWidth: 0.5,
                  borderColor: isLight ? "#E2E8F0" : "#30363D",
                  backgroundColor: isLight ? "#FFFFFF" : "#161B22",
                  paddingTop: 16,
                  paddingBottom: 16,
                  paddingLeft: 16,
                  paddingRight: 16,
                  justifyContent: "center",
                  gap: 10,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: isLight ? "#64748B" : "#94A3B8",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  OPENING BALANCE
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "700",
                      color: isLight ? "#012E4F" : "#38BDF8",
                      letterSpacing: -0.5,
                    }}
                  >
                    {currency.code}{" "}
                  </Text>
                  <TextInput
                    ref={amountInputRef}
                    style={{
                      fontSize: 32,
                      fontWeight: "700",
                      color: isLight ? "#012E4F" : "#38BDF8",
                      letterSpacing: -0.5,
                      flex: 1,
                      padding: 0,
                    }}
                    value={initialBalance}
                    onChangeText={(val) => {
                      if (/^[0-9]*\.?[0-9]*$/.test(val)) {
                        setInitialBalance(val);
                      }
                    }}
                    placeholder="0.00"
                    placeholderTextColor={isLight ? "#94A3B8" : "#475569"}
                    keyboardType="decimal-pad"
                  />
                </View>
              </Pressable>

              <View
                style={{
                  width: "100%",
                  height: 217,
                  borderRadius: 12,
                  borderWidth: 0.5,
                  borderColor: isLight ? "#E2E8F0" : "#30363D",
                  backgroundColor: isLight ? "#FFFFFF" : "#161B22",
                  marginTop: 24,
                  paddingHorizontal: 18,
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View
                  style={{
                    width: "100%",
                    height: 60,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14.5,
                      fontWeight: "600",
                      color: textColor,
                    }}
                  >
                    Name
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <TextInput
                      ref={nameInputRef}
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: isLight ? "#475569" : "#94A3B8",
                        textAlign: "right",
                        padding: 0,
                      }}
                      value={name}
                      onChangeText={setName}
                      placeholder="e.g. Meezan bank"
                      placeholderTextColor="#94A3B8"
                    />
                    <Pressable onPress={() => nameInputRef.current?.focus()}>
                      <Pencil size={15} color="#94A3B8" />
                    </Pressable>
                  </View>
                </View>

                <View
                  style={{
                    height: 0.5,
                    backgroundColor: isLight ? "#F1F5F9" : "#21262D",
                    width: "100%",
                  }}
                />

                {/* Locked Currency Field with safe symbol trim fallback */}
                <Pressable
                  onPress={() => setIsCurrencyLockedModalOpen(true)}
                  style={{
                    width: "100%",
                    height: 60,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14.5,
                      fontWeight: "600",
                      color: textColor,
                    }}
                  >
                    Currency
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: isLight ? "#475569" : "#94A3B8",
                      }}
                    >
                      {currency.code} (
                      {currency.symbol ? currency.symbol.trim() : ""})
                    </Text>
                    <Lock size={15} color="#94A3B8" />
                  </View>
                </Pressable>

                <View
                  style={{
                    height: 0.5,
                    backgroundColor: isLight ? "#F1F5F9" : "#21262D",
                    width: "100%",
                  }}
                />

                <Pressable
                  onPress={() => setIsTypePickerOpen(true)}
                  style={{
                    width: "100%",
                    height: 60,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14.5,
                      fontWeight: "600",
                      color: textColor,
                    }}
                  >
                    Type
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: isLight ? "#475569" : "#94A3B8",
                      }}
                    >
                      {customTypeName || getTypeLabel(type)}
                    </Text>
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor:
                          customTypeName === "Cash" || type === "cash"
                            ? isLight
                              ? "#ECFDF5"
                              : "#064E3B40"
                            : customTypeName === "Card" || type === "credit"
                              ? isLight
                                ? "#EEF2FF"
                                : "#312E8140"
                              : customTypeName === "Savings" ||
                                  type === "savings"
                                ? isLight
                                  ? "#FFFBEB"
                                  : "#78350F40"
                                : customTypeName === "Investments" ||
                                    type === "investment"
                                  ? isLight
                                    ? "#F3E8FF"
                                    : "#581C8740"
                                  : isLight
                                    ? "#E0F2FE"
                                    : "#0369A140",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {getAccountIcon(
                        type,
                        customTypeName === "Cash" || type === "cash"
                          ? isLight
                            ? "#10B981"
                            : "#34D399"
                          : customTypeName === "Card" || type === "credit"
                            ? isLight
                              ? "#6366F1"
                              : "#818CF8"
                            : customTypeName === "Savings" || type === "savings"
                              ? isLight
                                ? "#F59E0B"
                                : "#FBBF24"
                              : customTypeName === "Investments" ||
                                  type === "investment"
                                ? isLight
                                  ? "#9333EA"
                                  : "#C084FC"
                                : isLight
                                  ? "#0284C7"
                                  : "#38BDF8",
                        18,
                      )}
                    </View>
                  </View>
                </Pressable>
              </View>

              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  marginTop: 36,
                  marginBottom: 30,
                }}
              >
                <Pressable
                  onPress={handleSave}
                  disabled={isAmountZero}
                  style={({ pressed }) => ({
                    width: "100%",
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: isAmountZero
                      ? isLight
                        ? "rgba(1, 46, 79, 0.38)"
                        : "rgba(56, 189, 248, 0.25)"
                      : isLight
                        ? "#012E4F"
                        : "#38BDF8",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.9 : 1,
                    shadowColor: isAmountZero ? "transparent" : "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isAmountZero ? 0 : 0.1,
                    shadowRadius: 3,
                    elevation: isAmountZero ? 0 : 2,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: isAmountZero
                        ? isLight
                          ? "rgba(255, 255, 255, 0.85)"
                          : "rgba(255, 255, 255, 0.65)"
                        : isLight
                          ? "#FFFFFF"
                          : "#0F172A",
                    }}
                  >
                    {editingAccount ? "Save Changes" : "Add Account"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <CurrencyLockedModal
        visible={isCurrencyLockedModalOpen}
        currency={currency}
        onClose={() => setIsCurrencyLockedModalOpen(false)}
        isLight={isLight}
      />

      <Modal
        visible={isTypePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTypePickerOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
          onPress={() => setIsTypePickerOpen(false)}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 440,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              backgroundColor: isLight ? "#FFFFFF" : "#18181B",
              paddingTop: 10,
              paddingBottom: Math.max(
                insets.bottom + 16,
                Platform.OS === "android" ? 36 : 24,
              ),
              alignItems: "center",
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 20,
              alignSelf: "center",
            }}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View
              style={{
                width: 38,
                height: 4,
                borderRadius: 2,
                backgroundColor: isLight ? "#E4E4E7" : "#3F3F46",
                marginBottom: 12,
                opacity: 0.8,
              }}
            />

            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingBottom: 14,
                position: "relative",
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 18,
                  textAlign: "center",
                  color: isLight ? "#0F172A" : "#FFFFFF",
                }}
              >
                Select account type
              </Text>
              <Pressable
                onPress={() => setIsTypePickerOpen(false)}
                style={{
                  position: "absolute",
                  right: 20,
                  top: "50%",
                  transform: [{ translateY: -14 }],
                  padding: 4,
                  borderRadius: 16,
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={isLight ? "#71717A" : "#A1A1AA"} />
              </Pressable>
            </View>

            <View
              style={{
                width: "100%",
                height: 1,
                backgroundColor: isLight ? "#E4E4E7" : "#27272A",
                marginBottom: 4,
              }}
            />

            <View style={{ width: "100%", paddingHorizontal: 0 }}>
              <Pressable
                onPress={() => {
                  setType("cash");
                  setCustomTypeName("Cash");
                  setIsTypePickerOpen(false);
                }}
                style={({ pressed }) => ({
                  width: "100%",
                  height: 64,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  gap: 20,
                  backgroundColor: pressed
                    ? isLight
                      ? "#F8FAFC"
                      : "#27272A"
                    : "transparent",
                })}
              >
                <Wallet
                  size={24}
                  color={isLight ? "#1E293B" : "#F1F5F9"}
                  strokeWidth={1.8}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: isLight ? "#334155" : "#E2E8F0",
                  }}
                >
                  Cash
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setType("credit");
                  setCustomTypeName("Card");
                  setIsTypePickerOpen(false);
                }}
                style={({ pressed }) => ({
                  width: "100%",
                  height: 64,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  gap: 20,
                  backgroundColor: pressed
                    ? isLight
                      ? "#F8FAFC"
                      : "#27272A"
                    : "transparent",
                })}
              >
                <CreditCard
                  size={24}
                  color={isLight ? "#1E293B" : "#F1F5F9"}
                  strokeWidth={1.8}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: isLight ? "#334155" : "#E2E8F0",
                  }}
                >
                  Card
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setType("bank");
                  setCustomTypeName("Account");
                  setIsTypePickerOpen(false);
                }}
                style={({ pressed }) => ({
                  width: "100%",
                  height: 64,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  gap: 20,
                  backgroundColor: pressed
                    ? isLight
                      ? "#F8FAFC"
                      : "#27272A"
                    : "transparent",
                })}
              >
                <Banknote
                  size={24}
                  color={isLight ? "#1E293B" : "#F1F5F9"}
                  strokeWidth={1.8}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: isLight ? "#334155" : "#E2E8F0",
                  }}
                >
                  Account
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsTypePickerOpen(false);
                  setTimeout(() => {
                    setIsOtherTypesGridOpen(true);
                  }, 120);
                }}
                style={({ pressed }) => ({
                  width: "100%",
                  height: 64,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  gap: 20,
                  backgroundColor: pressed
                    ? isLight
                      ? "#F8FAFC"
                      : "#27272A"
                    : "transparent",
                })}
              >
                <Coins
                  size={24}
                  color={isLight ? "#1E293B" : "#F1F5F9"}
                  strokeWidth={1.8}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: isLight ? "#334155" : "#E2E8F0",
                  }}
                >
                  Others
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={isOtherTypesGridOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOtherTypesGridOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
          onPress={() => setIsOtherTypesGridOpen(false)}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 440,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              backgroundColor: isLight ? "#FFFFFF" : "#18181B",
              paddingTop: 18,
              paddingBottom: Math.max(
                insets.bottom + 16,
                Platform.OS === "android" ? 36 : 24,
              ),
              alignItems: "center",
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 20,
              alignSelf: "center",
            }}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View
              style={{
                width: "100%",
                paddingHorizontal: 20,
                paddingBottom: 18,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 18,
                  color: isLight ? "#0F172A" : "#FFFFFF",
                }}
              >
                Account type
              </Text>
              <Pressable
                onPress={() => setIsOtherTypesGridOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isLight ? "#F3F4F6" : "#27272A",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color={isLight ? "#64748B" : "#A1A1AA"} />
              </Pressable>
            </View>

            <View
              style={{
                width: "100%",
                paddingHorizontal: 20,
                gap: 12,
              }}
            >
              {[
                [
                  { label: "Cash", typeKey: "cash" as const },
                  { label: "Accounts", typeKey: "bank" as const },
                  { label: "Card", typeKey: "credit" as const },
                ],
                [
                  { label: "Debit Card", typeKey: "debit" as const },
                  { label: "Savings", typeKey: "savings" as const },
                  { label: "Top-Up/Prepaid", typeKey: "debit" as const },
                ],
                [
                  { label: "Investments", typeKey: "investment" as const },
                  { label: "Overdrafts", typeKey: "credit" as const },
                  { label: "Loan", typeKey: "bank" as const },
                ],
                [
                  { label: "Insurance", typeKey: "bank" as const },
                  { label: "Business", typeKey: "bank" as const },
                  { label: "Others", typeKey: "cash" as const },
                ],
              ].map((row, rowIndex) => (
                <View
                  key={`grid-row-${rowIndex}`}
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    width: "100%",
                  }}
                >
                  {row.map((item) => {
                    const isSelected =
                      customTypeName === item.label ||
                      (!customTypeName && type === item.typeKey);
                    return (
                      <Pressable
                        key={item.label}
                        onPress={() => {
                          setType(item.typeKey);
                          setCustomTypeName(item.label);
                          setIsOtherTypesGridOpen(false);
                        }}
                        style={({ pressed }) => ({
                          flex: 1,
                          height: 62,
                          borderRadius: 16,
                          alignItems: "center",
                          justifyContent: "center",
                          paddingHorizontal: 4,
                          backgroundColor: isSelected
                            ? isLight
                              ? "#EBF5FF"
                              : "rgba(56, 189, 248, 0.18)"
                            : isLight
                              ? "#F4F5F4"
                              : "#27272A",
                          opacity: pressed ? 0.85 : 1,
                        })}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            textAlign: "center",
                            color: isSelected
                              ? isLight
                                ? "#2563EB"
                                : "#38BDF8"
                              : isLight
                                ? "#1F2937"
                                : "#E2E8F0",
                          }}
                          numberOfLines={2}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={accountToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setAccountToDelete(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 0,
          }}
          onPress={() => setAccountToDelete(null)}
        >
          <View
            style={[
              styles.deleteModalContent,
              isLight && styles.deleteModalContentLight,
              {
                width: "100%",
                maxWidth: 480,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                borderWidth: 1,
                borderColor: isLight ? "rgba(0,0,0,0.06)" : "#30363D",
                paddingBottom: Math.max(
                  insets.bottom + 16,
                  Platform.OS === "android" ? 38 : 28,
                ),
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
                elevation: 16,
              },
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                marginBottom: 12,
                alignSelf: "center",
                opacity: 0.6,
                backgroundColor: isLight ? "#E4E4E7" : "#3F3F46",
              }}
            />
            <View style={styles.deleteIconBox}>
              <AlertTriangle size={24} color="#EF4444" strokeWidth={2.2} />
            </View>

            <Text
              style={[
                styles.deleteModalTitle,
                isLight && styles.deleteModalTitleLight,
              ]}
            >
              Delete Account
            </Text>
            <Text
              style={[
                styles.deleteModalDesc,
                isLight && styles.deleteModalDescLight,
              ]}
            >
              Are you sure to delete that account? All data associated with this
              account will be permanently removed. This action cannot be undone.
            </Text>

            <View style={styles.deleteModalBtnRow}>
              <Pressable
                style={[styles.cancelBtn, isLight && styles.cancelBtnLight]}
                onPress={() => setAccountToDelete(null)}
              >
                <Text
                  style={[
                    styles.cancelBtnText,
                    isLight && styles.cancelBtnTextLight,
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={styles.confirmDeleteBtn}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.confirmDeleteBtnText}>Delete Account</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1117",
  },
  containerLight: {
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerRow: {
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#012E4F",
    letterSpacing: -0.5,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  circleActionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#5D7D95",
    alignItems: "center",
    justifyContent: "center",
  },
  stackedCardContainer: {
    width: "100%",
    height: 160,
    alignSelf: "stretch",
    position: "relative",
    marginBottom: 8,
  },
  balanceCardBehind: {
    width: "70%",
    height: 120,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    position: "absolute",
    top: 0,
    left: "15%",
    zIndex: 0,
  },
  statsFrame: {
    width: "100%",
    height: 70,
    borderRadius: 9,
    paddingTop: 11,
    paddingRight: 16,
    paddingBottom: 11,
    paddingLeft: 16,
    gap: 10,
    backgroundColor: "#012E4F",
    position: "absolute",
    top: 90,
    left: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  accountsHeaderBar: {
    width: "100%",
    height: 23,
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dataCardsFrame: {
    width: "100%",
    height: "auto",
    alignSelf: "stretch",
    gap: 12,
    marginBottom: 8,
  },
  singleDataCard: {
    width: "100%",
    height: 70,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    borderStyle: "solid",
  },
  creditCardBox: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    justifyContent: "space-between",
    flexDirection: "column",
    alignSelf: "stretch",
    overflow: "hidden",
    borderStyle: "solid",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  leftCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  accountInfo: {
    flex: 1,
    minWidth: 0,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  accountName: {
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 22,
    color: "#1E293B",
    marginBottom: 1,
  },
  accountMeta: {
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },
  rightCol: {
    alignItems: "flex-end",
    gap: 4,
    minWidth: 70,
    flexShrink: 0,
  },
  accountBalance: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  deleteModalContent: {
    width: "92%",
    maxWidth: 412,
    backgroundColor: "#1E293B",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  deleteModalContentLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  deleteIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  deleteModalTitleLight: {
    color: "#0F172A",
  },
  deleteModalDesc: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  deleteModalDescLight: {
    color: "#64748B",
  },
  deleteModalBtnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#334155",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelBtnLight: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#CBD5E1",
  },
  cancelBtnTextLight: {
    color: "#475569",
  },
  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  confirmDeleteBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default WalletsScreen;
