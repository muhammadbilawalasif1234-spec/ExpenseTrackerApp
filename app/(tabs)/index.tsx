import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";

type Transaction = {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
};

export default function Index() {
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );

  useEffect(() => {
    loadTransactions();
  }, []);
  useEffect(() => {
    saveTransactions();
  }, [transactions]);

  const saveTransactions = async () => {
    try {
      await AsyncStorage.setItem("transactions", JSON.stringify(transactions));
    } catch (e) {
      console.log("Save Error:", e);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await AsyncStorage.getItem("transactions");
      if (data !== null) setTransactions(JSON.parse(data));
    } catch (e) {
      console.log("Load Error:", e);
    }
  };

  // TOTAL CALCULATION
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((total, item) => total + item.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  // MONTHLY CALCULATION
  const monthlyTransactions = transactions.filter(
    (t) => t.date.slice(0, 7) === selectedMonth,
  );
  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((total, item) => total + item.amount, 0);
  const monthlyExpense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  // Expense by category - sirf is mahine ke liye
  const expenseSummary = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((summary: Record<string, number>, item) => {
      summary[item.category] = (summary[item.category] || 0) + item.amount;
      return summary;
    }, {});

  // CHART 1: Income vs Expense
  const incomeExpenseChartData = [
    {
      name: "Income",
      population: totalIncome,
      color: "#4BC0C0",
      legendFontColor: "#7F7F7F",
      legendFontSize: 14,
    },
    {
      name: "Expense",
      population: totalExpense,
      color: "#FF6384",
      legendFontColor: "#7F7F7F",
      legendFontSize: 14,
    },
  ].filter((item) => item.population > 0);

  // CHART 2: Expense by Category - NAYA
  const expenseChartData = Object.keys(expenseSummary).map((cat) => ({
    name: cat,
    population: expenseSummary[cat],
    color:
      cat === "Khana"
        ? "#FF6384"
        : cat === "Petrol"
          ? "#36A2EB"
          : cat === "Bills"
            ? "#FFCE56"
            : cat === "Shopping"
              ? "#9966FF"
              : "#4BC0C0",
    legendFontColor: "#7F7F7F",
    legendFontSize: 14,
  }));

  const categories = {
    income: ["Salary", "Bonus", "Gift"],
    expense: ["Khana", "Petrol", "Bills", "Shopping"],
  };

  const addTransaction = (transactionCategory: string) => {
    if (amount === "" || Number(amount) <= 0) {
      Alert.alert("Error", "Sahi amount likho");
      return;
    }
    const transactionType = categories.income.includes(transactionCategory)
      ? "income"
      : "expense";
    const newTransaction: Transaction = {
      id: Date.now(),
      type: transactionType,
      amount: Number(amount),
      category: transactionCategory,
      date: new Date().toISOString(),
    };
    setTransactions([...transactions, newTransaction]);
    setAmount("");
  };

  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const getAvailableMonths = () => {
    const months = transactions.map((t) => t.date.slice(0, 7));
    return [...new Set(months)].sort().reverse();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50, alignItems: "center" }}
    >
      <Text style={styles.title}>Expense Tracker</Text>

      <TextInput
        placeholder="Amount Likho"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
        keyboardType="numeric"
      />

      <Text style={{ marginTop: 15, fontWeight: "bold", fontSize: 16 }}>
        Income Category:
      </Text>
      <View style={styles.buttonRow}>
        {categories.income.map((cat) => (
          <Button
            key={cat}
            title={cat}
            onPress={() => addTransaction(cat)}
            color="#4BC0C0"
          />
        ))}
      </View>

      <Text style={{ marginTop: 15, fontWeight: "bold", fontSize: 16 }}>
        Expense Category:
      </Text>
      <View style={styles.buttonRow}>
        {categories.expense.map((cat) => (
          <Button
            key={cat}
            title={cat}
            onPress={() => addTransaction(cat)}
            color="#FF6384"
          />
        ))}
      </View>

      {/* TOTAL SUMMARY */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Total Summary</Text>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "green" }}>
          Total Income: Rs. {totalIncome}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "red" }}>
          Total Expense: Rs. {totalExpense}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Total Balance: Rs. {totalIncome - totalExpense}
        </Text>
      </View>

      {/* MONTH SELECT */}
      <View
        style={{
          marginTop: 10,
          flexDirection: "row",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Text
          style={{ width: "100%", textAlign: "center", fontWeight: "bold" }}
        >
          Month Select:
        </Text>
        {getAvailableMonths().map((month) => (
          <Button
            key={month}
            title={month}
            onPress={() => setSelectedMonth(month)}
            color={selectedMonth === month ? "#007AFF" : "gray"}
          />
        ))}
      </View>

      {/* MONTHLY SUMMARY */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>This Month: {selectedMonth}</Text>
        <Text style={{ fontSize: 18, color: "green" }}>
          Monthly Income: Rs. {monthlyIncome}
        </Text>
        <Text style={{ fontSize: 18, color: "red" }}>
          Monthly Expense: Rs. {monthlyExpense}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Monthly Balance: Rs. {monthlyIncome - monthlyExpense}
        </Text>
      </View>

      {/* CHART 1 */}
      <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>
        Income vs Expense
      </Text>
      {incomeExpenseChartData.length > 1 ? (
        <PieChart
          data={incomeExpenseChartData}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      ) : (
        <Text style={{ marginTop: 20, color: "gray" }}>
          Pehle 1 Income aur 1 Expense add karo
        </Text>
      )}

      {/* CHART 2: NAYA */}
      <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>
        Expense by Category
      </Text>
      {expenseChartData.length > 0 ? (
        <PieChart
          data={expenseChartData}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      ) : (
        <Text style={{ marginTop: 10, color: "gray" }}>
          Is mahine koi expense nahi
        </Text>
      )}

      {/* LIST */}
      <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 20 }}>
        All Transactions
      </Text>
      {transactions.map((item) => (
        <View
          key={item.id}
          style={[
            styles.card,
            { backgroundColor: item.type === "income" ? "#d4f8d4" : "#ffd4d4" },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "bold" }}>
              {item.type} - {item.category}
            </Text>
            <Text>Rs. {item.amount}</Text>
            <Text style={{ fontSize: 12, color: "gray" }}>
              {item.date.slice(0, 10)}
            </Text>
          </View>
          <Button
            title="X"
            onPress={() => deleteTransaction(item.id)}
            color="red"
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, backgroundColor: "#fff" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    width: 200,
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    textAlign: "center",
  },
  card: {
    padding: 10,
    marginTop: 8,
    borderRadius: 8,
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryBox: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    width: "90%",
    alignItems: "center",
    gap: 5,
  },
  summaryTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 5 },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
});
