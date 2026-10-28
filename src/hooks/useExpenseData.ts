import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import {
  Account,
  Budget,
  Category,
  Currency,
  SavingsGoal,
  Subcategory,
  ThemeMode,
  TimeTab,
  Transaction,
  UserProfile,
} from "../types";

const DEFAULT_CURRENCY_OBJ: Currency = {
  code: "USD",
  symbol: "$",
  name: "US Dollar",
  position: "prefix",
};

const DEFAULT_CATS: Category[] = [
  {
    id: "cat-1",
    name: "Food & Drinks",
    type: "expense",
    icon: "fast-food",
    color: "#F59E0B",
    subcategories: [],
  },
  {
    id: "cat-2",
    name: "Shopping",
    type: "expense",
    icon: "cart",
    color: "#EC4899",
    subcategories: [],
  },
  {
    id: "cat-3",
    name: "Housing",
    type: "expense",
    icon: "home",
    color: "#8B5CF6",
    subcategories: [],
  },
  {
    id: "cat-4",
    name: "Transportation",
    type: "expense",
    icon: "car",
    color: "#3B82F6",
    subcategories: [],
  },
  {
    id: "cat-5",
    name: "Salary",
    type: "income",
    icon: "cash",
    color: "#10B981",
    subcategories: [],
  },
];

export function useExpenseData() {
  const systemColorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);

  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY_OBJ);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATS);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [timeTab, setTimeTab] = useState<TimeTab>("Monthly");
  const [activeScreen, setActiveScreen] = useState<string>("dashboard");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [customStartDate, setCustomStartDate] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());

  const [profile, setProfile] = useState<UserProfile>({
    firstName: "Muhammad",
    lastName: "Bilawal",
    email: "",
    phone: "",
    bio: "Mobile App Developer",
    username: "muhammadbilawal",
    avatarUrl: null,
    showAds: true,
  });

  const [ledgerNotes, setLedgerNotes] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const storedTheme = await AsyncStorage.getItem("@spendly_theme_mode");
        if (storedTheme) {
          setThemeMode(storedTheme as ThemeMode);
        } else {
          setThemeMode("light");
        }

        const storedCurrency = await AsyncStorage.getItem("@spendly_currency");
        if (storedCurrency) {
          const parsedCurr = JSON.parse(storedCurrency);
          setCurrency(parsedCurr);
        }

        const storedTransactions = await AsyncStorage.getItem(
          "@spendly_transactions",
        );
        if (storedTransactions) setTransactions(JSON.parse(storedTransactions));

        const storedAccounts = await AsyncStorage.getItem("@spendly_accounts");
        if (storedAccounts) {
          setAccounts(JSON.parse(storedAccounts));
        } else {
          const defaultAccounts: Account[] = [
            {
              id: "acc-1",
              name: "Cash",
              balance: 0,
              initialBalance: 0,
              type: "cash",
              icon: "wallet",
              color: "#3B82F6",
            },
            {
              id: "acc-2",
              name: "Bank Account",
              balance: 0,
              initialBalance: 0,
              type: "bank",
              icon: "card",
              color: "#10B981",
            },
          ];
          setAccounts(defaultAccounts);
          await AsyncStorage.setItem(
            "@spendly_accounts",
            JSON.stringify(defaultAccounts),
          );
        }

        const storedProfile = await AsyncStorage.getItem("@spendly_profile");
        if (storedProfile) setProfile(JSON.parse(storedProfile));
      } catch (e) {
        console.log("Failed to load local data", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSetThemeMode = async (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem("@spendly_theme_mode", mode);
    } catch {}
  };

  const handleSetCurrency = async (newCurr: Currency) => {
    setCurrency(newCurr);
    try {
      await AsyncStorage.setItem("@spendly_currency", JSON.stringify(newCurr));
    } catch (e) {
      console.log("Failed to save currency", e);
    }
  };

  const resolvedTheme =
    themeMode === "dark"
      ? "dark"
      : themeMode === "light"
        ? "light"
        : systemColorScheme === "dark"
          ? "dark"
          : "light";

  const toggleTheme = () => {
    const nextMode = resolvedTheme === "dark" ? "light" : "dark";
    handleSetThemeMode(nextMode);
  };

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const periodStats = {
    income: transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0),
    expense: transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0),
  };

  const periodFilteredTransactions = transactions;

  const addTransaction = async (data: Omit<Transaction, "id">) => {
    const newTx: Transaction = {
      ...data,
      id: Date.now().toString(),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    try {
      await AsyncStorage.setItem(
        "@spendly_transactions",
        JSON.stringify(updated),
      );
    } catch {}
  };

  const updateTransaction = async (
    id: string,
    updatedFields: Partial<Transaction>,
  ) => {
    const updated = transactions.map((t) =>
      t.id === id ? { ...t, ...updatedFields } : t,
    );
    setTransactions(updated);
    try {
      await AsyncStorage.setItem(
        "@spendly_transactions",
        JSON.stringify(updated),
      );
    } catch {}
  };

  const deleteTransaction = async (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    try {
      await AsyncStorage.setItem(
        "@spendly_transactions",
        JSON.stringify(updated),
      );
    } catch {}
  };

  const addOrUpdateBudget = async (budget: Budget) => {
    const existingIndex = budgets.findIndex((b) => b.id === budget.id);
    let updated: Budget[];
    if (existingIndex >= 0) {
      updated = budgets.map((b) => (b.id === budget.id ? budget : b));
    } else {
      updated = [...budgets, budget];
    }
    setBudgets(updated);
  };

  const deleteBudget = async (id: string) => {
    setBudgets(budgets.filter((b) => b.id !== id));
  };

  const addSavingsGoal = async (goal: SavingsGoal) => {
    setSavingsGoals([...savingsGoals, goal]);
  };

  const updateSavingsGoal = async (
    id: string,
    updates: Partial<SavingsGoal>,
  ) => {
    setSavingsGoals(
      savingsGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    );
  };

  const deleteSavingsGoal = async (id: string) => {
    setSavingsGoals(savingsGoals.filter((g) => g.id !== id));
  };

  const addAccount = async (account: Account) => {
    const updated = [...accounts, account];
    setAccounts(updated);
    try {
      await AsyncStorage.setItem("@spendly_accounts", JSON.stringify(updated));
    } catch {}
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    const updated = accounts.map((a) =>
      a.id === id ? { ...a, ...updates } : a,
    );
    setAccounts(updated);
    try {
      await AsyncStorage.setItem("@spendly_accounts", JSON.stringify(updated));
    } catch {}
  };

  const deleteAccount = async (id: string) => {
    const updated = accounts.filter((a) => a.id !== id);
    setAccounts(updated);
    try {
      await AsyncStorage.setItem("@spendly_accounts", JSON.stringify(updated));
    } catch {}
  };

  const addCategory = (cat: Omit<Category, "id">): Category => {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}` };
    setCategories([...categories, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const addSubcategory = (categoryId: string, sub: Omit<Subcategory, "id">) => {
    setCategories(
      categories.map((c) => {
        if (c.id === categoryId) {
          const newSub: Subcategory = { ...sub, id: `sub-${Date.now()}` };
          const subs = c.subcategories || [];
          return { ...c, subcategories: [...subs, newSub] };
        }
        return c;
      }),
    );
  };

  const deleteSubcategory = (categoryId: string, subId: string) => {
    setCategories(
      categories.map((c) => {
        if (c.id === categoryId) {
          const subs = c.subcategories || [];
          return {
            ...c,
            subcategories: subs.filter((s) => s.id !== subId),
          };
        }
        return c;
      }),
    );
  };

  const updateProfile = async (partial: Partial<UserProfile>) => {
    const updated = { ...profile, ...partial };
    setProfile(updated);
    try {
      await AsyncStorage.setItem("@spendly_profile", JSON.stringify(updated));
    } catch {}
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove([
        "@spendly_transactions",
        "@spendly_accounts",
        "@spendly_budgets",
        "@spendly_savings_goals",
        "@spendly_profile",
        "@spendly_has_onboarded",
        "@spendly_currency",
        "@spendly_user_guide_seen",
      ]);
      setTransactions([]);
      setAccounts([]);
      setBudgets([]);
      setSavingsGoals([]);
      setCurrency(DEFAULT_CURRENCY_OBJ);
    } catch {}
  };

  const getPeriodDisplayLabel = () => "This Month";

  const setCustomDateRange = useCallback((start: Date, end: Date) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
    setTimeTab("Custom");
  }, []);

  return {
    isLoading,
    totalBalance,
    periodStats,
    currency,
    setCurrency: handleSetCurrency,
    themeMode,
    setThemeMode: handleSetThemeMode,
    resolvedTheme,
    toggleTheme,
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    timeTab,
    setTimeTab,
    periodFilteredTransactions,
    transactions,
    budgets,
    savingsGoals,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addOrUpdateBudget,
    deleteBudget,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addAccount,
    updateAccount,
    deleteAccount,
    isAddModalOpen,
    setIsAddModalOpen,
    activeScreen,
    setActiveScreen,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
    getPeriodDisplayLabel,
    customStartDate,
    customEndDate,
    setCustomDateRange,
    profile,
    updateProfile,
    clearAllData,
    selectedDate,
    setSelectedDate,
    ledgerNotes,
    setLedgerNotes,
  };
}
