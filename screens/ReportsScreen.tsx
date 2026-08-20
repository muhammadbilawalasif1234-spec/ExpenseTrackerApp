import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { ChartCard } from "../components/ChartCard";
import { COLORS } from "../constants/colors";
const screenWidth = Dimensions.get("window").width - 32;

export const ReportsScreen = ({
  timeTab,
  setTimeTab,
  incomeChartData,
  expenseChartData,
  totalIncome,
  totalExpense,
  lineData,
}: any) => (
  <ScrollView
    style={styles.body}
    contentContainerStyle={{ paddingBottom: 120 }}
  >
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
    {incomeChartData.length > 0 && (
      <ChartCard title="Income" total={totalIncome} data={incomeChartData} />
    )}
    {expenseChartData.length > 0 && (
      <ChartCard title="Expense" total={totalExpense} data={expenseChartData} />
    )}
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Spending Trend</Text>
      <LineChart
        data={lineData}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: COLORS.card,
          backgroundGradientFrom: COLORS.card,
          backgroundGradientTo: COLORS.card,
          color: () => COLORS.primary,
          labelColor: () => COLORS.gray,
        }}
        bezier
        style={{ borderRadius: 16 }}
      />
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
});
