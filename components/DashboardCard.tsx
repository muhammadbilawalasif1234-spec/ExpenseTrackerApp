import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

type Props = {
  income: number;
  expense: number;
  balance: number;
};

export default function DashboardCard({ income, expense, balance }: Props) {
  const accounts = [
    { name: "Cash", amount: 12500, icon: "wallet", color: "#00C896" },
    {
      name: "Bank Account",
      amount: 78100.5,
      icon: "business",
      color: "#4ECDC4",
    },
    { name: "Credit Card", amount: -9120.75, icon: "card", color: "#A29BFE" },
    { name: "Savings", amount: 14600.0, icon: "save", color: "#FFD93D" },
  ];

  return (
    <View>
      <LinearGradient
        colors={["#00C896", "#00997A"]}
        style={styles.balanceCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.label}>Total Balance</Text>
        <Text style={styles.balance}>Rs. {balance.toLocaleString()}</Text>
        <Text style={styles.change}>+8.45% ↑ vs last month</Text>

        <View style={styles.row}>
          <View>
            <Text style={styles.smallLabel}>Income</Text>
            <Text style={styles.amount}>+ Rs. {income.toLocaleString()}</Text>
          </View>
          <View>
            <Text style={styles.smallLabel}>Expense</Text>
            <Text style={styles.amount}>- Rs. {expense.toLocaleString()}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ACCOUNTS SECTION  */}
      <View style={styles.accountsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Accounts</Text>
          <Text style={styles.viewAll}>View all</Text>
        </View>

        {accounts.map((acc) => (
          <View key={acc.name} style={styles.accountItem}>
            <View
              style={[styles.iconBg, { backgroundColor: acc.color + "20" }]}
            >
              <Icon name={acc.icon} size={20} color={acc.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>{acc.name}</Text>
            </View>
            <Text
              style={[
                styles.accountAmount,
                { color: acc.amount < 0 ? "#FF6B6B" : "#2D3436" },
              ]}
            >
              Rs. {acc.amount.toLocaleString()}
            </Text>
            <Icon name="chevron-forward" size={20} color="#A4B0BE" />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    margin: 15,
    padding: 20,
    borderRadius: 20,
    elevation: 5,
  },
  label: { color: "#FFFFFF", opacity: 0.8, fontSize: 14 },
  balance: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 5,
  },
  change: { color: "#FFFFFF", opacity: 0.9, fontSize: 12, marginBottom: 15 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  smallLabel: { color: "#FFFFFF", opacity: 0.8, fontSize: 12 },
  amount: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },

  accountsContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 15,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#2D3436" },
  viewAll: { fontSize: 14, color: "#00C896", fontWeight: "bold" },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountName: { fontSize: 16, fontWeight: "500", color: "#2D3436" },
  accountAmount: { fontSize: 16, fontWeight: "bold", marginRight: 5 },
});
