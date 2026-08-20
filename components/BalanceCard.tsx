import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/colors";

export const BalanceCard = ({ savings }: { savings: number }) => (
  <View style={styles.greenCard}>
    <Text style={styles.balanceLabel}>Total Balance</Text>
    <Text style={styles.balanceAmount}>
      Rs. {savings.toLocaleString("en-PK")}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  greenCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    elevation: 5,
  },
  balanceLabel: {
    color: COLORS.white,
    opacity: 0.9,
    fontSize: 15,
    fontWeight: "500",
  },
  balanceAmount: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: "bold",
    marginVertical: 8,
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  balanceChange: { color: COLORS.white, fontSize: 13, fontWeight: "600" },
});
