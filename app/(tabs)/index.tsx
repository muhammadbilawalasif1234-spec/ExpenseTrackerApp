import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";

type Transaction = {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
};

const COLORS = {
  primary: "#00C896",
  dark: "#00997A",
  background: "#F8F9FA",
  white: "#FFFFFF",
  text: "#2D3436",
  gray: "#A4B0BE",
};

export default function Index() {
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeTab, setTimeTab] = useState("Daily");
  const [typeTab, setTypeTab] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [selectedType, setSelectedType] = useState<"income" | "expense">(
    "expense",
  );

  useEffect(() => {
    loadTransactions();
  }, []);
  useEffect(() => {
    saveTransactions();
  }, [transactions]);

  const saveTransactions = async () => {
    await AsyncStorage.setItem("transactions", JSON.stringify(transactions));
  };
  const loadTransactions = async () => {
    const data = await AsyncStorage.getItem("transactions");
    if (data !== null) setTransactions(JSON.parse(data));
  };

  const getDateDisplay = () => {
    if (timeTab === "Daily") return selectedDate.toDateString();
    if (timeTab === "Monthly")
      return selectedDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    if (timeTab === "Yearly") return selectedDate.getFullYear().toString();
    return selectedDate.toDateString();
  };

  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    let dateMatch = false;
    if (timeTab === "Daily")
      dateMatch = tDate.toDateString() === selectedDate.toDateString();
    if (timeTab === "Monthly")
      dateMatch =
        tDate.getMonth() === selectedDate.getMonth() &&
        tDate.getFullYear() === selectedDate.getFullYear();
    if (timeTab === "Yearly")
      dateMatch = tDate.getFullYear() === selectedDate.getFullYear();

    let typeMatch = false;
    if (typeTab === "All") typeMatch = true;
    if (typeTab === "Income") typeMatch = t.type === "income";
    if (typeTab === "Expense") typeMatch = t.type === "expense";

    return dateMatch && typeMatch;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((total, item) => total + item.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((total, item) => total + item.amount, 0);
  const savings = totalIncome - totalExpense;

  // INCOME CHART
  const incomeSummary = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((summary: Record<string, number>, item) => {
      summary[item.category] = (summary[item.category] || 0) + item.amount;
      return summary;
    }, {});
  const incomeChartData = Object.keys(incomeSummary).map((cat, i) => ({
    name: cat,
    population: incomeSummary[cat],
    color: ["#00C896", "#4ECDC4", "#A29BFE"][i % 3],
    legendFontColor: COLORS.text,
    legendFontSize: 12,
  }));

  // EXPENSE CHART
  const expenseSummary = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((summary: Record<string, number>, item) => {
      summary[item.category] = (summary[item.category] || 0) + item.amount;
      return summary;
    }, {});
  const expenseChartData = Object.keys(expenseSummary).map((cat, i) => ({
    name: cat,
    population: expenseSummary[cat],
    color: ["#FF6B6B", "#FFD93D", "#FF8C42"][i % 3],
    legendFontColor: COLORS.text,
    legendFontSize: 12,
  }));

  const categories = {
    income: ["Salary", "Bonus", "Freelance"],
    expense: ["Food", "Transport", "Bills", "Shopping", "Medicine"],
  };
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

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const addTransaction = (transactionCategory: string) => {
    if (amount === "" || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    const newTransaction: Transaction = {
      id: Date.now(),
      type: selectedType,
      amount: Number(amount),
      category: transactionCategory,
      date: new Date().toISOString(),
    };
    setTransactions([newTransaction, ...transactions]);
    setAmount("");
    setCustomCategory("");
    setModalVisible(false);
  };

  const handleCustomAdd = () => {
    if (customCategory.trim() === "") {
      Alert.alert("Error", "Please enter category name");
      return;
    }
    addTransaction(customCategory);
  };

  const deleteTransaction = (id: number) => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setTransactions(transactions.filter((t) => t.id !== id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{timeTab} Expenses</Text>
      </View>

      <View style={styles.tabBar}>
        {["Daily", "Monthly", "Yearly"].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => {
              setTimeTab(t);
              setSelectedDate(new Date());
            }}
          >
            <Text style={[styles.tabText, timeTab === t && styles.activeTab]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.dateBar}
        onPress={() => setShowDatePicker(true)}
      >
        <Icon name="calendar" size={20} color={COLORS.white} />
        <Text style={styles.dateText}>{getDateDisplay()}</Text>
        <View>
          <Text style={{ color: COLORS.white, fontSize: 12 }}>Savings</Text>
          <Text style={{ color: COLORS.white, fontWeight: "bold" }}>
            Rs. {savings}
          </Text>
        </View>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.totalCard}>
          <Text>Total Income</Text>
          <Text style={[styles.totalAmount, { color: "green" }]}>
            Rs. {totalIncome}
          </Text>
        </View>
        <View style={styles.totalCard}>
          <Text>Total Expenses</Text>
          <Text style={[styles.totalAmount, { color: "red" }]}>
            Rs. {totalExpense}
          </Text>
        </View>

        <View style={styles.typeTabBar}>
          {["All", "Income", "Expense"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTypeTab(t)}
              style={[styles.typeTab, typeTab === t && styles.activeTypeTab]}
            >
              <Text
                style={{
                  color: typeTab === t ? COLORS.white : COLORS.text,
                  fontWeight: "bold",
                }}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No transactions found
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor:
                      item.type === "income" ? "#D3FFD3" : "#FFD3D3",
                  },
                ]}
              >
                <Icon
                  name={icons[item.category] || "pricetag"}
                  size={22}
                  color={item.type === "income" ? "green" : "red"}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: "500" }}>{item.category}</Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: item.type === "income" ? "green" : "red",
                  }}
                >
                  {item.type.toUpperCase()}
                </Text>
              </View>
              <Text
                style={{
                  fontWeight: "bold",
                  color: item.type === "income" ? "green" : "red",
                  marginRight: 10,
                }}
              >
                {item.type === "income" ? "+" : "-"} Rs. {item.amount}
              </Text>
              <TouchableOpacity onPress={() => deleteTransaction(item.id)}>
                <Icon name="trash-outline" size={22} color="red" />
              </TouchableOpacity>
            </View>
          )}
        />

        {/* INCOME CHART */}
        {typeTab !== "Expense" && incomeChartData.length > 0 && (
          <View style={styles.chartCard}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                textAlign: "center",
                color: "green",
              }}
            >
              Rs. {totalIncome}
            </Text>
            <Text style={{ textAlign: "center", color: "gray" }}>
              Total Income
            </Text>
            <PieChart
              data={incomeChartData}
              width={Dimensions.get("window").width - 60}
              height={200}
              chartConfig={{ color: () => COLORS.text }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
            />
          </View>
        )}

        {/* EXPENSE CHART */}
        {typeTab !== "Income" && expenseChartData.length > 0 && (
          <View style={styles.chartCard}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                textAlign: "center",
                color: "red",
              }}
            >
              Rs. {totalExpense}
            </Text>
            <Text style={{ textAlign: "center", color: "gray" }}>
              Total Expense
            </Text>
            <PieChart
              data={expenseChartData}
              width={Dimensions.get("window").width - 60}
              height={200}
              chartConfig={{ color: () => COLORS.text }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
            />
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={30} color={COLORS.white} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              Add New Transaction
            </Text>

            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  selectedType === "income" && styles.activeTypeBtn,
                ]}
                onPress={() => setSelectedType("income")}
              >
                <Text
                  style={{
                    color:
                      selectedType === "income" ? COLORS.white : COLORS.text,
                  }}
                >
                  Income
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  selectedType === "expense" && styles.activeTypeBtn,
                ]}
                onPress={() => setSelectedType("expense")}
              >
                <Text
                  style={{
                    color:
                      selectedType === "expense" ? COLORS.white : COLORS.text,
                  }}
                >
                  Expense
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Enter Amount"
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
              keyboardType="numeric"
            />

            <Text style={{ fontWeight: "bold" }}>Categories</Text>
            <View style={styles.buttonRow}>
              {selectedType === "income"
                ? categories.income.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.catBtn}
                      onPress={() => addTransaction(cat)}
                    >
                      <Text>{cat}</Text>
                    </TouchableOpacity>
                  ))
                : categories.expense.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catBtn, { backgroundColor: "#FFD3D3" }]}
                      onPress={() => addTransaction(cat)}
                    >
                      <Text>{cat}</Text>
                    </TouchableOpacity>
                  ))}
            </View>

            <Text style={{ fontWeight: "bold", marginTop: 10 }}>
              Or Add Custom
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                placeholder="Enter custom category"
                value={customCategory}
                onChangeText={setCustomCategory}
                style={[styles.input, { flex: 1, marginRight: 10 }]}
              />
              <TouchableOpacity
                style={[styles.catBtn, { backgroundColor: COLORS.primary }]}
                onPress={handleCustomAdd}
              >
                <Text style={{ color: COLORS.white }}>Add</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 10, alignItems: "center" }}
            >
              <Text style={{ color: "red", fontWeight: "bold" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTitle: { color: COLORS.white, fontSize: 22, fontWeight: "bold" },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 10,
  },
  tabText: { color: COLORS.white, opacity: 0.7, fontSize: 16 },
  activeTab: { opacity: 1, borderBottomWidth: 2, borderColor: COLORS.white },
  dateBar: {
    backgroundColor: COLORS.dark,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 15,
  },
  dateText: { color: COLORS.white, fontWeight: "bold", fontSize: 16 },
  body: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 15,
    marginTop: 10,
  },
  totalCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
  },
  totalAmount: { fontSize: 22, fontWeight: "bold", marginTop: 5 },
  typeTabBar: {
    flexDirection: "row",
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    padding: 4,
    marginBottom: 15,
  },
  typeTab: { flex: 1, padding: 8, alignItems: "center", borderRadius: 8 },
  activeTypeTab: { backgroundColor: COLORS.primary },
  listItem: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: COLORS.white,
    width: "90%",
    padding: 20,
    borderRadius: 20,
  },
  input: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonRow: { flexDirection: "row", flexWrap: "wrap", marginVertical: 10 },
  catBtn: {
    backgroundColor: "#D3FFD3",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  typeSelector: {
    flexDirection: "row",
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    padding: 4,
    marginBottom: 15,
  },
  typeBtn: { flex: 1, padding: 10, alignItems: "center", borderRadius: 8 },
  activeTypeBtn: { backgroundColor: COLORS.primary },
});
