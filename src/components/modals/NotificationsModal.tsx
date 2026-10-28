import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  Sparkles,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Budget, Currency, SavingsGoal, Transaction } from "../../types";
import { formatCurrency } from "../../utils/formatters";

interface NotificationItem {
  id: string;
  type: "alert" | "success" | "info" | "tip";
  title: string;
  message: string;
  time: string;
  read: boolean;
}
interface NotificationsModalProps {
  visible?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  currency?: Currency;
  transactions?: Transaction[];
  budgets?: Budget[];
  savingsGoals?: SavingsGoal[];
  isLight?: boolean;
}

const parseTransactionDate = (value: string): Date | null => {
  const dateOnlyMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const date = dateOnlyMatch
    ? new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3]),
      )
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
const getPeriodStart = (date: Date, period: Budget["period"]): Date => {
  if (period === "yearly") return new Date(date.getFullYear(), 0, 1);
  if (period === "weekly") {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const daysSinceMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - daysSinceMonday);
    return start;
  }
  return new Date(date.getFullYear(), date.getMonth(), 1);
};
const formatRelativeTime = (date: Date, now: Date): string => {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 60000),
  );
  if (elapsedMinutes < 1) return "Just now";
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;
  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 30) return `${elapsedDays}d ago`;
  return date.toLocaleDateString();
};

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  isOpen,
  onClose,
  currency,
  transactions = [],
  budgets = [],
  savingsGoals = [],
  isLight = false,
}) => {
  const insets = useSafeAreaInsets();
  const isModalVisible = visible ?? isOpen ?? false;
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<
    Set<string>
  >(() => new Set());
  const now = new Date();
  const generatedNotifications: NotificationItem[] = [];
  budgets.forEach((budget) => {
    if (!Number.isFinite(budget.limit) || budget.limit <= 0) return;
    const periodStart = getPeriodStart(now, budget.period);
    const spent = transactions.reduce((total, transaction) => {
      if (
        transaction.type !== "expense" ||
        transaction.category.trim().toLocaleLowerCase() !==
          budget.category.trim().toLocaleLowerCase()
      )
        return total;
      const transactionDate = parseTransactionDate(transaction.date);
      return transactionDate &&
        transactionDate >= periodStart &&
        transactionDate <= now
        ? total + transaction.amount
        : total;
    }, 0);
    const percentage = (spent / budget.limit) * 100;
    const threshold = budget.alertThreshold ?? 80;
    if (percentage < threshold) return;
    generatedNotifications.push({
      id: `budget:${budget.id}:${periodStart.toISOString().slice(0, 10)}`,
      type: percentage >= 100 ? "alert" : "tip",
      title:
        percentage >= 100
          ? "Budget limit exceeded"
          : "Budget limit approaching",
      message: `${budget.category} spending is ${Math.round(percentage)}% of its ${budget.period} budget (${formatCurrency(spent, currency)} of ${formatCurrency(budget.limit, currency)}).`,
      time: "Current period",
      read: false,
    });
  });
  savingsGoals.forEach((goal) => {
    if (
      !Number.isFinite(goal.targetAmount) ||
      goal.targetAmount <= 0 ||
      goal.currentAmount <= 0
    )
      return;
    const percentage = Math.min(
      100,
      Math.round((goal.currentAmount / goal.targetAmount) * 100),
    );
    generatedNotifications.push({
      id: `goal:${goal.id}`,
      type: percentage >= 100 ? "success" : "info",
      title:
        percentage >= 100 ? "Savings goal reached" : "Savings goal progress",
      message: `${goal.name} is ${percentage}% complete (${formatCurrency(goal.currentAmount, currency)} of ${formatCurrency(goal.targetAmount, currency)}).`,
      time: "Current progress",
      read: false,
    });
  });
  transactions
    .map((transaction) => ({
      transaction,
      date: parseTransactionDate(transaction.date),
    }))
    .filter(
      ({ transaction, date }) =>
        date !== null &&
        date <= now &&
        now.getTime() - date.getTime() <= 30 * 24 * 60 * 60 * 1000 &&
        Number.isFinite(transaction.amount),
    )
    .sort((a, b) => b.date!.getTime() - a.date!.getTime())
    .slice(0, 5)
    .forEach(({ transaction, date }) => {
      const isExpense = transaction.type === "expense";
      const isIncome = transaction.type === "income";
      const description = transaction.note?.trim() || transaction.category;
      generatedNotifications.push({
        id: `transaction:${transaction.id}`,
        type: isIncome ? "success" : isExpense ? "info" : "tip",
        title: isIncome
          ? "Income recorded"
          : isExpense
            ? "Expense recorded"
            : "Transfer recorded",
        message: `${description}: ${formatCurrency(transaction.amount, currency)}.`,
        time: formatRelativeTime(date!, now),
        read: false,
      });
    });
  if (!isModalVisible) return null;
  const markAllAsRead = () => {
    setReadNotificationIds((previous) => {
      const next = new Set(previous);
      generatedNotifications.forEach(({ id }) => next.add(id));
      return next;
    });
  };
  const clearAll = () => {
    setDismissedNotificationIds((previous) => {
      const next = new Set(previous);
      generatedNotifications.forEach(({ id }) => next.add(id));
      return next;
    });
  };
  const deleteNotification = (id: string) => {
    setDismissedNotificationIds((previous) => new Set(previous).add(id));
  };
  const safeNotifications = generatedNotifications
    .filter(({ id }) => !dismissedNotificationIds.has(id))
    .map((notification) => ({
      ...notification,
      read: readNotificationIds.has(notification.id),
    }));
  const unreadCount = safeNotifications.filter(
    (notification) => !notification.read,
  ).length;
  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "alert":
        return <AlertTriangle size={16} color="#F59E0B" />;
      case "success":
        return <CheckCircle2 size={16} color="#10B981" />;
      case "tip":
        return <Sparkles size={16} color="#A855F7" />;
      default:
        return <Info size={16} color="#38BDF8" />;
    }
  };
  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isLight ? "#FFFFFF" : "#0D1117",
              borderColor: isLight ? "#E2E8F0" : "#30363D",
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <View
            style={[
              styles.headerRow,
              { borderBottomColor: isLight ? "#E2E8F0" : "#21262D" },
            ]}
          >
            <View style={styles.headerTitleGroup}>
              <View
                style={[
                  styles.bellIconContainer,
                  {
                    backgroundColor: isLight
                      ? "#FEF3C7"
                      : "rgba(245, 158, 11, 0.15)",
                    borderColor: isLight
                      ? "#FDE68A"
                      : "rgba(245, 158, 11, 0.3)",
                  },
                ]}
              >
                <Bell size={18} color="#F59E0B" />
              </View>
              <View>
                <View style={styles.titleWithBadge}>
                  <Text
                    style={[
                      styles.headerTitle,
                      { color: isLight ? "#0F172A" : "#FFFFFF" },
                    ]}
                  >
                    Notifications
                  </Text>
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount} new</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.headerSubtitle,
                    { color: isLight ? "#64748B" : "#94A3B8" },
                  ]}
                >
                  Financial alerts & updates
                </Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={[
                styles.closeButton,
                { backgroundColor: isLight ? "#F1F5F9" : "#21262D" },
              ]}
            >
              <X size={16} color={isLight ? "#475569" : "#94A3B8"} />
            </Pressable>
          </View>
          {safeNotifications.length > 0 && (
            <View style={styles.quickActionsRow}>
              <Pressable onPress={markAllAsRead}>
                <Text
                  style={[
                    styles.quickActionText,
                    { color: isLight ? "#0284C7" : "#38BDF8" },
                  ]}
                >
                  Mark all as read
                </Text>
              </Pressable>
              <Pressable onPress={clearAll} style={styles.clearAllBtn}>
                <Trash2 size={12} color="#EF4444" />
                <Text style={styles.clearAllText}>Clear all</Text>
              </Pressable>
            </View>
          )}
          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {safeNotifications.length === 0 ? (
              <View
                style={[
                  styles.emptyState,
                  {
                    backgroundColor: isLight ? "#F8FAFC" : "#161B22",
                    borderColor: isLight ? "#E2E8F0" : "#30363D",
                  },
                ]}
              >
                <Bell size={32} color={isLight ? "#94A3B8" : "#64748B"} />
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: isLight ? "#0F172A" : "#F1F5F9" },
                  ]}
                >
                  All caught up!
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: isLight ? "#64748B" : "#94A3B8" },
                  ]}
                >
                  No new alerts or pending notices.
                </Text>
              </View>
            ) : (
              safeNotifications.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: isLight ? "#F8FAFC" : "#161B22",
                      borderColor: item.read
                        ? isLight
                          ? "#E2E8F0"
                          : "#21262D"
                        : isLight
                          ? "#F59E0B"
                          : "#D97706",
                      opacity: item.read ? 0.8 : 1,
                    },
                  ]}
                >
                  <View style={styles.cardIconWrap}>{getIcon(item.type)}</View>
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text
                        style={[
                          styles.cardTitle,
                          { color: isLight ? "#0F172A" : "#FFFFFF" },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.cardTime,
                          { color: isLight ? "#94A3B8" : "#64748B" },
                        ]}
                      >
                        {item.time}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.cardMessage,
                        { color: isLight ? "#475569" : "#CBD5E1" },
                      ]}
                    >
                      {item.message}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => deleteNotification(item.id)}
                    hitSlop={8}
                    style={styles.cardDeleteBtn}
                  >
                    <X size={14} color={isLight ? "#94A3B8" : "#64748B"} />
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
export default NotificationsModal;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backdrop: { ...StyleSheet.absoluteFillObject },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    borderRadius: 20,
    borderWidth: 1,
    paddingTop: 18,
    paddingHorizontal: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitleGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  bellIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleWithBadge: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  badge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: { fontSize: 10, fontWeight: "800", color: "#000000" },
  headerSubtitle: { fontSize: 12, fontWeight: "500", marginTop: 2 },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  quickActionText: { fontSize: 12, fontWeight: "600" },
  clearAllBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  clearAllText: { fontSize: 12, fontWeight: "600", color: "#EF4444" },
  listContainer: { flexGrow: 0, marginTop: 4 },
  listContent: { paddingBottom: 10, gap: 10 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginTop: 8,
  },
  emptyTitle: { fontSize: 14, fontWeight: "700", marginTop: 4 },
  emptySubtitle: { fontSize: 12, textAlign: "center" },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  cardIconWrap: { marginTop: 2 },
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 13, fontWeight: "700", flex: 1 },
  cardTime: { fontSize: 11, fontWeight: "500", marginLeft: 6 },
  cardMessage: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
  cardDeleteBtn: { padding: 2, marginTop: 2 },
});
