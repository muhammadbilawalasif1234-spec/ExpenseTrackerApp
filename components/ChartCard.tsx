import { Dimensions, StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { COLORS } from "../constants/colors";
const screenWidth = Dimensions.get("window").width - 32;

export const ChartCard = ({ title, total, data }: any) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.expenseTotal}>Rs. {total.toLocaleString()}</Text>
    {data.length > 0 ? (
      <PieChart
        data={data}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: COLORS.card,
          backgroundGradientFrom: COLORS.card,
          backgroundGradientTo: COLORS.card,
          color: () => `rgba(255,255,255,1)`,
        }}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
      />
    ) : (
      <Text style={{ color: COLORS.gray, textAlign: "center" }}>No data</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
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
  expenseTotal: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 10,
  },
});
