import {
  ArrowDown,
  ArrowUp,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  MoreVertical,
  Plus,
  Search,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Account, Category, Currency, Transaction } from "../types";
import { getCategoryColor } from "../utils/categoryColors";
import { formatCurrency, formatNumberWithCommas } from "../utils/formatters";
import { CategoryIconView } from "./CategoryIconView";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { SwipeableItem } from "./SwipeableItem";
import { TopBarCalendarModal } from "./TopBarCalendarModal";

interface LedgerScreenProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  currency: Currency;
  onAddTransaction: () => void;
  onPressTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  isLight?: boolean;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  onNavigateAccounts?: () => void;
  onNavigateBudgets?: () => void;
  notes?: LedgerNote[];
  onSaveNotes?: (notes: LedgerNote[]) => void;
}

type PeriodFilter = "Daily" | "Monthly" | "Total" | "Calendar" | "Note";

export interface LedgerNote {
  id: string;
  question: string;
  answer: string;
  date: string;
}

export type BudgetPeriod = "Weekly" | "Monthly" | "Annually";

export interface CategoryBudgetConfig {
  category: string;
  period: BudgetPeriod;
  limit: number;
  startDay?: number;
  month?: string;
}

export const LedgerScreen: React.FC<LedgerScreenProps> = ({
  transactions,
  accounts,
  categories,
  currency,
  onAddTransaction,
  onPressTransaction,
  onDeleteTransaction,
  isLight = true,
  selectedDate,
  onSelectDate,
  onNavigateAccounts,
  onNavigateBudgets,
  notes: propNotes,
  onSaveNotes,
}) => {
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [isChooseCategoryOpen, setIsChooseCategoryOpen] = useState(false);
  const [isChoosePeriodOpen, setIsChoosePeriodOpen] = useState(false);
  const [isBudgetCalendarOpen, setIsBudgetCalendarOpen] = useState(false);
  const [selectedBudgetCategory, setSelectedBudgetCategory] =
    useState<string>("Food");
  const [selectedBudgetPeriod, setSelectedBudgetPeriod] =
    useState<BudgetPeriod>("Weekly");
  const [selectedBudgetCalendarDay, setSelectedBudgetCalendarDay] =
    useState<number>(6);
  const [budgetCalendarMonth, setBudgetCalendarMonth] =
    useState<string>("September");
  const [budgetCalendarYear, setBudgetCalendarYear] = useState<number>(2026);

  const budgetMonthIndex = React.useMemo(() => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const idx = months.findIndex(
      (m) => m.toLowerCase() === (budgetCalendarMonth || "").toLowerCase(),
    );
    return idx >= 0 ? idx : 8;
  }, [budgetCalendarMonth]);

  const budgetDaysInMonth = React.useMemo(() => {
    return new Date(budgetCalendarYear, budgetMonthIndex + 1, 0).getDate();
  }, [budgetCalendarYear, budgetMonthIndex]);

  const budgetFirstDayOffset = React.useMemo(() => {
    return new Date(budgetCalendarYear, budgetMonthIndex, 1).getDay();
  }, [budgetCalendarYear, budgetMonthIndex]);

  const budgetCalendarWeeks = React.useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < budgetFirstDayOffset; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= budgetDaysInMonth; d++) {
      cells.push(d);
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [budgetFirstDayOffset, budgetDaysInMonth]);

  const handleBudgetPrevMonth = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    if (budgetMonthIndex === 0) {
      setBudgetCalendarYear((y) => y - 1);
      setBudgetCalendarMonth(months[11]);
    } else {
      setBudgetCalendarMonth(months[budgetMonthIndex - 1]);
    }
  };

  const handleBudgetNextMonth = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    if (budgetMonthIndex === 11) {
      setBudgetCalendarYear((y) => y + 1);
      setBudgetCalendarMonth(months[0]);
    } else {
      setBudgetCalendarMonth(months[budgetMonthIndex + 1]);
    }
  };
  const [isEditingBudgetAmount, setIsEditingBudgetAmount] = useState(false);
  const [budgetLimit, setBudgetLimit] = useState(25000);
  const [inputBudgetVal, setInputBudgetVal] = useState("25000");

  const [categoryBudgets, setCategoryBudgets] = useState<
    Record<string, CategoryBudgetConfig>
  >({});

  const effectiveTotalBudget = React.useMemo(() => {
    const configs = Object.values(categoryBudgets);
    if (configs.length > 0) {
      return configs.reduce((sum, item) => sum + (item.limit || 0), 0);
    }
    return budgetLimit;
  }, [categoryBudgets, budgetLimit]);

  const formatMonthYear = (date: any) => {
    const d = date instanceof Date ? date : new Date(date);
    if (!d || isNaN(d.getTime())) {
      const now = new Date();
      return `Jan ${now.getFullYear()}`;
    }
    const monthsShort = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthsShort[d.getMonth()]} ${d.getFullYear()}`;
  };

  const parseSelectedMonth = (monthStr: string) => {
    if (!monthStr) {
      const now = new Date();
      return { month: now.getMonth(), year: now.getFullYear() };
    }
    const parts = monthStr.trim().split(/\s+/);
    const mName = (parts[0] || "").replace(/[^a-zA-Z]/g, "").toLowerCase();
    const year = parseInt(parts[1] || "", 10);
    const monthMap: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11,
    };
    return {
      month:
        monthMap[mName] !== undefined ? monthMap[mName] : new Date().getMonth(),
      year: isNaN(year) ? new Date().getFullYear() : year,
    };
  };

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = selectedDate
      ? selectedDate instanceof Date
        ? selectedDate
        : new Date(selectedDate)
      : new Date();
    const validD = isNaN(d.getTime()) ? new Date() : d;
    return formatMonthYear(validD);
  });

  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(
    () => {
      const d = selectedDate
        ? selectedDate instanceof Date
          ? selectedDate
          : new Date(selectedDate)
        : new Date();
      const validD = isNaN(d.getTime()) ? new Date() : d;
      return validD.getDate();
    },
  );

  const handlePrevMonth = () => {
    const { month, year } = parseSelectedMonth(selectedMonth);
    const prevDate = new Date(year, month - 1, 1);
    const newMonthStr = formatMonthYear(prevDate);
    setSelectedMonth(newMonthStr);
    const maxDaysInNewMonth = new Date(year, month, 0).getDate();
    if (selectedCalendarDay !== null) {
      const clampedDay = Math.min(selectedCalendarDay, maxDaysInNewMonth);
      setSelectedCalendarDay(clampedDay);
      if (onSelectDate) {
        onSelectDate(
          new Date(prevDate.getFullYear(), prevDate.getMonth(), clampedDay),
        );
      }
    } else if (onSelectDate) {
      onSelectDate(prevDate);
    }
  };

  const handleNextMonth = () => {
    const { month, year } = parseSelectedMonth(selectedMonth);
    const nextDate = new Date(year, month + 1, 1);
    const newMonthStr = formatMonthYear(nextDate);
    setSelectedMonth(newMonthStr);
    const maxDaysInNewMonth = new Date(
      nextDate.getFullYear(),
      nextDate.getMonth() + 1,
      0,
    ).getDate();
    if (selectedCalendarDay !== null) {
      const clampedDay = Math.min(selectedCalendarDay, maxDaysInNewMonth);
      setSelectedCalendarDay(clampedDay);
      if (onSelectDate) {
        onSelectDate(
          new Date(nextDate.getFullYear(), nextDate.getMonth(), clampedDay),
        );
      }
    } else if (onSelectDate) {
      onSelectDate(nextDate);
    }
  };

  React.useEffect(() => {
    if (selectedDate) {
      const d =
        selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
      if (!isNaN(d.getTime())) {
        setSelectedMonth(formatMonthYear(d));
        setSelectedCalendarDay(d.getDate());
      }
    }
  }, [selectedDate]);

  const [selectedFilter, setSelectedFilter] = useState<PeriodFilter>("Daily");
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [internalNotes, setInternalNotes] = useState<LedgerNote[]>(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = window.localStorage.getItem("spendly_ledger_notes");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed.filter((n: LedgerNote) => n.id !== "note-default-1");
          }
        }
      }
    } catch (e) {}
    return [];
  });

  const notes = propNotes !== undefined ? propNotes : internalNotes;

  const [noteToDelete, setNoteToDelete] = useState<LedgerNote | null>(null);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<LedgerNote | null>(null);
  const [inputQuestion, setInputQuestion] = useState("");
  const [inputAnswer, setInputAnswer] = useState("");

  const saveNotes = (updatedNotes: LedgerNote[]) => {
    if (onSaveNotes) {
      onSaveNotes(updatedNotes);
    } else {
      setInternalNotes(updatedNotes);
    }
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(
          "spendly_ledger_notes",
          JSON.stringify(updatedNotes),
        );
      }
    } catch (e) {}
  };

  const handleAddNoteClick = () => {
    setEditingNote(null);
    setInputQuestion("");
    setInputAnswer("");
    setIsNoteEditorOpen(true);
  };

  const handleEditNoteClick = (note: LedgerNote) => {
    setEditingNote(note);
    setInputQuestion(note.question);
    setInputAnswer(note.answer);
    setIsNoteEditorOpen(true);
  };

  const handleDeleteNoteClick = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    saveNotes(updated);
  };

  const handleSaveNote = () => {
    if (!inputQuestion.trim() && !inputAnswer.trim()) {
      setIsNoteEditorOpen(false);
      setEditingNote(null);
      return;
    }

    const q = inputQuestion.trim() || "How to save money this month?";
    const a = inputAnswer.trim() || "Spend less in food and shopping";
    const now = new Date();
    const monthsShort = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    const formattedDate = `${now.getDate()} ${monthsShort[now.getMonth()]} ${now.getFullYear()}`;

    if (editingNote) {
      const updated = notes.map((n) =>
        n.id === editingNote.id
          ? { ...n, question: q, answer: a, date: formattedDate }
          : n,
      );
      saveNotes(updated);
    } else {
      const newNote: LedgerNote = {
        id: Date.now().toString(),
        question: q,
        answer: a,
        date: formattedDate,
      };
      saveNotes([newNote, ...notes]);
    }
    setIsNoteEditorOpen(false);
    setEditingNote(null);
    setInputQuestion("");
    setInputAnswer("");
  };

  const { month: parsedMonth, year: parsedYear } =
    parseSelectedMonth(selectedMonth);

  const getDaysInSelectedMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayIndexInSelectedMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const totalDays = getDaysInSelectedMonth(parsedYear, parsedMonth);
  const firstDayIndex = getFirstDayIndexInSelectedMonth(
    parsedYear,
    parsedMonth,
  );

  const months = React.useMemo(() => {
    const list: string[] = [];
    const baseYear = parsedYear || 2026;
    for (let yr = baseYear - 1; yr <= baseYear + 1; yr++) {
      [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ].forEach((m) => {
        list.push(`${m} ${yr}`);
      });
    }
    return list;
  }, [parsedYear]);

  const filteredByMonthTransactions = React.useMemo(() => {
    return (transactions || []).filter((tx) => {
      if (!tx || !tx.date) return false;
      const txDate = new Date(tx.date);
      if (isNaN(txDate.getTime())) return false;
      return (
        txDate.getMonth() === parsedMonth && txDate.getFullYear() === parsedYear
      );
    });
  }, [transactions, parsedMonth, parsedYear]);

  const hasRealTx = filteredByMonthTransactions.length > 0;

  const realGroups = React.useMemo(() => {
    const groupedTransactions = filteredByMonthTransactions.reduce(
      (groups: Record<string, any>, tx) => {
        const txDate = new Date(tx.date);
        const dateStr = txDate.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        if (!groups[dateStr]) {
          groups[dateStr] = {
            dateHeader: dateStr,
            dayNum: txDate.getDate(),
            items: [],
          };
        }

        const accountName =
          (accounts || []).find((a) => a && a.id === tx.accountId)?.name ||
          "Account";
        const subLabel = tx.subcategory
          ? tx.note
            ? `${tx.subcategory} • ${tx.note}`
            : tx.subcategory
          : accountName || tx.note || "Account";

        groups[dateStr].items.push({
          id: tx.id,
          category: tx.category,
          subcategory: tx.subcategory,
          account: subLabel,
          amount: tx.type === "expense" ? -tx.amount : tx.amount,
          type: tx.type,
          categoryColor: (tx as any).categoryColor,
          categoryIcon: (tx as any).categoryIcon,
          iconType: tx.category?.toLowerCase().includes("salary")
            ? "salary"
            : tx.category?.toLowerCase().includes("shopping")
              ? "shopping"
              : tx.category?.toLowerCase().includes("vacation")
                ? "vacation"
                : "other",
          dateDisplay: txDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          rawDate: txDate.getTime(),
        });

        return groups;
      },
      {},
    );

    return Object.values(groupedTransactions).sort((a: any, b: any) => {
      return (b.items[0]?.rawDate || 0) - (a.items[0]?.rawDate || 0);
    });
  }, [filteredByMonthTransactions, accounts]);

  const displayGroups = realGroups;

  const searchedGroups = React.useMemo(() => {
    if (!searchQuery.trim()) return displayGroups;
    const q = searchQuery.toLowerCase().trim();
    return displayGroups
      .map((group: any) => {
        const filteredItems = group.items.filter((item: any) => {
          const catMatch = item.category?.toLowerCase().includes(q);
          const accMatch = item.account?.toLowerCase().includes(q);
          const amtMatch = item.amount.toString().includes(q);
          return catMatch || accMatch || amtMatch;
        });
        return {
          ...group,
          items: filteredItems,
        };
      })
      .filter((group: any) => group.items.length > 0);
  }, [displayGroups, searchQuery]);

  const currentPeriodGroups = React.useMemo(() => {
    if (selectedFilter === "Daily" || selectedFilter === "Calendar") {
      if (selectedCalendarDay !== null) {
        return searchedGroups.filter(
          (g: any) => g.dayNum === selectedCalendarDay,
        );
      }
    }
    return searchedGroups;
  }, [searchedGroups, selectedFilter, selectedCalendarDay]);

  const { displayIncome, displayExpense, displayNet } = React.useMemo(() => {
    let inc = 0;
    let exp = 0;

    currentPeriodGroups.forEach((group: any) => {
      group.items.forEach((item: any) => {
        if (item.type === "income") {
          inc += Math.abs(item.amount);
        } else {
          exp += Math.abs(item.amount);
        }
      });
    });

    return {
      displayIncome: inc,
      displayExpense: exp,
      displayNet: inc - exp,
    };
  }, [currentPeriodGroups]);

  const today = new Date();
  const weekRanges = React.useMemo(() => {
    const weekTitles = [
      "First Week",
      "Second Week",
      "Third Week",
      "Fourth Week",
      "Fifth Week",
      "Sixth Week",
    ];
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const ranges: { title: string; start: number; end: number }[] = [];
    let start = 1;
    let end = Math.min(totalDays, 7 - firstDayIndex);

    while (start <= totalDays) {
      const weekStart = new Date(parsedYear, parsedMonth, start);
      if (start === 1) weekStart.setDate(weekStart.getDate() - firstDayIndex);
      if (weekStart > todayStart) break;

      ranges.push({
        title: weekTitles[ranges.length] || `Week ${ranges.length + 1}`,
        start,
        end,
      });
      start = end + 1;
      end = Math.min(totalDays, start + 6);
    }

    const isCurrentMonth =
      parsedMonth === today.getMonth() && parsedYear === today.getFullYear();
    return isCurrentMonth ? ranges.slice(-2) : ranges;
  }, [
    firstDayIndex,
    parsedMonth,
    parsedYear,
    totalDays,
    today.getDate(),
    today.getMonth(),
    today.getFullYear(),
  ]);

  const weeklyBreakdowns = React.useMemo(() => {
    const allSearchedItems: {
      dayNum: number;
      type: "income" | "expense";
      amount: number;
    }[] = [];
    searchedGroups.forEach((group: any) => {
      group.items.forEach((item: any) => {
        allSearchedItems.push({
          dayNum: group.dayNum,
          type: item.type,
          amount: Math.abs(item.amount),
        });
      });
    });

    return weekRanges.map((w, idx) => {
      const isCurrentMonth =
        parsedMonth === today.getMonth() && parsedYear === today.getFullYear();
      const itemsInWeek = allSearchedItems.filter(
        (item) =>
          item.dayNum >= w.start &&
          item.dayNum <= w.end &&
          (!isCurrentMonth || item.dayNum <= today.getDate()),
      );
      const income = itemsInWeek
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = itemsInWeek
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      const netAmount = income - expense;

      return {
        id: `week-${idx + 1}`,
        title: w.title,
        dateRange: `${w.start} – ${w.end}  ${selectedMonth}`,
        netAmount,
        income,
        expense,
      };
    });
  }, [
    searchedGroups,
    weekRanges,
    selectedMonth,
    parsedMonth,
    parsedYear,
    today.getDate(),
    today.getMonth(),
    today.getFullYear(),
  ]);

  const categorySpendingBreakdown = React.useMemo(() => {
    const expenseTx = (filteredByMonthTransactions || []).filter(
      (tx) => tx && tx.type === "expense",
    );
    const totalExpense = expenseTx.reduce((sum, tx) => sum + tx.amount, 0);

    const map: Record<
      string,
      {
        total: number;
        count: number;
        category: string;
        color?: string;
        icon?: string;
      }
    > = {};
    expenseTx.forEach((tx) => {
      const cat = tx.category || "Other";
      if (!map[cat]) {
        map[cat] = {
          total: 0,
          count: 0,
          category: cat,
          color: (tx as any).categoryColor,
          icon: (tx as any).categoryIcon,
        };
      }
      map[cat].total += tx.amount;
      map[cat].count += 1;
      if (!(tx as any).categoryColor && map[cat].color) {
        // preserve
      } else if ((tx as any).categoryColor) {
        map[cat].color = (tx as any).categoryColor;
      }
      if ((tx as any).categoryIcon) {
        map[cat].icon = (tx as any).categoryIcon;
      }
    });

    const items = Object.values(map).map((item, idx) => {
      const matchedCat = (categories || []).find(
        (c) =>
          c && c.name && c.name.toLowerCase() === item.category.toLowerCase(),
      );
      const percent = totalExpense > 0 ? (item.total / totalExpense) * 100 : 0;
      const catColor =
        item.color || matchedCat?.color || getCategoryColor(item.category);

      return {
        id: `cat-exp-${matchedCat?.id || idx}`,
        title: item.category,
        color: catColor,
        icon: item.icon || matchedCat?.icon,
        amount: item.total,
        formattedAmount: formatNumberWithCommas(item.total, 2),
        percentage: `%${Math.round(percent)}`,
        percentageValue: percent,
        count: item.count,
        spentText: `${item.count} ${item.count === 1 ? "transaction" : "transactions"}`,
        shareText: `${percent.toFixed(1)}% of total expenses`,
      };
    });

    return items.sort((a, b) => b.amount - a.amount);
  }, [filteredByMonthTransactions, categories]);

  const categoryIncomeBreakdown = React.useMemo(() => {
    const incomeTx = (filteredByMonthTransactions || []).filter(
      (tx) => tx && tx.type === "income",
    );
    const totalIncome = incomeTx.reduce((sum, tx) => sum + tx.amount, 0);

    const map: Record<
      string,
      {
        total: number;
        count: number;
        category: string;
        color?: string;
        icon?: string;
      }
    > = {};
    incomeTx.forEach((tx) => {
      const cat = tx.category || "Income";
      if (!map[cat]) {
        map[cat] = {
          total: 0,
          count: 0,
          category: cat,
          color: (tx as any).categoryColor,
          icon: (tx as any).categoryIcon,
        };
      }
      map[cat].total += tx.amount;
      map[cat].count += 1;
      if ((tx as any).categoryColor) {
        map[cat].color = (tx as any).categoryColor;
      }
      if ((tx as any).categoryIcon) {
        map[cat].icon = (tx as any).categoryIcon;
      }
    });

    const items = Object.values(map).map((item, idx) => {
      const matchedCat = (categories || []).find(
        (c) =>
          c && c.name && c.name.toLowerCase() === item.category.toLowerCase(),
      );
      const percent = totalIncome > 0 ? (item.total / totalIncome) * 100 : 0;
      const catColor =
        item.color || matchedCat?.color || getCategoryColor(item.category);

      return {
        id: `cat-inc-${matchedCat?.id || idx}`,
        title: item.category,
        color: catColor,
        icon: item.icon || matchedCat?.icon,
        amount: item.total,
        formattedAmount: formatNumberWithCommas(item.total, 2),
        percentage: `%${Math.round(percent)}`,
        percentageValue: percent,
        count: item.count,
        spentText: `${item.count} ${item.count === 1 ? "transaction" : "transactions"}`,
        shareText: `${percent.toFixed(1)}% of total income`,
      };
    });

    return items.sort((a, b) => b.amount - a.amount);
  }, [filteredByMonthTransactions, categories]);

  const totalExpenseAmount = React.useMemo(() => {
    return (filteredByMonthTransactions || [])
      .filter((tx) => tx && tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredByMonthTransactions]);

  const totalIncomeAmount = React.useMemo(() => {
    return (filteredByMonthTransactions || [])
      .filter((tx) => tx && tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredByMonthTransactions]);

  const totalNetAmount = totalIncomeAmount - totalExpenseAmount;

  const searchedSpendingCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return categorySpendingBreakdown;
    const q = searchQuery.toLowerCase().trim();
    return categorySpendingBreakdown.filter((cat) => {
      return (
        cat.title.toLowerCase().includes(q) ||
        cat.spentText.toLowerCase().includes(q)
      );
    });
  }, [categorySpendingBreakdown, searchQuery]);

  const searchedIncomeCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return categoryIncomeBreakdown;
    const q = searchQuery.toLowerCase().trim();
    return categoryIncomeBreakdown.filter((cat) => {
      return (
        cat.title.toLowerCase().includes(q) ||
        cat.spentText.toLowerCase().includes(q)
      );
    });
  }, [categoryIncomeBreakdown, searchQuery]);

  const allTimeExpenseAmount = React.useMemo(() => {
    return (transactions || [])
      .filter((tx) => tx && tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const allTimeIncomeAmount = React.useMemo(() => {
    return (transactions || [])
      .filter((tx) => tx && tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const allTimeNetAmount = allTimeIncomeAmount - allTimeExpenseAmount;

  const allTimeCategorySpendingBreakdown = React.useMemo(() => {
    const expenseTx = (transactions || []).filter(
      (tx) => tx && tx.type === "expense",
    );
    const totalExpense = expenseTx.reduce((sum, tx) => sum + tx.amount, 0);

    const map: Record<
      string,
      {
        total: number;
        count: number;
        category: string;
        color?: string;
        icon?: string;
      }
    > = {};
    expenseTx.forEach((tx) => {
      const cat = tx.category || "Other";
      if (!map[cat]) {
        map[cat] = {
          total: 0,
          count: 0,
          category: cat,
          color: (tx as any).categoryColor,
          icon: (tx as any).categoryIcon,
        };
      }
      map[cat].total += tx.amount;
      map[cat].count += 1;
      if ((tx as any).categoryColor) {
        map[cat].color = (tx as any).categoryColor;
      }
      if ((tx as any).categoryIcon) {
        map[cat].icon = (tx as any).categoryIcon;
      }
    });

    return Object.values(map)
      .map((item, idx) => {
        const matchedCat = (categories || []).find(
          (c) =>
            c && c.name && c.name.toLowerCase() === item.category.toLowerCase(),
        );
        const percent =
          totalExpense > 0 ? (item.total / totalExpense) * 100 : 0;
        const catColor =
          item.color || matchedCat?.color || getCategoryColor(item.category);

        return {
          id: `all-cat-exp-${matchedCat?.id || idx}`,
          title: item.category,
          color: catColor,
          icon: item.icon || matchedCat?.icon,
          amount: item.total,
          formattedAmount: formatNumberWithCommas(item.total, 2),
          percentage: `%${Math.round(percent)}`,
          percentageValue: percent,
          count: item.count,
          spentText: `${item.count} ${item.count === 1 ? "transaction" : "transactions"}`,
          shareText: `${percent.toFixed(1)}% of total expenses`,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  const allTimeCategoryIncomeBreakdown = React.useMemo(() => {
    const incomeTx = (transactions || []).filter(
      (tx) => tx && tx.type === "income",
    );
    const totalIncome = incomeTx.reduce((sum, tx) => sum + tx.amount, 0);

    const map: Record<
      string,
      {
        total: number;
        count: number;
        category: string;
        color?: string;
        icon?: string;
      }
    > = {};
    incomeTx.forEach((tx) => {
      const cat = tx.category || "Income";
      if (!map[cat]) {
        map[cat] = {
          total: 0,
          count: 0,
          category: cat,
          color: (tx as any).categoryColor,
          icon: (tx as any).categoryIcon,
        };
      }
      map[cat].total += tx.amount;
      map[cat].count += 1;
      if ((tx as any).categoryColor) {
        map[cat].color = (tx as any).categoryColor;
      }
      if ((tx as any).categoryIcon) {
        map[cat].icon = (tx as any).categoryIcon;
      }
    });

    return Object.values(map)
      .map((item, idx) => {
        const matchedCat = (categories || []).find(
          (c) =>
            c && c.name && c.name.toLowerCase() === item.category.toLowerCase(),
        );
        const percent = totalIncome > 0 ? (item.total / totalIncome) * 100 : 0;
        const catColor =
          item.color || matchedCat?.color || getCategoryColor(item.category);

        return {
          id: `all-cat-inc-${matchedCat?.id || idx}`,
          title: item.category,
          color: catColor,
          icon: item.icon || matchedCat?.icon,
          amount: item.total,
          formattedAmount: formatNumberWithCommas(item.total, 2),
          percentage: `%${Math.round(percent)}`,
          percentageValue: percent,
          count: item.count,
          spentText: `${item.count} ${item.count === 1 ? "transaction" : "transactions"}`,
          shareText: `${percent.toFixed(1)}% of total income`,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  const searchedAllTimeSpendingCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return allTimeCategorySpendingBreakdown;
    const q = searchQuery.toLowerCase().trim();
    return allTimeCategorySpendingBreakdown.filter((cat) => {
      return (
        cat.title.toLowerCase().includes(q) ||
        cat.spentText.toLowerCase().includes(q)
      );
    });
  }, [allTimeCategorySpendingBreakdown, searchQuery]);

  const searchedAllTimeIncomeCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return allTimeCategoryIncomeBreakdown;
    const q = searchQuery.toLowerCase().trim();
    return allTimeCategoryIncomeBreakdown.filter((cat) => {
      return (
        cat.title.toLowerCase().includes(q) ||
        cat.spentText.toLowerCase().includes(q)
      );
    });
  }, [allTimeCategoryIncomeBreakdown, searchQuery]);

  const searchedNotes = React.useMemo(() => {
    if (!searchQuery.trim()) return notes || [];
    const q = searchQuery.toLowerCase().trim();
    return (notes || []).filter((note) => {
      if (!note) return false;
      return (
        (note.question || "").toLowerCase().includes(q) ||
        (note.answer || "").toLowerCase().includes(q)
      );
    });
  }, [notes, searchQuery]);

  const handleCategoryCardClick = (
    catTitle: string,
    type: "expense" | "income",
    amount: number,
  ) => {
    const matched =
      (transactions || []).find(
        (t) =>
          t &&
          t.category &&
          t.category.toLowerCase() === catTitle.toLowerCase() &&
          t.type === type,
      ) ||
      (transactions || []).find(
        (t) =>
          t &&
          t.category &&
          t.category.toLowerCase() === catTitle.toLowerCase(),
      );

    if (matched) {
      onPressTransaction?.(matched);
    } else {
      const defaultAccount = (accounts || [])[0]?.id || "";
      const fallbackTx: Transaction = {
        id: `tx-cat-${Date.now()}`,
        amount: amount,
        type: type,
        category: catTitle,
        accountId: defaultAccount,
        date: new Date().toISOString(),
        note: "",
      };
      onPressTransaction?.(fallbackTx);
    }
  };

  const calendarDays = Array.from({ length: totalDays }, (_, i) => i + 1);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const containerBg = isLight ? "#FFFFFF" : "#0D1117";
  const textColor = isLight ? "#0F2C4C" : "#FFFFFF";
  const subTextColor = isLight ? "#64748B" : "#94A3B8";
  const borderCol = isLight ? "#E2E8F0" : "#30363D";
  const cardBg = isLight ? "#FFFFFF" : "#161B22";
  const selectBg = isLight ? "#F0F4FA" : "#161B22";
  const inactivePillBg = isLight ? "#FFFFFF" : "#161B22";
  const inactivePillBorder = isLight ? "#E2E8F0" : "#30363D";
  const inactivePillText = isLight ? "#1E293B" : "#94A3B8";

  const dailyTotalItems = React.useMemo(() => {
    return currentPeriodGroups.reduce(
      (sum: number, g: any) => sum + (g.items ? g.items.length : 0),
      0,
    );
  }, [currentPeriodGroups]);

  const monthlyTotalItems = hasRealTx ? weeklyBreakdowns.length : 0;
  const totalTabItems =
    !transactions || transactions.length === 0 ? 0 : transactions.length;

  const shouldScrollLedger = React.useMemo(() => {
    if (selectedFilter === "Calendar") {
      return false;
    }
    if (selectedFilter === "Daily") {
      return dailyTotalItems > 2;
    }
    if (selectedFilter === "Monthly") {
      return hasRealTx && weeklyBreakdowns.length > 1;
    }
    if (selectedFilter === "Total") {
      return (
        totalTabItems > 0 ||
        searchedAllTimeSpendingCategories.length > 0 ||
        searchedAllTimeIncomeCategories.length > 0
      );
    }
    if (selectedFilter === "Note") {
      if (isNoteEditorOpen) return true;
      return notes.length > 0;
    }
    return true;
  }, [
    selectedFilter,
    dailyTotalItems,
    hasRealTx,
    weeklyBreakdowns.length,
    totalTabItems,
    searchedAllTimeSpendingCategories.length,
    searchedAllTimeIncomeCategories.length,
    isNoteEditorOpen,
    notes.length,
  ]);

  return (
    <View style={[styles.screenContainer, { backgroundColor: containerBg }]}>
      {isSearchActive && (
        <Pressable
          style={[StyleSheet.absoluteFill, { zIndex: 90 }]}
          onPress={() => {
            setIsSearchActive(false);
            setSearchQuery("");
            Keyboard.dismiss();
          }}
        />
      )}

      {/* FIXED TOP HEADER & TABS CONTAINER */}
      <View
        style={{
          width: "100%",
          backgroundColor: containerBg,
          paddingHorizontal: 0,
          paddingTop: 0,
          zIndex: 100,
        }}
      >
        <View
          style={[
            styles.headerRow,
            {
              borderBottomColor: isLight ? "#E2E8F0" : "#30363D",
              backgroundColor: containerBg,
            },
          ]}
        >
          <View style={{ height: 38, justifyContent: "center", paddingTop: 8 }}>
            <Text style={[styles.headerTitle, { color: textColor }]}>
              Ledger
            </Text>
          </View>

          <View style={styles.headerActions}>
            {(selectedFilter === "Daily" || selectedFilter === "Total") && (
              <Pressable
                style={[
                  styles.circleActionButton,
                  { backgroundColor: isLight ? "#EAEFF5" : "#21262D" },
                ]}
                onPress={() => setIsMonthPickerOpen(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Select Month"
              >
                <CalendarIcon
                  size={18}
                  color={isLight ? "#012E4F" : "#FFFFFF"}
                  strokeWidth={2.4}
                />
              </Pressable>
            )}

            <Pressable
              style={[
                styles.circleActionButton,
                { backgroundColor: isLight ? "#EAEFF5" : "#21262D" },
              ]}
              onPress={() => {
                if (isSearchActive) {
                  setIsSearchActive(false);
                  setSearchQuery("");
                  Keyboard.dismiss();
                } else {
                  setIsSearchActive(true);
                }
              }}
              accessibilityLabel={isSearchActive ? "Close Search" : "Search"}
            >
              {isSearchActive ? (
                <X
                  size={18}
                  color={isLight ? "#012E4F" : "#FFFFFF"}
                  strokeWidth={2.4}
                />
              ) : (
                <Search
                  size={18}
                  color={isLight ? "#012E4F" : "#FFFFFF"}
                  strokeWidth={2}
                />
              )}
            </Pressable>

            <Pressable
              style={[
                styles.circleActionButton,
                { backgroundColor: "#5D7D95" },
              ]}
              onPress={onAddTransaction}
              accessibilityLabel="Add Entry"
            >
              <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>

        {isSearchActive && (
          <View
            style={{
              width: "100%",
              paddingHorizontal: 16,
              alignItems: "center",
            }}
          >
            <View style={[styles.searchBar, { backgroundColor: selectBg }]}>
              <Search size={14} color={subTextColor} />
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="Search ledger entries..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <X size={14} color="#94A3B8" />
                </Pressable>
              )}
            </View>
          </View>
        )}

        <View
          style={{ width: "100%", paddingHorizontal: 16, alignItems: "center" }}
        >
          <View style={styles.periodFilterWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.periodFilterScroll}
              style={styles.periodFilterScrollView}
            >
              {(
                [
                  "Daily",
                  "Monthly",
                  "Total",
                  "Calendar",
                  "Note",
                ] as PeriodFilter[]
              ).map((tab) => {
                const isSelected = selectedFilter === tab;
                return (
                  <Pressable
                    key={tab}
                    style={[
                      styles.filterPill,
                      isSelected
                        ? [
                            styles.filterPillActive,
                            { backgroundColor: "#5D7D95" },
                          ]
                        : [
                            styles.filterPillInactive,
                            {
                              backgroundColor: inactivePillBg,
                              borderColor: inactivePillBorder,
                            },
                          ],
                    ]}
                    onPress={() => {
                      setSelectedFilter(tab);
                      if (tab !== "Daily") {
                        setIsMonthPickerOpen(false);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        isSelected
                          ? styles.filterPillTextActive
                          : [
                              styles.filterPillTextInactive,
                              { color: inactivePillText },
                            ],
                      ]}
                    >
                      {tab}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* SCROLLABLE DATA AREA */}
      <ScrollView
        style={[
          styles.scrollView,
          !shouldScrollLedger && { overflow: "hidden" },
        ]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 0, paddingBottom: 16 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={shouldScrollLedger}
        bounces={false}
        overScrollMode="never"
        onTouchStart={() => {
          if (isSearchActive) {
            setIsSearchActive(false);
            setSearchQuery("");
            Keyboard.dismiss();
          }
        }}
        onScrollBeginDrag={() => {
          if (isSearchActive) {
            setIsSearchActive(false);
            setSearchQuery("");
            Keyboard.dismiss();
          }
        }}
      >
        {selectedFilter !== "Total" &&
          selectedFilter !== "Note" &&
          selectedFilter !== "Calendar" && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryTopFrame}>
                <Text style={styles.summaryLabel}>NET THIS PERIOD</Text>
                <Text
                  style={styles.summaryAmount}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  {formatCurrency(displayNet, currency)}
                </Text>
              </View>

              <View
                style={{
                  width: "100%",
                  height: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.45)",
                }}
              />

              <View style={styles.summaryFooter}>
                <View style={styles.summaryStatItem}>
                  <View style={styles.arrowIconWrap}>
                    <ArrowDown size={24} color="#00BA5E" strokeWidth={2.8} />
                  </View>
                  <View style={styles.statTextWrap}>
                    <Text style={styles.statLabel}>Income</Text>
                    <Text
                      style={styles.statValue}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                    >
                      {formatCurrency(displayIncome, currency)}
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryStatItem}>
                  <View style={styles.arrowIconWrap}>
                    <ArrowUp size={24} color="#D85A5A" strokeWidth={2.8} />
                  </View>
                  <View style={styles.statTextWrap}>
                    <Text style={styles.statLabel}>Expense</Text>
                    <Text
                      style={styles.statValue}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                    >
                      {formatCurrency(displayExpense, currency)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

        {selectedFilter === "Calendar" && (
          <View
            style={[
              styles.calendarCardExpanded,
              {
                backgroundColor: cardBg,
                borderColor: isLight ? "#012E4F" : "#30363D",
              },
            ]}
          >
            <View
              style={[
                styles.calendarHeader,
                { borderBottomColor: isLight ? "#012E4F" : "#30363D" },
              ]}
            >
              <Pressable
                style={styles.calendarNavBtn}
                onPress={handlePrevMonth}
                accessibilityLabel="Previous month"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ChevronLeft
                  size={20}
                  color={isLight ? "#012E4F" : "#FFFFFF"}
                  strokeWidth={2.4}
                />
              </Pressable>

              <Text
                style={[
                  styles.calendarTitle,
                  {
                    color: isLight ? "#012E4F" : "#FFFFFF",
                    textAlign: "center",
                  },
                ]}
              >
                {`${
                  [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ][parsedMonth]
                } ${parsedYear}`}
              </Text>

              <Pressable
                style={styles.calendarNavBtn}
                onPress={handleNextMonth}
                accessibilityLabel="Next month"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ChevronRight
                  size={20}
                  color={isLight ? "#012E4F" : "#FFFFFF"}
                  strokeWidth={2.4}
                />
              </Pressable>
            </View>

            <View style={styles.weekDaysRow}>
              {weekDays.map((wd) => (
                <Text
                  key={wd}
                  style={[
                    styles.weekDayText,
                    { color: isLight ? "#012E4F" : "#94A3B8" },
                  ]}
                >
                  {wd}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <View
                  key={`empty-${idx}`}
                  style={styles.expandedEmptyDayCell}
                />
              ))}

              {calendarDays.map((day) => {
                const isSelected = selectedCalendarDay === day;

                const dayTxs = (filteredByMonthTransactions || []).filter(
                  (tx) => {
                    if (!tx || !tx.date) return false;
                    return new Date(tx.date).getDate() === day;
                  },
                );

                const dayIncome = dayTxs
                  .filter((tx) => tx && tx.type === "income")
                  .reduce((sum, tx) => sum + tx.amount, 0);

                const dayExpense = dayTxs
                  .filter((tx) => tx && tx.type === "expense")
                  .reduce((sum, tx) => sum + tx.amount, 0);

                const hasIncome = dayIncome > 0;
                const hasExpense = dayExpense > 0;

                const formatAbbreviated = (amount: number) => {
                  if (amount === 0) return "";
                  if (amount >= 1000) {
                    return `${Math.round(amount / 1000)}k`;
                  }
                  return `${amount}`;
                };

                const incomeStr = hasIncome ? formatAbbreviated(dayIncome) : "";
                const expenseStr = hasExpense
                  ? formatAbbreviated(dayExpense)
                  : "";

                if (isSelected) {
                  return (
                    <Pressable
                      key={day}
                      style={styles.expandedDayCell}
                      onPress={() => setSelectedCalendarDay(day)}
                    >
                      <View
                        style={[
                          styles.expandedSelectedDayBadge,
                          {
                            backgroundColor: "#5D7D95",
                            borderColor: "#5D7D95",
                            gap: 3,
                          },
                        ]}
                      >
                        <Text style={styles.selectedDayNumberText}>{day}</Text>
                        {hasIncome && (
                          <Text
                            style={styles.selectedDayIncomeText}
                            numberOfLines={1}
                          >
                            {incomeStr}
                          </Text>
                        )}
                        {hasExpense && (
                          <Text
                            style={styles.selectedDayExpenseText}
                            numberOfLines={1}
                          >
                            {expenseStr}
                          </Text>
                        )}
                        {!hasIncome && !hasExpense && (
                          <View style={{ height: 12 }} />
                        )}
                      </View>
                    </Pressable>
                  );
                }

                return (
                  <Pressable
                    key={day}
                    style={styles.expandedDayCell}
                    onPress={() => setSelectedCalendarDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        { color: isLight ? "#012E4F" : "#E2E8F0" },
                        dayTxs.length > 0 && styles.dayCellTextActivity,
                      ]}
                    >
                      {day}
                    </Text>
                    {hasIncome || hasExpense ? (
                      <View style={styles.dayActivityDotsRow}>
                        {hasIncome && (
                          <View
                            style={[
                              styles.activityDot,
                              { backgroundColor: "#10B981" },
                            ]}
                          />
                        )}
                        {hasExpense && (
                          <View
                            style={[
                              styles.activityDot,
                              { backgroundColor: "#EF4444" },
                            ]}
                          />
                        )}
                      </View>
                    ) : (
                      <View style={{ height: 6 }} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {selectedFilter === "Monthly" ? (
          !hasRealTx || weeklyBreakdowns.length === 0 ? (
            <View style={styles.emptyDayNotice}>
              <CalendarIcon size={28} color="#94A3B8" strokeWidth={1.5} />
              <Text style={[styles.emptyDayText, { color: subTextColor }]}>
                {searchQuery.trim()
                  ? "No transactions matched your search"
                  : !hasRealTx
                    ? `No transactions recorded for ${selectedMonth}`
                    : `No weeks have started in ${selectedMonth}`}
              </Text>
            </View>
          ) : (
            <View style={styles.weeklyListContainer}>
              {weeklyBreakdowns.map((week) => {
                const isNegative = week.netAmount < 0;
                const formattedNet = `PKR ${isNegative ? "-" : ""}${Math.abs(week.netAmount).toFixed(2)}`;
                const formattedBreakdown = `+${week.income.toFixed(2)}  ${week.expense.toFixed(2)}`;

                return (
                  <Pressable
                    key={week.id}
                    style={[
                      styles.weeklyCard,
                      { backgroundColor: "#EDEDED66", borderColor: borderCol },
                    ]}
                  >
                    <View style={styles.weeklyLeftCol}>
                      <Text style={[styles.weeklyTitle, { color: textColor }]}>
                        {week.title}
                      </Text>
                      <Text
                        style={[
                          styles.weeklyDateRange,
                          { color: subTextColor },
                        ]}
                      >
                        {week.dateRange}
                      </Text>
                    </View>

                    <View style={styles.weeklyRightCol}>
                      <Text
                        style={[styles.weeklyNetAmount, { color: textColor }]}
                      >
                        {formattedNet}
                      </Text>
                      <Text
                        style={[
                          styles.weeklyBreakdown,
                          { color: subTextColor },
                        ]}
                      >
                        {formattedBreakdown}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )
        ) : selectedFilter === "Total" ? (
          !transactions || transactions.length === 0 ? (
            <View style={styles.emptyDayNotice}>
              <ClipboardList size={28} color="#94A3B8" strokeWidth={1.5} />
              <Text style={[styles.emptyDayText, { color: subTextColor }]}>
                {searchQuery.trim()
                  ? "No transactions matched your search"
                  : `No transactions in ${selectedMonth}`}
              </Text>
            </View>
          ) : (
            <View
              style={{
                gap: 14,
                maxWidth: 380,
                width: "100%",
                alignSelf: "center",
              }}
            >
              <View
                style={[
                  styles.topBudgetCard,
                  {
                    backgroundColor: isLight ? "#EDEDEDB2" : "#161B22",
                    borderColor: borderCol,
                  },
                ]}
              >
                <Pressable
                  style={styles.topBudgetCardTitle}
                  onPress={onNavigateBudgets}
                >
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "700",
                      color: isLight ? "#012E4F" : "#FFFFFF",
                      textAlign: "center",
                      lineHeight: 28,
                    }}
                  >
                    Manage Budget +
                  </Text>
                </Pressable>

                <View style={styles.topBudgetCardContent}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "800",
                        color: textColor,
                        letterSpacing: -0.5,
                        flex: 1,
                      }}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                    >
                      {formatNumberWithCommas(effectiveTotalBudget, 2)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color:
                          allTimeExpenseAmount > effectiveTotalBudget
                            ? "#EF4444"
                            : subTextColor,
                      }}
                      numberOfLines={1}
                    >
                      {allTimeExpenseAmount > effectiveTotalBudget ? "-" : ""}%
                      {Math.round(
                        (allTimeExpenseAmount / (effectiveTotalBudget || 1)) *
                          100,
                      )}
                    </Text>
                  </View>

                  <View style={styles.totalProgressTrack}>
                    <View
                      style={[
                        styles.totalProgressBar,
                        {
                          width: `${Math.min(100, Math.max(5, (allTimeExpenseAmount / (effectiveTotalBudget || 1)) * 100))}%`,
                          backgroundColor:
                            allTimeExpenseAmount > effectiveTotalBudget
                              ? "#EF4444"
                              : "#5B61F6",
                        },
                      ]}
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11.5,
                        color: subTextColor,
                        fontWeight: "500",
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {currency.symbol}
                      {formatNumberWithCommas(allTimeExpenseAmount, 2)} spent
                    </Text>
                    <Text
                      style={{
                        fontSize: 11.5,
                        color:
                          allTimeExpenseAmount > effectiveTotalBudget
                            ? "#EF4444"
                            : subTextColor,
                        fontWeight: "500",
                        textAlign: "right",
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {allTimeExpenseAmount > effectiveTotalBudget
                        ? `${currency.symbol}${formatNumberWithCommas(allTimeExpenseAmount - effectiveTotalBudget, 2)} overspending`
                        : `${currency.symbol}${formatNumberWithCommas(effectiveTotalBudget - allTimeExpenseAmount, 2)} left`}
                    </Text>
                  </View>
                </View>
              </View>

              {searchedAllTimeSpendingCategories.length > 0 && (
                <View style={{ gap: 12, width: "92%", alignSelf: "center" }}>
                  {searchedAllTimeSpendingCategories.map((cat, idx) => {
                    const config = categoryBudgets[cat.title];
                    const freq = config
                      ? config.period.toLowerCase()
                      : idx === 0
                        ? "weekly"
                        : idx === 1
                          ? "annually"
                          : "monthly";
                    const catLimit = config
                      ? config.limit
                      : budgetLimit /
                        Math.max(1, searchedAllTimeSpendingCategories.length);
                    const isOver = cat.amount > catLimit;
                    const percentVal =
                      catLimit > 0 ? (cat.amount / catLimit) * 100 : 0;
                    const catColor = cat.color || getCategoryColor(cat.title);
                    return (
                      <Pressable
                        key={cat.id}
                        style={[
                          styles.catBudgetCard,
                          {
                            backgroundColor: isLight ? "#EDEDEDB2" : "#161B22",
                            borderColor: borderCol,
                          },
                        ]}
                        onPress={() =>
                          handleCategoryCardClick(
                            cat.title,
                            "expense",
                            cat.amount,
                          )
                        }
                      >
                        <View style={styles.singleCardTitle}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <CategoryIconView
                              iconName={cat.icon || cat.title}
                              color={catColor}
                              size={16}
                              containerSize={30}
                              customBg={catColor + "22"}
                              customColor={catColor}
                              isLight={isLight}
                            />
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "baseline",
                                gap: 6,
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <Text
                                style={[
                                  styles.catBudgetTitle,
                                  {
                                    color: catColor,
                                    fontSize: 16,
                                    fontWeight: "700",
                                  },
                                ]}
                                numberOfLines={1}
                              >
                                {cat.title}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 11.5,
                                  color: subTextColor,
                                  fontWeight: "500",
                                }}
                              >
                                {freq}
                              </Text>
                            </View>
                          </View>
                          <Pressable
                            style={styles.moreIconBtn}
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                            onPress={(e) => {
                              e.stopPropagation?.();
                              handleCategoryCardClick(
                                cat.title,
                                "expense",
                                cat.amount,
                              );
                            }}
                          >
                            <MoreVertical size={16} color={subTextColor} />
                          </Pressable>
                        </View>

                        <View style={styles.singleCardContent}>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "baseline",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 22,
                                fontWeight: "800",
                                color: textColor,
                                letterSpacing: -0.5,
                              }}
                            >
                              {cat.formattedAmount}
                            </Text>
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: "700",
                                color: isOver ? "#EF4444" : catColor,
                              }}
                            >
                              {isOver ? "-" : ""}%{Math.round(percentVal)}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.catProgressTrack,
                              {
                                backgroundColor: isLight
                                  ? "#E2E8F0"
                                  : "#334155",
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.catProgressBar,
                                {
                                  width: `${Math.min(100, Math.max(4, percentVal))}%`,
                                  backgroundColor: isOver
                                    ? "#EF4444"
                                    : catColor,
                                },
                              ]}
                            />
                          </View>

                          <View style={styles.catBudgetFooterRow}>
                            <Text
                              style={[styles.catBudgetSpentText, { flex: 1 }]}
                              numberOfLines={1}
                            >
                              -{currency.symbol}
                              {cat.formattedAmount} spent
                            </Text>
                            <Text
                              style={[
                                styles.catBudgetRightText,
                                {
                                  color: isOver ? "#EF4444" : subTextColor,
                                  fontWeight: "500",
                                  flex: 1,
                                  textAlign: "right",
                                },
                              ]}
                              numberOfLines={1}
                            >
                              {currency.symbol}
                              {formatNumberWithCommas(
                                Math.abs(catLimit - cat.amount),
                                2,
                              )}{" "}
                              {isOver ? "overspending" : "left"}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {searchedAllTimeIncomeCategories.length > 0 && (
                <View
                  style={{
                    gap: 12,
                    marginTop: 4,
                    width: "92%",
                    alignSelf: "center",
                  }}
                >
                  {searchedAllTimeIncomeCategories.map((cat, idx) => {
                    const catColor = cat.color || getCategoryColor(cat.title);
                    return (
                      <Pressable
                        key={cat.id}
                        style={[
                          styles.catBudgetCard,
                          {
                            backgroundColor: isLight ? "#EDEDEDB2" : "#161B22",
                            borderColor: borderCol,
                          },
                        ]}
                        onPress={() =>
                          handleCategoryCardClick(
                            cat.title,
                            "income",
                            cat.amount,
                          )
                        }
                      >
                        <View style={styles.singleCardTitle}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <CategoryIconView
                              iconName={cat.icon || cat.title}
                              color={catColor}
                              size={16}
                              containerSize={30}
                              customBg={catColor + "22"}
                              customColor={catColor}
                              isLight={isLight}
                            />
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "baseline",
                                gap: 6,
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <Text
                                style={[
                                  styles.catBudgetTitle,
                                  {
                                    color: catColor,
                                    fontSize: 16,
                                    fontWeight: "700",
                                  },
                                ]}
                                numberOfLines={1}
                              >
                                {cat.title}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 11.5,
                                  color: subTextColor,
                                  fontWeight: "500",
                                }}
                              >
                                monthly
                              </Text>
                            </View>
                          </View>
                          <Pressable
                            style={styles.moreIconBtn}
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                            onPress={(e) => {
                              e.stopPropagation?.();
                              handleCategoryCardClick(
                                cat.title,
                                "income",
                                cat.amount,
                              );
                            }}
                          >
                            <MoreVertical size={16} color={subTextColor} />
                          </Pressable>
                        </View>

                        <View style={styles.singleCardContent}>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "baseline",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 22,
                                fontWeight: "800",
                                color: textColor,
                                letterSpacing: -0.5,
                              }}
                            >
                              {cat.formattedAmount}
                            </Text>
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: "700",
                                color: catColor,
                              }}
                            >
                              {cat.percentage}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.catProgressTrack,
                              {
                                backgroundColor: isLight
                                  ? "#E2E8F0"
                                  : "#334155",
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.catProgressBar,
                                {
                                  width: `${Math.max(4, cat.percentageValue)}%`,
                                  backgroundColor: catColor,
                                },
                              ]}
                            />
                          </View>

                          <View style={styles.catBudgetFooterRow}>
                            <Text
                              style={[styles.catBudgetSpentText, { flex: 1 }]}
                              numberOfLines={1}
                            >
                              +{currency.symbol}
                              {cat.formattedAmount} earned
                            </Text>
                            <Text
                              style={[
                                styles.catBudgetRightText,
                                {
                                  color: catColor,
                                  fontWeight: "500",
                                  flex: 1,
                                  textAlign: "right",
                                },
                              ]}
                              numberOfLines={1}
                            >
                              {cat.shareText}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          )
        ) : selectedFilter === "Note" ? (
          isNoteEditorOpen ? (
            <View style={styles.notesListContainer}>
              <View style={styles.savedNoteItemWrapper}>
                <View
                  style={[
                    styles.savedNoteCard,
                    { backgroundColor: isLight ? "#EDEDED" : "#1E293B" },
                  ]}
                >
                  <View
                    style={[
                      styles.savedNoteBubble,
                      { backgroundColor: isLight ? "#FFFFFF" : "#2D3748" },
                    ]}
                  >
                    <TextInput
                      style={[
                        styles.savedNoteQuestionInput,
                        { color: isLight ? "#000000" : "#FFFFFF" },
                      ]}
                      value={inputQuestion}
                      onChangeText={setInputQuestion}
                      placeholder="How to save money this month?"
                      placeholderTextColor="#94A3B8"
                      multiline
                    />
                  </View>

                  <View
                    style={[
                      styles.savedNoteBubble,
                      { backgroundColor: isLight ? "#FFFFFF" : "#2D3748" },
                    ]}
                  >
                    <TextInput
                      style={[
                        styles.savedNoteAnswerInput,
                        { color: isLight ? "#64748B" : "#94A3B8" },
                      ]}
                      value={inputAnswer}
                      onChangeText={setInputAnswer}
                      placeholder="Spend less in food and shopping"
                      placeholderTextColor="#94A3B8"
                      multiline
                    />
                  </View>
                </View>

                <Pressable
                  style={[
                    styles.noteUpdateActionBtn,
                    { backgroundColor: isLight ? "#012E4F" : "#38BDF8" },
                  ]}
                  onPress={handleSaveNote}
                  accessibilityRole="button"
                  accessibilityLabel={editingNote ? "Update Note" : "Save Note"}
                >
                  <Text style={styles.noteUpdateActionBtnText}>
                    {editingNote ? "Update" : "Save"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.notesListContainer}>
              {searchedNotes.length === 0 ? (
                <View style={styles.noteContainer}>
                  <Pressable
                    onPress={handleAddNoteClick}
                    style={{ alignItems: "center" }}
                  >
                    <Text style={[styles.noteTitle, { color: textColor }]}>
                      {searchQuery.trim()
                        ? "No notes matched your search query."
                        : "No notes yet click below to add"}
                    </Text>
                  </Pressable>
                  {!searchQuery.trim() && (
                    <Pressable
                      style={styles.ledgerNoteImage}
                      onPress={handleAddNoteClick}
                    >
                      <View style={styles.ledgerNotePad}>
                        <View style={styles.clipboardContainer}>
                          <View style={styles.clipboardBody}>
                            <View style={styles.clipboardClipTop} />
                            <View style={styles.clipboardClipHandle} />
                            <View style={styles.clipboardLine1} />
                            <View style={styles.clipboardLine2} />
                            <View style={styles.clipboardLine3} />
                          </View>
                          <View style={styles.clipboardPencil} />
                        </View>
                      </View>

                      <View style={styles.ledgerPlusSign}>
                        <Plus size={16} color="#FFFFFF" strokeWidth={3.5} />
                      </View>
                    </Pressable>
                  )}
                </View>
              ) : (
                <View style={{ gap: 16 }}>
                  {searchedNotes.map((note) => (
                    <View key={note.id} style={styles.savedNoteItemWrapper}>
                      <SwipeableItem
                        isLight={isLight}
                        width="100%"
                        onDelete={() => setNoteToDelete(note)}
                      >
                        <Pressable
                          style={[
                            styles.savedNoteCardImage2,
                            {
                              backgroundColor: isLight ? "#EDEDED" : "#1E293B",
                            },
                          ]}
                          onPress={() => handleEditNoteClick(note)}
                          accessibilityRole="button"
                          accessibilityLabel="Edit Note"
                        >
                          <Text
                            style={[
                              styles.savedNoteTitleImage2,
                              { color: isLight ? "#000000" : "#FFFFFF" },
                            ]}
                          >
                            {note.question}
                          </Text>
                          <Text
                            style={[
                              styles.savedNoteAnswerImage2,
                              { color: isLight ? "#64748B" : "#94A3B8" },
                            ]}
                          >
                            {note.answer}
                          </Text>
                          <Text
                            style={[
                              styles.savedNoteDateImage2,
                              { color: isLight ? "#94A3B8" : "#64748B" },
                            ]}
                          >
                            {note.date}
                          </Text>
                        </Pressable>
                      </SwipeableItem>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )
        ) : selectedFilter === "Daily" ? (
          <View style={styles.ledgerSection}>
            {currentPeriodGroups.map((group: any, groupIdx: number) => (
              <View key={`group-${groupIdx}`} style={styles.dateGroupContainer}>
                {groupIdx > 0 && (
                  <View
                    style={[
                      styles.groupSeparator,
                      { backgroundColor: isLight ? "#0000000D" : "#FFFFFF0D" },
                    ]}
                  />
                )}

                <View style={styles.dateHeaderRow}>
                  <Text
                    style={[styles.groupDateHeader, { color: subTextColor }]}
                  >
                    {group.dateHeader}
                  </Text>
                </View>

                <View style={styles.groupItems}>
                  {group.items.map((item: any) => {
                    const isPositive = item.amount > 0;
                    const matchedCat = (categories || []).find(
                      (c) =>
                        c &&
                        c.name &&
                        c.name.toLowerCase() ===
                          (item.category || "").toLowerCase(),
                    );
                    let matchedSub = null;
                    if (
                      item.subcategory &&
                      matchedCat &&
                      matchedCat.subcategories
                    ) {
                      matchedSub = matchedCat.subcategories.find(
                        (s) =>
                          s &&
                          s.name &&
                          s.name.toLowerCase() ===
                            item.subcategory.toLowerCase(),
                      );
                    }
                    const iconName =
                      item.categoryIcon ||
                      matchedSub?.icon ||
                      matchedCat?.icon ||
                      item.category;
                    const catColor =
                      item.categoryColor ||
                      matchedSub?.color ||
                      matchedCat?.color ||
                      getCategoryColor(item.category);

                    const matchedTx = (transactions || []).find(
                      (t) => t && t.id === item.id,
                    ) || {
                      id: item.id,
                      category: item.category,
                      amount: Math.abs(item.amount),
                      type: item.type,
                      accountId: "",
                      date: new Date().toISOString(),
                    };

                    const handleSwipeDelete = () => {
                      setTxToDelete(matchedTx as Transaction);
                    };

                    return (
                      <React.Fragment key={item.id}>
                        <SwipeableItem
                          onDelete={
                            onDeleteTransaction ? handleSwipeDelete : undefined
                          }
                          isLight={isLight}
                          height={44}
                          width="100%"
                        >
                          <Pressable
                            style={[
                              styles.recordRow,
                              { backgroundColor: containerBg },
                            ]}
                            onPress={() =>
                              onPressTransaction?.(matchedTx as Transaction)
                            }
                            accessibilityRole="button"
                          >
                            <View style={styles.recordLeft}>
                              <CategoryIconView
                                iconName={iconName}
                                color={catColor}
                                size={18}
                                containerSize={40}
                                customBg={catColor + "22"}
                                customColor={catColor}
                                isLight={isLight}
                              />

                              <View style={styles.recordMeta}>
                                <Text
                                  style={[
                                    styles.recordCategory,
                                    { color: textColor },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {item.category}
                                </Text>
                                <Text
                                  style={[
                                    styles.recordAccount,
                                    { color: subTextColor },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {item.account}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.recordRight}>
                              <Text
                                style={[
                                  styles.recordAmount,
                                  isPositive
                                    ? styles.incomeText
                                    : styles.expenseText,
                                ]}
                                numberOfLines={1}
                              >
                                {Math.abs(item.amount).toFixed(2)}
                              </Text>
                              <Text
                                style={[
                                  styles.recordDateText,
                                  { color: subTextColor },
                                ]}
                              >
                                {item.dateDisplay}
                              </Text>
                            </View>
                          </Pressable>
                        </SwipeableItem>
                      </React.Fragment>
                    );
                  })}
                </View>
              </View>
            ))}

            {currentPeriodGroups.length === 0 && selectedFilter === "Daily" && (
              <View style={styles.emptyDayNotice}>
                <ClipboardList size={28} color="#94A3B8" strokeWidth={1.5} />
                <Text style={[styles.emptyDayText, { color: subTextColor }]}>
                  {searchQuery.trim()
                    ? "No transactions matched your search"
                    : selectedCalendarDay !== null
                      ? `No transactions on ${selectedCalendarDay} ${selectedMonth}`
                      : `No transactions in ${selectedMonth}`}
                </Text>
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>

      {selectedFilter === "Note" && notes.length > 0 && !isNoteEditorOpen && (
        <View
          style={[
            styles.floatingAddNoteContainer,
            { bottom: Math.max(insets.bottom, 8) + 12, right: 20 },
          ]}
        >
          <Pressable
            style={styles.floatingAddNoteBadge}
            onPress={handleAddNoteClick}
            accessibilityRole="button"
            accessibilityLabel="Add New Note"
          >
            <View
              style={[
                styles.floatingNotePad,
                { backgroundColor: isLight ? "#CBD5E1" : "#334155" },
              ]}
            >
              <View style={styles.floatingClipboardContainer}>
                <View style={styles.floatingClipboardBody}>
                  <View style={styles.floatingClipTop} />
                  <View style={styles.floatingClipHandle} />
                  <View style={styles.floatingLine1} />
                  <View style={styles.floatingLine2} />
                  <View style={styles.floatingLine3} />
                </View>
                <View style={styles.floatingPencil} />
              </View>
            </View>

            <View
              style={[
                styles.floatingPlusSign,
                { backgroundColor: isLight ? "#5D7D95" : "#012E4F" },
              ]}
            >
              <Plus size={15} color="#FFFFFF" strokeWidth={3.5} />
            </View>
          </Pressable>
        </View>
      )}

      <DeleteConfirmModal
        visible={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={() => {
          if (txToDelete && onDeleteTransaction) {
            onDeleteTransaction(txToDelete.id);
          }
        }}
        title="Delete Record?"
        message="Are you sure you want to delete this record? This action cannot be undone."
        itemDetails={
          txToDelete
            ? {
                category: txToDelete.category,
                amount: `${currency.symbol}${txToDelete.amount.toFixed(2)}`,
                note: txToDelete.note,
              }
            : undefined
        }
        isLight={isLight}
      />

      <DeleteConfirmModal
        visible={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) {
            handleDeleteNoteClick(noteToDelete.id);
            setNoteToDelete(null);
          }
        }}
        title="Delete Ledger Note?"
        message="Are you sure you want to delete this note? This action cannot be undone."
        itemDetails={
          noteToDelete
            ? {
                category: "Ledger Note",
                amount: noteToDelete.question,
                note: noteToDelete.answer,
              }
            : undefined
        }
        isLight={isLight}
      />

      <TopBarCalendarModal
        visible={isMonthPickerOpen}
        onClose={() => setIsMonthPickerOpen(false)}
        selectedMonth={selectedMonth}
        selectedCalendarDay={selectedCalendarDay}
        onSelectDay={(day, date) => {
          setSelectedCalendarDay(day);
          if (onSelectDate) {
            onSelectDate(date);
          }
        }}
        onSelectAllMonth={(date) => {
          setSelectedCalendarDay(null);
          if (onSelectDate) {
            onSelectDate(date);
          }
        }}
        isLight={isLight}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 130,
  },
  headerRow: {
    maxWidth: 412,
    width: "100%",
    height: 56,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingTop: 0,
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#012E4F",
    letterSpacing: -0.5,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  circleActionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    maxWidth: 380,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 12,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#1E293B",
    padding: 0,
  },
  periodFilterWrapper: {
    maxWidth: 380,
    width: "100%",
    height: 42,
    alignSelf: "center",
    marginBottom: 16,
  },
  periodFilterScrollView: {
    height: 42,
  },
  periodFilterScroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 0,
    paddingHorizontal: 1,
  },
  filterPill: {
    minWidth: 81,
    height: 42,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  filterPillActive: {
    backgroundColor: "#5D7D95",
  },
  filterPillInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  filterPillTextInactive: {
    color: "#012E4F",
  },
  calendarCard: {
    width: "100%",
    maxWidth: 390,
    alignSelf: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
    marginBottom: 24,
  },
  calendarCardExpanded: {
    width: "100%",
    maxWidth: 390,
    alignSelf: "center",
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 16,
    marginBottom: 16,
  },
  calendarHeader: {
    height: 44,
    borderBottomWidth: 1.5,
    borderBottomColor: "#012E4F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  calendarTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  calendarNavBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  weekDaysRow: {
    flexDirection: "row",
    paddingTop: 6,
    paddingBottom: 6,
    marginBottom: 6,
  },
  weekDayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 13.5,
    fontWeight: "600",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  emptyDayCell: {
    width: "14.285%",
    height: 44,
  },
  expandedEmptyDayCell: {
    width: "14.285%",
    height: 64,
  },
  dayCell: {
    width: "14.285%",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  expandedDayCell: {
    width: "14.285%",
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDayBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 1,
  },
  expandedSelectedDayBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  selectedDayNumberText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  selectedDayIncomeText: {
    fontSize: 8.5,
    fontWeight: "700",
    color: "#4ADE80",
    textAlign: "center",
    lineHeight: 10,
  },
  selectedDayExpenseText: {
    fontSize: 8.5,
    fontWeight: "700",
    color: "#F87171",
    textAlign: "center",
    lineHeight: 10,
  },
  dayCellText: {
    fontSize: 14.5,
    fontWeight: "600",
  },
  dayCellTextActivity: {
    fontWeight: "800",
  },
  dayActivityDotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    marginTop: 4,
    height: 6,
  },
  activityDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
  },
  summaryCard: {
    maxWidth: 380,
    width: "100%",
    height: 146,
    alignSelf: "center",
    backgroundColor: "#012E4F",
    borderRadius: 10,
    marginBottom: 24,
    shadowColor: "#012E4F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  summaryTopFrame: {
    maxWidth: 380,
    width: "100%",
    height: 80,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: "#012E4F",
    paddingHorizontal: 16,
    paddingTop: 12,
    justifyContent: "center",
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "400",
    color: "#FFFFFF",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  summaryAmount: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  summaryFooter: {
    maxWidth: 380,
    width: "100%",
    height: 66,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  summaryStatItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  statTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  arrowIconWrap: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 13.5,
    fontWeight: "400",
    color: "#FFFFFF",
    marginBottom: 1,
  },
  statValue: {
    width: 104,
    height: 24,
    fontSize: 15.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    marginHorizontal: 10,
  },
  ledgerSection: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    gap: 22,
  },
  dateGroupContainer: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
  },
  groupSeparator: {
    width: "100%",
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 8,
  },
  dateHeaderRow: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    height: 28,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  groupDateHeader: {
    fontSize: 12.5,
    fontWeight: "500",
  },
  groupItems: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    gap: 10,
  },
  recordRow: {
    width: "100%",
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  recordLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  recordMeta: {
    flex: 1,
    gap: 1,
  },
  recordCategory: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  recordAccount: {
    fontSize: 11,
    fontWeight: "400",
  },
  recordRight: {
    alignItems: "flex-end",
    gap: 2,
    paddingLeft: 8,
  },
  recordAmount: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  incomeText: {
    color: "#53D258",
  },
  expenseText: {
    color: "#E25C5C",
  },
  recordDateText: {
    fontSize: 10.5,
    fontWeight: "400",
  },
  weeklyListContainer: {
    gap: 10,
  },
  weeklyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EDEDED66",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  weeklyLeftCol: {
    flex: 1,
    minWidth: 0,
  },
  weeklyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F2C4C",
    letterSpacing: -0.2,
  },
  weeklyDateRange: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 3,
    letterSpacing: 0.2,
  },
  weeklyRightCol: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  weeklyNetAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F2C4C",
    letterSpacing: -0.2,
    textAlign: "right",
  },
  weeklyBreakdown: {
    fontSize: 11.5,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 3,
    textAlign: "right",
  },
  emptyDayNotice: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyDayText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },
  topBudgetCard: {
    maxWidth: 380,
    width: "100%",
    minHeight: 175,
    alignSelf: "center",
    backgroundColor: "#EDEDEDB2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    marginBottom: 14,
  },
  topBudgetCardTitle: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    height: 36,
    width: "100%",
  },
  topBudgetCardContent: {
    width: "100%",
    gap: 20,
    alignSelf: "center",
  },
  catBudgetCard: {
    width: "100%",
    maxWidth: 350,
    minHeight: 130,
    alignSelf: "center",
    backgroundColor: "#EDEDEDB2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    paddingTop: 5,
    paddingRight: 10,
    paddingBottom: 15,
    paddingLeft: 10,
    gap: 8,
    justifyContent: "space-between",
  },
  singleCardTitle: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  singleCardContent: {
    width: "100%",
    gap: 12,
  },
  catBudgetTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  moreIconBtn: {
    padding: 4,
  },
  catProgressTrack: {
    width: "100%",
    height: 5,
    borderRadius: 2.5,
    overflow: "hidden",
    marginBottom: 6,
  },
  catProgressBar: {
    height: "100%",
    borderRadius: 2.5,
  },
  catBudgetFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  catBudgetSpentText: {
    fontSize: 11.5,
    fontWeight: "500",
    color: "#64748B",
  },
  catBudgetRightText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#1E293B",
  },
  totalProgressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "#EEF2FF",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  totalProgressBar: {
    height: "100%",
    backgroundColor: "#5B61F6",
    borderRadius: 4,
  },
  noteContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 16,
  },
  noteTitle: {
    width: 283,
    height: 27,
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 18,
    lineHeight: 27,
    textAlign: "center",
    color: "#000000",
    marginBottom: 20,
  },
  ledgerNoteImage: {
    width: 134,
    height: 159,
    position: "relative",
    alignSelf: "center",
  },
  ledgerNotePad: {
    width: 120,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#D9D9D9",
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  ledgerPlusSign: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#5D7D95",
    position: "absolute",
    bottom: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  clipboardContainer: {
    width: 60,
    height: 70,
    position: "relative",
  },
  clipboardBody: {
    width: 60,
    height: 64,
    backgroundColor: "#7E90A1",
    borderRadius: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  clipboardClipTop: {
    width: 24,
    height: 8,
    backgroundColor: "#7E90A1",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    position: "absolute",
    top: -6,
    left: 18,
  },
  clipboardClipHandle: {
    width: 16,
    height: 4,
    backgroundColor: "#D9D9D9",
    borderRadius: 2,
    position: "absolute",
    top: -3,
    left: 22,
  },
  clipboardLine1: {
    width: 32,
    height: 4,
    backgroundColor: "#D9D9D9",
    borderRadius: 2,
    position: "absolute",
    top: 14,
    left: 14,
  },
  clipboardLine2: {
    width: 18,
    height: 4,
    backgroundColor: "#D9D9D9",
    borderRadius: 2,
    position: "absolute",
    top: 26,
    left: 14,
  },
  clipboardLine3: {
    width: 24,
    height: 4,
    backgroundColor: "#D9D9D9",
    borderRadius: 2,
    position: "absolute",
    top: 38,
    left: 14,
  },
  clipboardPencil: {
    width: 12,
    height: 34,
    backgroundColor: "#7E90A1",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D9D9D9",
    position: "absolute",
    bottom: 4,
    right: -4,
    transform: [{ rotate: "45deg" }],
  },
  notesListContainer: {
    gap: 16,
    paddingBottom: 24,
  },
  savedNoteItemWrapper: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    marginBottom: 8,
  },
  savedNoteCardImage2: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  savedNoteTitleImage2: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Poppins",
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  savedNoteAnswerImage2: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Poppins",
    lineHeight: 20,
    marginTop: 2,
  },
  savedNoteDateImage2: {
    fontSize: 13,
    fontWeight: "400",
    fontFamily: "Poppins",
    marginTop: 4,
  },
  savedNoteCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 0,
  },
  savedNoteBubble: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  savedNoteQuestionInput: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Poppins",
    padding: 0,
  },
  savedNoteAnswerInput: {
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Poppins",
    padding: 0,
  },
  noteUpdateActionBtn: {
    alignSelf: "flex-end",
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 10,
    marginTop: 8,
    shadowColor: "#012E4F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  noteUpdateActionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  floatingAddNoteBadge: {
    width: 64.69,
    height: 82.11,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  floatingNotePad: {
    width: 58,
    height: 73,
    borderRadius: 14,
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingClipboardContainer: {
    width: 38,
    height: 48,
    position: "relative",
  },
  floatingClipboardBody: {
    width: 35,
    height: 42,
    backgroundColor: "#7E90A1",
    borderRadius: 6,
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  floatingClipTop: {
    width: 16,
    height: 6,
    backgroundColor: "#7E90A1",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    position: "absolute",
    top: -5,
    left: 9.5,
  },
  floatingClipHandle: {
    width: 10,
    height: 3,
    backgroundColor: "#D9D9D9",
    borderRadius: 1.5,
    position: "absolute",
    top: -3,
    left: 12.5,
  },
  floatingLine1: {
    width: 19,
    height: 3,
    backgroundColor: "#D9D9D9",
    borderRadius: 1.5,
    position: "absolute",
    top: 10,
    left: 8,
  },
  floatingLine2: {
    width: 12,
    height: 3,
    backgroundColor: "#D9D9D9",
    borderRadius: 1.5,
    position: "absolute",
    top: 18,
    left: 8,
  },
  floatingLine3: {
    width: 15,
    height: 3,
    backgroundColor: "#D9D9D9",
    borderRadius: 1.5,
    position: "absolute",
    top: 26,
    left: 8,
  },
  floatingPencil: {
    width: 8,
    height: 24,
    backgroundColor: "#7E90A1",
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#D9D9D9",
    position: "absolute",
    bottom: 2,
    right: -2,
    transform: [{ rotate: "45deg" }],
  },
  floatingAddNoteContainer: {
    position: "absolute",
    zIndex: 999,
  },
  floatingPlusSign: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    position: "absolute",
    bottom: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default LedgerScreen;
