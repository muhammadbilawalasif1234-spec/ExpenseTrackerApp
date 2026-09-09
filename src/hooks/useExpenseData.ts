import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_BUDGETS,
  DEFAULT_CATEGORIES,
  DEFAULT_SAVINGS_GOALS,
  generateSampleTransactions,
} from '../constants/theme';
import {
  Account,
  ActiveScreen,
  Budget,
  Category,
  Currency,
  FilterOptions,
  SavingsGoal,
  TimeTab,
  Transaction,
} from '../types';
import {
  getStoredAccounts,
  getStoredBudgets,
  getStoredCategories,
  getStoredCurrency,
  getStoredSavingsGoals,
  getStoredTransactions,
  saveStoredAccounts,
  saveStoredBudgets,
  saveStoredCategories,
  saveStoredCurrency,
  saveStoredSavingsGoals,
  saveStoredTransactions,
} from '../utils/storage';

export const useExpenseData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [budgets, setBudgets] = useState<Budget[]>(DEFAULT_BUDGETS);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(DEFAULT_SAVINGS_GOALS);
  const [currency, setCurrencyState] = useState<Currency>({
    code: 'PKR',
    symbol: 'Rs. ',
    name: 'Pakistani Rupee',
    position: 'prefix',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('dashboard');
  const [timeTab, setTimeTab] = useState<TimeTab>('Monthly');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const [activeTxTab, setActiveTxTab] = useState<'All' | 'Income' | 'Expense' | 'Transfer'>('All');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    type: 'all',
    category: 'all',
    accountId: 'all',
    startDate: '',
    endDate: '',
    sortBy: 'date-desc',
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);

  // Load initial data from AsyncStorage
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [txs, cats, accs, bdgs, goals, curr] = await Promise.all([
          getStoredTransactions(),
          getStoredCategories(),
          getStoredAccounts(),
          getStoredBudgets(),
          getStoredSavingsGoals(),
          getStoredCurrency(),
        ]);
        setTransactions(txs);
        setCategories(cats);
        setAccounts(accs);
        setBudgets(bdgs);
        setSavingsGoals(goals);
        setCurrencyState(curr);
      } catch (e) {
        console.error('Failed to load initial data:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAll();
  }, []);

  // Save changes
  useEffect(() => {
    if (!isLoading) {
      saveStoredTransactions(transactions);
    }
  }, [transactions, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveStoredAccounts(accounts);
    }
  }, [accounts, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveStoredBudgets(budgets);
    }
  }, [budgets, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveStoredSavingsGoals(savingsGoals);
    }
  }, [savingsGoals, isLoading]);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    saveStoredCurrency(c);
  };

  const calculatedAccounts = useMemo(() => {
    return accounts.map((acc) => {
      let currentBal = acc.initialBalance;
      transactions.forEach((tx) => {
        if (tx.type === 'income' && tx.accountId === acc.id) {
          currentBal += tx.amount;
        } else if (tx.type === 'expense' && tx.accountId === acc.id) {
          currentBal -= tx.amount;
        } else if (tx.type === 'transfer') {
          if (tx.accountId === acc.id) {
            currentBal -= tx.amount;
          }
          if (tx.toAccountId === acc.id) {
            currentBal += tx.amount;
          }
        }
      });
      return {
        ...acc,
        balance: currentBal,
      };
    });
  }, [accounts, transactions]);

  const totalBalance = useMemo(() => {
    return calculatedAccounts.reduce((acc, a) => acc + a.balance, 0);
  }, [calculatedAccounts]);

  const periodFilteredTransactions = useMemo(() => {
    const target = new Date(selectedDate);
    const targetYear = target.getFullYear();
    const targetMonth = target.getMonth();
    const targetDateNum = target.getDate();

    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      if (timeTab === 'Daily') {
        return (
          txDate.getFullYear() === targetYear &&
          txDate.getMonth() === targetMonth &&
          txDate.getDate() === targetDateNum
        );
      }
      if (timeTab === 'Monthly') {
        return txDate.getFullYear() === targetYear && txDate.getMonth() === targetMonth;
      }
      if (timeTab === 'Yearly') {
        return txDate.getFullYear() === targetYear;
      }
      return true;
    });
  }, [transactions, timeTab, selectedDate]);

  const periodStats = useMemo(() => {
    let income = 0;
    let expense = 0;

    periodFilteredTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else if (tx.type === 'expense') {
        expense += tx.amount;
      }
    });

    const netSavings = income - expense;
    const savingsRate = income > 0 ? Math.max(0, Math.round((netSavings / income) * 100)) : 0;

    return {
      income,
      expense,
      netSavings,
      savingsRate,
    };
  }, [periodFilteredTransactions]);

  const categorySpendingData = useMemo(() => {
    const expenseTx = periodFilteredTransactions.filter((t) => t.type === 'expense');
    const categoryTotals: Record<string, { total: number; count: number }> = {};

    let totalExpenseAmount = 0;
    expenseTx.forEach((tx) => {
      totalExpenseAmount += tx.amount;
      if (!categoryTotals[tx.category]) {
        categoryTotals[tx.category] = { total: 0, count: 0 };
      }
      categoryTotals[tx.category].total += tx.amount;
      categoryTotals[tx.category].count += 1;
    });

    const items = Object.entries(categoryTotals)
      .map(([catName, data]) => {
        const matchingCat = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
        const color = matchingCat?.color || '#FF5722';
        const percentage = totalExpenseAmount > 0 ? (data.total / totalExpenseAmount) * 100 : 0;

        return {
          category: catName,
          total: data.total,
          count: data.count,
          percentage,
          color,
          icon: matchingCat?.icon || 'Tag',
        };
      })
      .sort((a, b) => b.total - a.total);

    return {
      items,
      totalExpense: totalExpenseAmount,
    };
  }, [periodFilteredTransactions, categories]);

  // Rolling 6-month cash flow trend data for Monthly Overview Chart
  const cashFlowTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonth - i);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();

      let mIncome = 0;
      let mExpense = 0;

      transactions.forEach((tx) => {
        const txD = new Date(tx.date);
        if (txD.getMonth() === mIdx && txD.getFullYear() === yr) {
          if (tx.type === 'income') mIncome += tx.amount;
          if (tx.type === 'expense') mExpense += tx.amount;
        }
      });

      result.push({
        label: months[mIdx],
        income: mIncome,
        expense: mExpense,
        net: mIncome - mExpense,
      });
    }

    return result;
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (activeTxTab !== 'All') {
      result = result.filter((t) => t.type === activeTxTab.toLowerCase());
    }

    if (selectedAccountId) {
      result = result.filter(
        (t) => t.accountId === selectedAccountId || t.toAccountId === selectedAccountId
      );
    }

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          (t.note && t.note.toLowerCase().includes(q))
      );
    }

    if (filters.category !== 'all') {
      result = result.filter((t) => t.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.accountId !== 'all') {
      result = result.filter(
        (t) => t.accountId === filters.accountId || t.toAccountId === filters.accountId
      );
    }

    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return result;
  }, [transactions, activeTxTab, selectedAccountId, filters]);

  const addTransaction = useCallback((newTx: Omit<Transaction, 'id'>) => {
    const created: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setTransactions((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateTransaction = useCallback((id: string, updatedFields: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addOrUpdateBudget = useCallback((budget: Budget) => {
    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.category.toLowerCase() === budget.category.toLowerCase());
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = budget;
        return next;
      }
      return [...prev, { ...budget, id: `b-${Date.now()}` }];
    });
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addSavingsGoal = useCallback((goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  }, []);

  const updateSavingsGoal = useCallback((id: string, update: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...update } : g)));
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const addAccount = useCallback((acc: Omit<Account, 'id' | 'balance'>) => {
    const newAcc: Account = {
      ...acc,
      id: `acc-${Date.now()}`,
      balance: acc.initialBalance,
    };
    setAccounts((prev) => [...prev, newAcc]);
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const navigatePeriod = (direction: 'prev' | 'next') => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      if (timeTab === 'Daily') {
        next.setDate(next.getDate() + (direction === 'next' ? 1 : -1));
      } else if (timeTab === 'Monthly') {
        next.setMonth(next.getMonth() + (direction === 'next' ? 1 : -1));
      } else if (timeTab === 'Yearly') {
        next.setFullYear(next.getFullYear() + (direction === 'next' ? 1 : -1));
      }
      return next;
    });
  };

  const getPeriodDisplayLabel = () => {
    if (timeTab === 'Daily') {
      return selectedDate.toLocaleDateString(undefined, {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    if (timeTab === 'Monthly') {
      return selectedDate.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      });
    }
    return selectedDate.toLocaleDateString(undefined, {
      year: 'numeric',
    });
  };

  return {
    isLoading,
    transactions,
    categories,
    accounts: calculatedAccounts,
    budgets,
    savingsGoals,
    currency,
    setCurrency,
    activeScreen,
    setActiveScreen,
    timeTab,
    setTimeTab,
    selectedDate,
    setSelectedDate,
    selectedAccountId,
    setSelectedAccountId,
    activeTxTab,
    setActiveTxTab,
    filters,
    setFilters,
    isFilterModalOpen,
    setIsFilterModalOpen,
    isAddModalOpen,
    setIsAddModalOpen,
    editingTransaction,
    setEditingTransaction,
    isGoalModalOpen,
    setIsGoalModalOpen,
    isAccountModalOpen,
    setIsAccountModalOpen,
    isBudgetModalOpen,
    setIsBudgetModalOpen,
    totalBalance,
    periodFilteredTransactions,
    periodStats,
    categorySpendingData,
    cashFlowTrendData,
    filteredTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addOrUpdateBudget,
    deleteBudget,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addAccount,
    deleteAccount,
    navigatePeriod,
    getPeriodDisplayLabel,
  };
};
