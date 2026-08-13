import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function App() {
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Khana");

  const expenseSummary = transactions
    .filter((t) => t.type === "expense")
    .reduce((summary, item) => {
      summary[item.category] = (summary[item.category] || 0) + item.amount;
      return summary;
    }, {});

  const categories = {
    income: ["Salary", "Bonus", "Gift"],
    expense: ["Khana", "Petrol", "Bills", "Shopping"],
  };

  const addTransaction = () => {
    if (amount === "") return;
    const newTransaction = {
      type: type,
      amount: Number(amount),
      category: category,
    };
    setTransactions([...transactions, newTransaction]);
    setAmount("");
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expense Tracker</Text>
      <TextInput
        placeholder="Amount Likho"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
        keyboardType="numeric"
      />

      {/* Category Buttons */}
      <Text style={{ marginTop: 10, fontWeight: "bold" }}>Category:</Text>
      <View
        style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 5, gap: 8 }}
      >
        {categories[type].map((cat) => (
          <Button
            key={cat}
            title={cat}
            onPress={() => setCategory(cat)}
            color={category === cat ? "blue" : "gray"}
          />
        ))}
      </View>

      {/* Add Buttons */}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 15 }}>
        <Button
          title="Add Income"
          onPress={() => {
            setType("income");
            setCategory("Salary");
          }}
        />
        <Button
          title="Add Expense"
          onPress={() => {
            setType("expense");
            setCategory("Khana");
          }}
        />
      </View>

      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginTop: 20,
          color: "green",
        }}
      >
        Income: Rs. {totalIncome}
      </Text>
      <Text style={{ fontSize: 18, fontWeight: "bold", color: "red" }}>
        Expense: Rs. {totalExpense}
      </Text>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        Balance: Rs. {totalIncome - totalExpense}
      </Text>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>
        Category Wise Expense
      </Text>

      {Object.keys(expenseSummary).map((cat) => (
        <Text key={cat} style={{ fontSize: 16 }}>
          {cat}: Rs. {expenseSummary[cat]}
        </Text>
      ))}

      {transactions.map((item, index) => (
        <View
          key={index}
          style={[
            styles.card,
            { backgroundColor: item.type === "income" ? "#d4f8d4" : "#ffd4d4" },
          ]}
        >
          <Text>
            {item.type} - {item.category}: Rs. {item.amount}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    width: 200,
    padding: 10,
    marginTop: 20,
    borderRadius: 8,
  },
  card: {
    padding: 10,
    marginTop: 8,
    borderRadius: 8,
    width: 280,
  },
});
