import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants/colors";

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
};

type Props = {
  timeTab: string;
  setTimeTab: (tab: string) => void;
  selectedDate: Date;
  setShowCalendar: (show: boolean) => void;
  filteredTransactions: Transaction[];
  savings: number;
  deleteTransaction: (id: string) => void;
};

export const DashboardScreen = ({
  timeTab,
  setTimeTab,
  selectedDate,
  setShowCalendar,
  filteredTransactions,
  savings,
  deleteTransaction,
}: Props) => {
  // FIXED: ye function yahan define kar diya
  const getDateDisplay = () => {
    return selectedDate.toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const recentTransactions = filteredTransactions.slice(0, 5);

  return (
    <View style={styles.container}>
      {/* TIME TABS */}
      <View style={styles.timeTabs}>
        {["Daily", "Monthly", "Yearly"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setTimeTab(tab)}
            style={[styles.timeTab, timeTab === tab && styles.timeTabActive]}
          >
            <Text
              style={[
                styles.timeTabText,
                timeTab === tab && styles.timeTabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* DATE PICKER */}
      <TouchableOpacity
        style={styles.datePicker}
        onPress={() => setShowCalendar(true)}
      >
        <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
        <Text style={styles.dateText}>{getDateDisplay()}</Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.gray} />
      </TouchableOpacity>

      {/* RECENT TRANSACTIONS */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {recentTransactions.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
      ) : (
        <FlatList
          data={recentTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor:
                        item.type === "income"
                          ? COLORS.income + "20"
                          : COLORS.expense + "20",
                    },
                  ]}
                >
                  <Ionicons
                    name={item.type === "income" ? "arrow-up" : "arrow-down"}
                    size={18}
                    color={
                      item.type === "income" ? COLORS.income : COLORS.expense
                    }
                  />
                </View>
                <View>
                  <Text style={styles.categoryText}>{item.category}</Text>
                  <Text style={styles.dateSubText}>
                    {new Date(item.date).toLocaleTimeString("en-PK", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text
                  style={[
                    styles.amountText,
                    {
                      color:
                        item.type === "income" ? COLORS.income : COLORS.expense,
                    },
                  ]}
                >
                  {item.type === "income" ? "+" : "-"} Rs. {item.amount}
                </Text>
                <TouchableOpacity onPress={() => deleteTransaction(item.id)}>
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={COLORS.gray}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  timeTabs: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  timeTab: { flex: 1, padding: 10, borderRadius: 12, alignItems: "center" },
  timeTabActive: { backgroundColor: COLORS.primary },
  timeTabText: { color: COLORS.gray, fontWeight: "600" },
  timeTabTextActive: { color: COLORS.white },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  dateText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "500",
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  emptyBox: {
    backgroundColor: COLORS.card,
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
  },
  emptyText: { color: COLORS.gray },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  transactionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryText: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
  dateSubText: { color: COLORS.gray, fontSize: 12 },
  transactionRight: { alignItems: "flex-end", gap: 6 },
  amountText: { fontSize: 16, fontWeight: "bold" },
});
