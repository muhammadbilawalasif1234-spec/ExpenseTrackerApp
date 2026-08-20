import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PieChart from "react-native-pie-chart";
import { CATEGORIES } from "../constants/categories";
import { COLORS } from "../constants/colors";
import { useTransactions } from "../hooks/useTransactions";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ReportsScreen } from "../screens/ReportsScreen";
import { TransactionsScreen } from "../screens/TransactionsScreen";

export default function Index() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [amount, setAmount] = useState("");
  const [timeTab, setTimeTab] = useState("Daily");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedType, setSelectedType] = useState<"income" | "expense">(
    "expense",
  );

  const { transactions, addTransaction, deleteTransaction } = useTransactions();

  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return timeTab === "Daily"
      ? tDate.toDateString() === selectedDate.toDateString()
      : true;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((total, item) => total + item.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((total, item) => total + item.amount, 0);
  const savings = totalIncome - totalExpense;

  const expenseByCategory = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc: any, i) => {
      acc[i.category] = (acc[i.category] || 0) + i.amount;
      return acc;
    }, {});
  const expenseData = Object.values(expenseByCategory);
  const expenseColors = ["#FF3D00", "#FF9100", "#FFD600", "#00B0FF", "#D500F9"];
  const pieWidthAndHeight = 160;
  const pieSeries = expenseData.length > 0 ? expenseData : [1];
  const pieSliceColor =
    expenseData.length > 0
      ? expenseColors.slice(0, expenseData.length)
      : ["#333"];

  const handleAddTransaction = (category: string) => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Error", "Valid amount dalo");
      return;
    }
    addTransaction({
      type: selectedType,
      amount: Number(amount),
      category,
      date: new Date().toISOString(),
    });
    setAmount("");
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.dark }}>
      <StatusBar barStyle="light-content" backgroundColor="#00C853" />

      <LinearGradient colors={["#00C853", "#009624"]} style={styles.header}>
        <Text style={styles.headerLabel}>Total Balance</Text>
        <Text style={styles.headerAmount}>
          Rs. {savings.toLocaleString("en-PK")}
        </Text>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSub}>Income</Text>
            <Text style={styles.headerSubAmount}>+ Rs. {totalIncome}</Text>
          </View>
          <View>
            <Text style={styles.headerSub}>Expense</Text>
            <Text style={styles.headerSubAmount}>- Rs. {totalExpense}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={{ marginTop: -20 }}>
        <View style={styles.pieContainer}>
          {expenseData.length === 0 ? (
            <View style={styles.pieEmpty}>
              <Text style={{ color: COLORS.gray }}>No Expense</Text>
            </View>
          ) : (
            <>
              <PieChart
                widthAndHeight={pieWidthAndHeight}
                series={pieSeries}
                sliceColor={pieSliceColor}
                coverRadius={0.6}
                coverFill={COLORS.dark}
              />
              <View style={styles.pieCenter}>
                <Text style={styles.pieLabel}>Total Spent</Text>
                <Text style={styles.pieAmount}>Rs. {totalExpense}</Text>
              </View>
            </>
          )}
        </View>

        {activeTab === "Dashboard" && (
          <DashboardScreen
            timeTab={timeTab}
            setTimeTab={setTimeTab}
            selectedDate={selectedDate}
            setShowCalendar={setShowCalendar}
            filteredTransactions={filteredTransactions}
            savings={savings}
            deleteTransaction={deleteTransaction}
          />
        )}
        {activeTab === "Transactions" && (
          <TransactionsScreen
            transactions={transactions}
            deleteTransaction={deleteTransaction}
          />
        )}
        {activeTab === "Reports" && (
          <ReportsScreen transactions={transactions} />
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>

      <View style={styles.bottomTab}>
        {["Dashboard", "Transactions", "Reports"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={styles.bottomTabItem}
          >
            <Ionicons
              name={
                tab === "Dashboard"
                  ? "home"
                  : tab === "Transactions"
                    ? "list"
                    : "pie-chart"
              }
              size={24}
              color={activeTab === tab ? COLORS.primary : COLORS.gray}
            />
            <Text
              style={[
                styles.bottomTabText,
                { color: activeTab === tab ? COLORS.primary : COLORS.gray },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Add {selectedType === "income" ? "Income" : "Expense"}
            </Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  selectedType === "expense" && {
                    backgroundColor: COLORS.expense,
                  },
                ]}
                onPress={() => setSelectedType("expense")}
              >
                <Text style={styles.typeText}>Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  selectedType === "income" && {
                    backgroundColor: COLORS.income,
                  },
                ]}
                onPress={() => setSelectedType("income")}
              >
                <Text style={styles.typeText}>Income</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Amount"
              placeholderTextColor={COLORS.gray}
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
              keyboardType="numeric"
            />
            <View style={styles.iconGrid}>
              {(selectedType === "income"
                ? CATEGORIES.income
                : CATEGORIES.expense
              ).map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={styles.iconBox}
                  onPress={() => handleAddTransaction(cat.name)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={26}
                    color={COLORS.primary}
                  />
                  <Text style={styles.iconText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text
                style={{
                  color: COLORS.expense,
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerLabel: { color: "#fff", opacity: 0.8, fontSize: 14 },
  headerAmount: { color: "#fff", fontSize: 40, fontWeight: "bold" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  headerSub: { color: "#fff", opacity: 0.8, fontSize: 12 },
  headerSubAmount: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  pieContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  pieEmpty: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  pieCenter: { position: "absolute", alignItems: "center" },
  pieLabel: { color: COLORS.gray, fontSize: 12 },
  pieAmount: { color: COLORS.white, fontSize: 20, fontWeight: "bold" },
  fab: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    backgroundColor: COLORS.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  bottomTab: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  bottomTabItem: { flex: 1, alignItems: "center" },
  bottomTabText: { fontSize: 12, marginTop: 4 },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: COLORS.dark,
    color: COLORS.white,
    padding: 16,
    borderRadius: 14,
    fontSize: 18,
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: "row",
    backgroundColor: COLORS.dark,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  typeBtn: { flex: 1, padding: 12, alignItems: "center", borderRadius: 10 },
  typeText: { color: COLORS.white, fontWeight: "600" },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  iconBox: {
    width: "30%",
    backgroundColor: COLORS.dark,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  iconText: { color: COLORS.white, fontSize: 12, marginTop: 6 },
});
