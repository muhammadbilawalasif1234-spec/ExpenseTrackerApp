import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../constants/colors";

const icons: Record<string, string> = {
  Salary: "cash",
  Bonus: "gift",
  Freelance: "laptop",
  Food: "restaurant",
  Transport: "car",
  Bills: "receipt",
  Shopping: "bag",
  Medicine: "medical",
};

export const TransactionItem = ({ item, onDelete }: any) => (
  <TouchableOpacity onLongPress={() => onDelete(item.id)} style={styles.txItem}>
    <View
      style={[
        styles.iconCircle,
        { backgroundColor: item.type === "income" ? "#004d40" : "#4d0000" },
      ]}
    >
      <Icon
        name={icons[item.category] || "help"}
        size={20}
        color={item.type === "income" ? COLORS.primary : COLORS.expense}
      />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.txCategory}>{item.category}</Text>
      <Text style={styles.txDate}>
        {new Date(item.date).toLocaleDateString()}
      </Text>
    </View>
    <Text
      style={[
        styles.txAmount,
        { color: item.type === "income" ? COLORS.primary : COLORS.expense },
      ]}
    >
      {item.type === "income" ? "+" : "-"}Rs. {item.amount.toLocaleString()}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  txItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  txCategory: { color: COLORS.white, fontWeight: "bold", fontSize: 14 },
  txDate: { color: COLORS.gray, fontSize: 12, marginTop: 2 },
  txAmount: { fontWeight: "bold", fontSize: 15 },
});
