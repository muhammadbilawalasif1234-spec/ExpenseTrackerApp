import { useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Icon from "react-native-vector-icons/Ionicons";
import { FilterModal } from "../components/FilterModal";
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
  const [filterModal, setFilterModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [selectedType, setSelectedType] = useState<"income" | "expense">(
    "expense",
  );
  const [filterCategory, setFilterCategory] = useState("All");
  const [activeTxTab, setActiveTxTab] = useState("All");
  const [searchCategory, setSearchCategory] = useState("");

  const { transactions, addTransaction, deleteTransaction } = useTransactions();

  const categories = {
    income: ["Salary", "Bonus", "Freelance"],
    expense: ["Food", "Transport", "Bills", "Shopping", "Medicine"],
  };
  const allCategories = ["All", ...categories.income, ...categories.expense];

  const getDateDisplay = () => {
    if (timeTab === "Daily")
      return selectedDate.toLocaleDateString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    if (timeTab === "Monthly")
      return selectedDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    return selectedDate.getFullYear().toString();
  };

  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    let dateMatch =
      timeTab === "Daily"
        ? tDate.toDateString() === selectedDate.toDateString()
        : timeTab === "Monthly"
          ? tDate.getMonth() === selectedDate.getMonth() &&
            tDate.getFullYear() === selectedDate.getFullYear()
          : tDate.getFullYear() === selectedDate.getFullYear();
    let categoryMatch =
      filterCategory === "All" || t.category === filterCategory;
    return dateMatch && categoryMatch;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((total, item) => total + item.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((total, item) => total + item.amount, 0);
  const savings = totalIncome - totalExpense;

  const incomeSummary = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((summary: Record<string, number>, item) => {
      summary[item.category] = (summary[item.category] || 0) + item.amount;
      return summary;
    }, {});
  const incomeChartData = Object.keys(incomeSummary).map((cat, i) => ({
    name: cat,
    population: incomeSummary[cat],
    color: ["#00D38C", "#5AC8FA", "#AF52DE"][i % 3],
    legendFontColor: COLORS.white,
    legendFontSize: 13,
  }));
  const expenseSummary = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((summary: Record<string, number>, item) => {
      summary[item.category] = (summary[item.category] || 0) + item.amount;
      return summary;
    }, {});
  const expenseChartData = Object.keys(expenseSummary).map((cat, i) => ({
    name: cat,
    population: expenseSummary[cat],
    color: ["#FF3B30", "#FF9500", "#FFCC00"][i % 3],
    legendFontColor: COLORS.white,
    legendFontSize: 13,
  }));

  const handleAddTransaction = (category: string) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    addTransaction({
      type: selectedType,
      amount: Number(amount),
      category,
      date: new Date().toISOString(),
    });
    setAmount("");
    setCustomCategory("");
    setModalVisible(false);
  };
  const handleCustomAdd = () => {
    if (!customCategory.trim()) {
      Alert.alert("Error", "Please enter category name");
      return;
    }
    handleAddTransaction(customCategory);
  };
  const onDelete = (id: number) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTransaction(id),
      },
    ]);
  };

  const lineData = {
    labels: ["W1", "W2", "W3", "W4"],
    datasets: [
      {
        data: [
          totalExpense / 4 || 0,
          totalExpense / 2 || 0,
          totalExpense / 1.5 || 0,
          totalExpense || 0,
        ],
      },
    ],
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{activeTab}</Text>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => setFilterModal(true)}
        >
          <Icon name="options-outline" size={26} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === "Dashboard" && (
          <DashboardScreen
            {...{
              timeTab,
              setTimeTab,
              selectedDate,
              setShowCalendar,
              getDateDisplay,
              filteredTransactions,
              savings,
              deleteTransaction: onDelete,
            }}
          />
        )}
        {activeTab === "Transactions" && (
          <TransactionsScreen
            {...{
              activeTxTab,
              setActiveTxTab,
              transactions: filteredTransactions,
              deleteTransaction: onDelete,
            }}
          />
        )}
        {activeTab === "Reports" && (
          <ReportsScreen
            {...{
              timeTab,
              setTimeTab,
              incomeChartData,
              expenseChartData,
              totalIncome,
              totalExpense,
              lineData,
            }}
          />
        )}
        {activeTab === "Dashboard" && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="add" size={32} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.bottomTab}>
        {["Dashboard", "Transactions", "Reports"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={styles.bottomTabItem}
          >
            <Icon
              name={
                tab === "Dashboard"
                  ? "home"
                  : tab === "Transactions"
                    ? "list"
                    : "pie-chart"
              }
              size={26}
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

      {showCalendar && (
        <Modal transparent visible={showCalendar}>
          <View style={styles.modalBg}>
            <View
              style={[styles.calendarModal, { backgroundColor: COLORS.card }]}
            >
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowCalendar(false)}>
                  <Icon name="close" size={26} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <Calendar
                theme={{
                  backgroundColor: COLORS.card,
                  calendarBackground: COLORS.card,
                  textSectionTitleColor: COLORS.gray,
                  dayTextColor: COLORS.white,
                  monthTextColor: COLORS.white,
                  selectedDayBackgroundColor: COLORS.primary,
                }}
                markedDates={{
                  [selectedDate.toISOString().split("T")[0]]: {
                    selected: true,
                    selectedColor: COLORS.primary,
                  },
                }}
                onDayPress={(day) => {
                  setSelectedDate(new Date(day.dateString));
                  setShowCalendar(false);
                }}
              />
            </View>
          </View>
        </Modal>
      )}

      <FilterModal
        visible={filterModal}
        onClose={() => {
          setFilterCategory("All");
          setFilterModal(false);
        }}
        {...{
          searchCategory,
          setSearchCategory,
          filterCategory,
          setFilterCategory,
          getDateDisplay,
          onDatePress: () => setShowCalendar(true),
          allCategories,
        }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modal, { backgroundColor: COLORS.card }]}>
            <Text style={styles.modalTitle}>Add Transaction</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  selectedType === "income" && styles.activeTypeBtn,
                ]}
                onPress={() => setSelectedType("income")}
              >
                <Text style={{ color: COLORS.white, fontWeight: "600" }}>
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
                <Text style={{ color: COLORS.white, fontWeight: "600" }}>
                  Expense
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Rs. 0"
              placeholderTextColor={COLORS.gray}
              value={amount}
              onChangeText={setAmount}
              style={[
                styles.input,
                { backgroundColor: COLORS.dark, color: COLORS.white },
              ]}
              keyboardType="numeric"
            />
            <View style={styles.buttonRow}>
              {(selectedType === "income"
                ? categories.income
                : categories.expense
              ).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.catBtn}
                  onPress={() => handleAddTransaction(cat)}
                >
                  <Text style={styles.catBtnText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              placeholder="Custom Category"
              placeholderTextColor={COLORS.gray}
              value={customCategory}
              onChangeText={setCustomCategory}
              style={[
                styles.input,
                { backgroundColor: COLORS.dark, color: COLORS.white },
              ]}
            />
            <TouchableOpacity
              style={[styles.catBtn, { backgroundColor: COLORS.primary }]}
              onPress={handleCustomAdd}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Add Custom
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 16, alignItems: "center" }}
            >
              <Text style={{ color: COLORS.expense, fontWeight: "600" }}>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 50 : 60,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  headerIcon: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 10,
    borderRadius: 14,
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 24,
    backgroundColor: COLORS.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  bottomTab: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "android" ? 20 : 30,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  bottomTabItem: { flex: 1, alignItems: "center" },
  bottomTabText: { fontSize: 12, marginTop: 6, fontWeight: "600" },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: { width: "90%", padding: 20, borderRadius: 24 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 16,
  },
  input: {
    padding: 16,
    borderRadius: 14,
    marginVertical: 12,
    fontSize: 18,
    fontWeight: "600",
  },
  buttonRow: { flexDirection: "row", flexWrap: "wrap" },
  catBtn: {
    backgroundColor: COLORS.cardLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    margin: 4,
  },
  catBtnText: { color: COLORS.white, fontSize: 14, fontWeight: "500" },
  typeSelector: {
    flexDirection: "row",
    backgroundColor: COLORS.cardLight,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  typeBtn: { flex: 1, padding: 12, alignItems: "center", borderRadius: 10 },
  activeTypeBtn: { backgroundColor: COLORS.primary },
  calendarModal: { borderRadius: 24, padding: 20, width: "90%" },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  calendarTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.white },
});
