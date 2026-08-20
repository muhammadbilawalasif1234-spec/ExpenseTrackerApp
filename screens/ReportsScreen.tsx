import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import PieChart from "react-native-pie-chart";
import { COLORS } from "../constants/colors";

export const ReportsScreen = ({ transactions }: any) => {
  const expenseByCategory = transactions
    .filter((t: any) => t.type === "expense")
    .reduce((acc: any, i: any) => {
      acc[i.category] = (acc[i.category] || 0) + i.amount;
      return acc;
    }, {});
  const pieData = Object.values(expenseByCategory);
  const pieColors = ["#FF3D00", "#FF9100", "#FFD600", "#00B0FF", "#D500F9"];

  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [2000, 4500, 2800, 8000, 9900, 4300] }],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Monthly Overview</Text>
      <View style={styles.card}>
        <BarChart
          data={barData}
          width={320}
          height={220}
          yAxisSuffix="Rs"
          chartConfig={{
            backgroundColor: "#1E1E1E",
            backgroundGradientFrom: "#1E1E1E",
            backgroundGradientTo: "#1E1E1E",
            color: () => COLORS.primary,
            labelColor: () => COLORS.gray,
          }}
          style={{ borderRadius: 16 }}
        />
      </View>
      <Text style={styles.title}>Expense by Category</Text>
      <View style={styles.pieCard}>
        {pieData.length > 0 ? (
          <PieChart
            widthAndHeight={180}
            series={pieData}
            sliceColor={pieColors}
          />
        ) : (
          <Text style={{ color: COLORS.gray }}>No Data</Text>
        )}
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: { padding: 20 },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 10 },
  pieCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
});
