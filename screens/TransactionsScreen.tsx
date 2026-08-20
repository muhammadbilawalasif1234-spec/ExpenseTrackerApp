import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TransactionItem } from "../components/TransactionItem";
import { COLORS } from "../constants/colors";

export const TransactionsScreen = ({
  activeTxTab,
  setActiveTxTab,
  transactions,
  deleteTransaction,
}: any) => (
  <ScrollView
    style={styles.body}
    contentContainerStyle={{ paddingBottom: 120 }}
  >
    <View style={styles.typeTabBar}>
      {["All", "Income", "Expense", "Transfer"].map((t) => (
        <TouchableOpacity
          key={t}
          onPress={() => setActiveTxTab(t)}
          style={[styles.typeTab, activeTxTab === t && styles.activeTypeTab]}
        >
          <Text
            style={[
              styles.typeTabText,
              activeTxTab === t && { color: COLORS.white },
            ]}
          >
            {t}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    {transactions.filter(
      (t: any) => activeTxTab === "All" || t.type === activeTxTab.toLowerCase(),
    ).length === 0 ? (
      <Text style={{ color: COLORS.gray, textAlign: "center", marginTop: 20 }}>
        No Transactions
      </Text>
    ) : (
      transactions
        .filter(
          (t: any) =>
            activeTxTab === "All" || t.type === activeTxTab.toLowerCase(),
        )
        .map((item: any) => (
          <TransactionItem
            key={item.id}
            item={item}
            onDelete={deleteTransaction}
          />
        ))
    )}
  </ScrollView>
);

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: COLORS.dark,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 16,
  },
  typeTabBar: {
    flexDirection: "row",
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTypeTab: { backgroundColor: COLORS.primary },
  typeTabText: { color: COLORS.gray, fontWeight: "600", fontSize: 13 },
});
