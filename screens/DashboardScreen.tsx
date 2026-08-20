import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { BalanceCard } from "../components/BalanceCard";
import { TransactionItem } from "../components/TransactionItem";
import { COLORS } from "../constants/colors";

export const DashboardScreen = ({
  timeTab,
  setTimeTab,
  selectedDate,
  setShowCalendar,
  getDateDisplay,
  filteredTransactions,
  savings,
  deleteTransaction,
}: any) => (
  <ScrollView
    style={styles.body}
    contentContainerStyle={{ paddingBottom: 120 }}
  >
    <BalanceCard savings={savings} />

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.horizontalTabBar}
    >
      {["Daily", "Monthly", "Yearly"].map((t) => (
        <TouchableOpacity
          key={t}
          onPress={() => {
            setTimeTab(t);
          }}
          style={[
            styles.horizontalTab,
            timeTab === t && styles.activeHorizontalTab,
          ]}
        >
          <Text
            style={[
              styles.horizontalTabText,
              timeTab === t && styles.activeHorizontalTabText,
            ]}
          >
            {t}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>

    <TouchableOpacity
      style={styles.dateBar}
      onPress={() => setShowCalendar(true)}
    >
      <Icon name="calendar" size={20} color={COLORS.white} />
      <Text style={styles.dateText}>{getDateDisplay()}</Text>
    </TouchableOpacity>

    <View style={styles.card}>
      <Text style={styles.cardTitle}>Accounts</Text>
      <View style={styles.accountItem}>
        <View style={[styles.iconCircle, { backgroundColor: "#004d40" }]}>
          <Icon name="wallet" size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.accountName}>Cash</Text>
        <Text style={styles.accountAmount}>Rs. 12,500</Text>
      </View>
      <View style={styles.accountItem}>
        <View style={[styles.iconCircle, { backgroundColor: "#004d40" }]}>
          <Icon name="business" size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.accountName}>Bank Account</Text>
        <Text style={styles.accountAmount}>Rs. 78,100.5</Text>
      </View>
    </View>

    <View style={styles.card}>
      <Text style={styles.cardTitle}>Recent Transactions</Text>
      {filteredTransactions.slice(0, 5).map((item: any) => (
        <TransactionItem
          key={item.id}
          item={item}
          onDelete={deleteTransaction}
        />
      ))}
    </View>
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
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 12,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountName: { flex: 1, color: COLORS.white, fontSize: 15 },
  accountAmount: { color: COLORS.white, fontWeight: "bold", fontSize: 15 },
  horizontalTabBar: { marginBottom: 16 },
  horizontalTab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#2A2A2A",
  },
  activeHorizontalTab: { backgroundColor: COLORS.primary },
  horizontalTabText: { color: COLORS.gray, fontWeight: "bold", fontSize: 13 },
  activeHorizontalTabText: { color: COLORS.white },
  dateBar: {
    backgroundColor: "#2A2A2A",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  dateText: { color: COLORS.white, fontWeight: "bold", fontSize: 14 },
});
