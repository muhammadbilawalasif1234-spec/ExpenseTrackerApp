import { Calendar, CreditCard, Delete, Plus, X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DEFAULT_CATEGORIES } from "../constants/theme";
import {
  Account,
  Category,
  Currency,
  Transaction,
  TransactionType,
} from "../types";
import { getCategoryColor } from "../utils/categoryColors";
import { CategoryIconView } from "./CategoryIconView";
import { SelectAccountModal } from "./dashboard/SelectAccountModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

const AVAILABLE_ICONS = [
  "UtensilsCrossed",
  "Coffee",
  "Wine",
  "ShoppingBag",
  "ShoppingCart",
  "HeartPulse",
  "Bus",
  "Car",
  "Coins",
  "Smile",
  "PartyPopper",
  "Home",
  "Dumbbell",
  "Receipt",
  "Film",
  "GraduationCap",
  "Plane",
  "Banknote",
  "Briefcase",
  "Laptop",
  "Gift",
  "TrendingUp",
  "CreditCard",
];

export const getCategorySubcategories = (
  catName: string,
  catType: TransactionType,
  existingSubs?: { id?: string; name: string; icon?: string; color?: string }[],
): { id?: string; name: string; icon?: string; color?: string }[] => {
  if (existingSubs && existingSubs.length > 0) return existingSubs;
  const lower = (catName || "").toLowerCase();
  if (catType === "income") {
    if (
      lower.includes("salary") ||
      lower.includes("wage") ||
      lower.includes("paycheck")
    ) {
      return [
        {
          id: "sub-fulltime",
          name: "Full-time",
          icon: "Banknote",
          color: "#00C853",
        },
        { id: "sub-bonus", name: "Bonus", icon: "Gift", color: "#10B981" },
        {
          id: "sub-overtime",
          name: "Overtime",
          icon: "Banknote",
          color: "#059669",
        },
        {
          id: "sub-commission",
          name: "Commission",
          icon: "Coins",
          color: "#34D399",
        },
      ];
    }
    if (
      lower.includes("business") ||
      lower.includes("corp") ||
      lower.includes("client")
    ) {
      return [
        { id: "sub-sales", name: "Sales", icon: "Briefcase", color: "#4ECDC4" },
        {
          id: "sub-services",
          name: "Services",
          icon: "Briefcase",
          color: "#0284C7",
        },
        {
          id: "sub-consulting",
          name: "Consulting",
          icon: "Briefcase",
          color: "#06B6D4",
        },
        {
          id: "sub-contracts",
          name: "Contracts",
          icon: "Briefcase",
          color: "#3B82F6",
        },
      ];
    }
    if (
      lower.includes("free") ||
      lower.includes("gig") ||
      lower.includes("laptop")
    ) {
      return [
        {
          id: "sub-projects",
          name: "Projects",
          icon: "Laptop",
          color: "#3B82F6",
        },
        { id: "sub-design", name: "Design", icon: "Laptop", color: "#8B5CF6" },
        {
          id: "sub-dev",
          name: "Development",
          icon: "Laptop",
          color: "#0284C7",
        },
        {
          id: "sub-writing",
          name: "Writing",
          icon: "Laptop",
          color: "#6366F1",
        },
      ];
    }
    if (
      lower.includes("invest") ||
      lower.includes("stock") ||
      lower.includes("crypto")
    ) {
      return [
        {
          id: "sub-dividends",
          name: "Dividends",
          icon: "TrendingUp",
          color: "#EAB308",
        },
        {
          id: "sub-stocks",
          name: "Stocks",
          icon: "TrendingUp",
          color: "#F59E0B",
        },
        {
          id: "sub-capital-gains",
          name: "Capital Gains",
          icon: "TrendingUp",
          color: "#D97706",
        },
        {
          id: "sub-crypto",
          name: "Crypto",
          icon: "TrendingUp",
          color: "#F97316",
        },
      ];
    }
    if (
      lower.includes("interest") ||
      lower.includes("yield") ||
      lower.includes("deposit")
    ) {
      return [
        {
          id: "sub-savings-int",
          name: "Savings Interest",
          icon: "Coins",
          color: "#D946EF",
        },
        {
          id: "sub-fixed-dep",
          name: "Fixed Deposit",
          icon: "Coins",
          color: "#C026D3",
        },
        { id: "sub-bonds", name: "Bonds", icon: "Coins", color: "#A21CAF" },
      ];
    }
    if (lower.includes("rent") || lower.includes("property")) {
      return [
        {
          id: "sub-prop-rent",
          name: "Property Rent",
          icon: "Home",
          color: "#F97316",
        },
        {
          id: "sub-comm-rent",
          name: "Commercial Rent",
          icon: "Home",
          color: "#EA580C",
        },
      ];
    }
    if (lower.includes("gift") || lower.includes("grant")) {
      return [
        {
          id: "sub-cash-gift",
          name: "Cash Gift",
          icon: "Gift",
          color: "#EC4899",
        },
        {
          id: "sub-allowance",
          name: "Allowance",
          icon: "Gift",
          color: "#DB2777",
        },
        { id: "sub-grant", name: "Grant", icon: "Gift", color: "#BE185D" },
      ];
    }
    return [
      {
        id: "sub-inc-main",
        name: "Main Income",
        icon: "Banknote",
        color: "#10B981",
      },
      {
        id: "sub-inc-extra",
        name: "Side Income",
        icon: "Coins",
        color: "#059669",
      },
      { id: "sub-inc-other", name: "Other", icon: "Tag", color: "#64748B" },
    ];
  } else {
    if (
      lower.includes("bill") ||
      lower.includes("receipt") ||
      lower.includes("utility")
    ) {
      return [
        {
          id: "sub-electric",
          name: "Electricity",
          icon: "Receipt",
          color: "#FF9800",
        },
        { id: "sub-water", name: "Water", icon: "Receipt", color: "#0284C7" },
        {
          id: "sub-internet",
          name: "Internet",
          icon: "Receipt",
          color: "#6366F1",
        },
        { id: "sub-phone", name: "Phone", icon: "Receipt", color: "#8B5CF6" },
        { id: "sub-gas", name: "Gas", icon: "Receipt", color: "#EF4444" },
      ];
    }
    if (lower.includes("grocer") || lower.includes("supermarket")) {
      return [
        {
          id: "sub-supermarket",
          name: "Supermarket",
          icon: "ShoppingCart",
          color: "#4CAF50",
        },
        {
          id: "sub-produce",
          name: "Produce",
          icon: "ShoppingCart",
          color: "#059669",
        },
        {
          id: "sub-meat-dairy",
          name: "Meat & Dairy",
          icon: "ShoppingCart",
          color: "#047857",
        },
        {
          id: "sub-bakery",
          name: "Bakery",
          icon: "ShoppingCart",
          color: "#F59E0B",
        },
      ];
    }
    if (
      lower.includes("entertain") ||
      lower.includes("movie") ||
      lower.includes("film")
    ) {
      return [
        { id: "sub-movies", name: "Movies", icon: "Film", color: "#9C27B0" },
        {
          id: "sub-streaming",
          name: "Streaming",
          icon: "Film",
          color: "#8B5CF6",
        },
        { id: "sub-games", name: "Gaming", icon: "Film", color: "#7C3AED" },
        { id: "sub-events", name: "Events", icon: "Film", color: "#6D28D9" },
      ];
    }
    if (lower.includes("edu") || lower.includes("school")) {
      return [
        {
          id: "sub-tuition",
          name: "Tuition",
          icon: "GraduationCap",
          color: "#00BCD4",
        },
        {
          id: "sub-books",
          name: "Books",
          icon: "GraduationCap",
          color: "#0891B2",
        },
        {
          id: "sub-courses",
          name: "Courses",
          icon: "GraduationCap",
          color: "#0E7490",
        },
      ];
    }
    if (lower.includes("food") || lower.includes("drink")) {
      return [
        {
          id: "sub-food",
          name: "Food",
          icon: "UtensilsCrossed",
          color: "#F59E0B",
        },
        { id: "sub-coffee", name: "Coffee", icon: "Coffee", color: "#D97706" },
        {
          id: "sub-restaurant",
          name: "Restaurant",
          icon: "UtensilsCrossed",
          color: "#EA580C",
        },
        {
          id: "sub-drink",
          name: "Drinks",
          icon: "UtensilsCrossed",
          color: "#F97316",
        },
      ];
    }
    if (lower.includes("shop")) {
      return [
        {
          id: "sub-clothes",
          name: "Clothes",
          icon: "ShoppingBag",
          color: "#0284C7",
        },
        {
          id: "sub-electronics",
          name: "Electronics",
          icon: "ShoppingBag",
          color: "#0369A1",
        },
        { id: "sub-home", name: "Home", icon: "ShoppingBag", color: "#075985" },
      ];
    }
    if (lower.includes("health") || lower.includes("med")) {
      return [
        {
          id: "sub-doctor",
          name: "Doctor",
          icon: "HeartPulse",
          color: "#06B6D4",
        },
        {
          id: "sub-medicine",
          name: "Medicine",
          icon: "HeartPulse",
          color: "#0891B2",
        },
        { id: "sub-gym", name: "Gym", icon: "HeartPulse", color: "#0E7490" },
      ];
    }
    if (
      lower.includes("trans") ||
      lower.includes("travel") ||
      lower.includes("car") ||
      lower.includes("bus")
    ) {
      return [
        { id: "sub-fuel", name: "Fuel", icon: "Bus", color: "#059669" },
        { id: "sub-bus", name: "Bus", icon: "Bus", color: "#10B981" },
        { id: "sub-taxi", name: "Taxi", icon: "Bus", color: "#047857" },
        { id: "sub-parking", name: "Parking", icon: "Car", color: "#0284C7" },
      ];
    }
    return [
      { id: "sub-gen", name: "General", icon: "Tag", color: "#64748B" },
      { id: "sub-other", name: "Other", icon: "Tag", color: "#94A3B8" },
    ];
  }
};

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, "id">) => void;
  onUpdate?: (id: string, updated: Partial<Transaction>) => void;
  onDelete?: (id: string) => void;
  editingTransaction?: Transaction | null;
  categories?: Category[];
  accounts: Account[];
  currency: Currency;
  isLight?: boolean;
  initialType?: TransactionType;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  editingTransaction,
  categories = DEFAULT_CATEGORIES,
  accounts,
  currency,
  isLight = true,
  initialType = "expense",
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>("0");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("31 Aug 2026, 09:34 PM");
  const [realDate, setRealDate] = useState<Date>(new Date());

  const [localCategories, setLocalCategories] = useState<Category[]>(
    categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES,
  );

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerIcon, setPickerIcon] = useState("Tag");
  const [pickerColor, setPickerColor] = useState("#0284C7");
  const [newCatName, setNewCatName] = useState("");
  const [isAddingSubModalOpen, setIsAddingSubModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [newSubIcon, setNewSubIcon] = useState("UtensilsCrossed");
  const [newSubColor, setNewSubColor] = useState("#F59E0B");
  const [isSubPickerOpen, setIsSubPickerOpen] = useState(false);
  const [subKeyboardHeight, setSubKeyboardHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const formScrollViewRef = useRef<ScrollView>(null);
  const noteInputRef = useRef<TextInput>(null);

  const scrollToNote = () => {
    setTimeout(() => {
      formScrollViewRef.current?.scrollTo({ y: 180, animated: true });
    }, 80);
  };

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const h = e?.endCoordinates?.height || 0;
      setSubKeyboardHeight(h);
      setKeyboardHeight(h);
      if (noteInputRef.current?.isFocused()) {
        setTimeout(() => {
          formScrollViewRef.current?.scrollTo({ y: 180, animated: true });
        }, 60);
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setSubKeyboardHeight(0);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleOpenAddSubModal = () => {
    setNewSubName("");
    setNewSubIcon(currentCategoryObj?.icon || "UtensilsCrossed");
    setNewSubColor(
      currentCategoryObj?.color || getCategoryColor(selectedCategory),
    );
    setIsAddingSubModalOpen(true);
  };

  const handleCloseAddSubModal = () => {
    Keyboard.dismiss();
    setSubKeyboardHeight(0);
    setIsAddingSubModalOpen(false);
  };

  const handleAddSubcategory = () => {
    const trimmed = newSubName.trim();
    if (!trimmed) return;
    const newSub = {
      id: `sub-${Date.now()}`,
      name: trimmed,
      icon: newSubIcon || currentCategoryObj?.icon || "Tag",
      color: newSubColor || currentCategoryObj?.color || "#0284C7",
    };

    const updated = localCategories.map((cat) => {
      if (cat.name.toLowerCase() === selectedCategory.toLowerCase()) {
        return {
          ...cat,
          subcategories: [...(cat.subcategories || []), newSub],
        };
      }
      return cat;
    });

    setLocalCategories(updated);
    setSelectedSubcategory(newSub.name);
    setNewSubName("");
    Keyboard.dismiss();
    setSubKeyboardHeight(0);
    setIsAddingSubModalOpen(false);
  };

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calDay, setCalDay] = useState(new Date().getDate());
  const [calHour, setCalHour] = useState(12);
  const [calMinute, setCalMinute] = useState(0);
  const [calAmPm, setCalAmPm] = useState<"AM" | "PM">("PM");

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calcAmount, setCalcAmount] = useState<string>("0");

  const [isSelectAccountModalOpen, setIsSelectAccountModalOpen] =
    useState(false);
  const [selectingAccountTarget, setSelectingAccountTarget] = useState<
    "from" | "to"
  >("from");

  const openCalculator = () => {
    setCalcAmount(amount && amount !== "0" ? amount : "0");
    setIsCalculatorOpen(true);
  };

  const handleCalcKeyPress = (key: string) => {
    if (key === "back") {
      setCalcAmount((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
    } else if (key === ".") {
      setCalcAmount((prev) => (prev.includes(".") ? prev : prev + "."));
    } else {
      setCalcAmount((prev) => (prev === "0" || prev === "" ? key : prev + key));
    }
  };

  useEffect(() => {
    setLocalCategories(
      categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES,
    );
  }, [categories]);

  useEffect(() => {
    const validCategories =
      localCategories && localCategories.length > 0
        ? localCategories
        : DEFAULT_CATEGORIES;
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setSelectedCategory(editingTransaction.category);
      setSelectedSubcategory(editingTransaction.subcategory || "");
      setSelectedAccountId(
        editingTransaction.accountId || (accounts || [])[0]?.id || "",
      );
      setToAccountId(
        editingTransaction.toAccountId ||
          (accounts || [])[1]?.id ||
          (accounts || [])[0]?.id ||
          "",
      );
      setNote(editingTransaction.note || "");
      if (editingTransaction.date) {
        const d = new Date(editingTransaction.date);
        setRealDate(d);
      }
    } else {
      setType(initialType);
      setAmount("0");
      const filtered = validCategories.filter(
        (c) => c && c.type === initialType,
      );
      const defaultCat = filtered[0] || validCategories[0];
      const catName =
        defaultCat?.name ||
        (initialType === "income" ? "Salary" : "Food & Drink");
      setSelectedCategory(catName);
      const subs = getCategorySubcategories(
        catName,
        initialType,
        defaultCat?.subcategories,
      );
      setSelectedSubcategory(subs[0]?.name || "");
      setSelectedAccountId((accounts || [])[0]?.id || "");
      setToAccountId((accounts || [])[1]?.id || (accounts || [])[0]?.id || "");
      setNote("");
      setRealDate(new Date());
    }
  }, [editingTransaction, visible, initialType, accounts, localCategories]);

  useEffect(() => {
    try {
      const months = [
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
      const day = realDate.getDate();
      const month = months[realDate.getMonth()];
      const year = realDate.getFullYear();
      let hours = realDate.getHours();
      const minutes = String(realDate.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setDateStr(`${day} ${month}, ${year} ${hours}:${minutes} ${ampm}`);
    } catch {
      setDateStr(realDate.toDateString());
    }
  }, [realDate]);

  const filteredCategories = useMemo(() => {
    const base =
      localCategories && localCategories.length > 0
        ? localCategories
        : DEFAULT_CATEGORIES;
    const list = base.filter((c) => c && c.type === type);
    return [...list].sort((a, b) => {
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      const isOtherA = nameA.includes("other") || nameA.includes("general");
      const isOtherB = nameB.includes("other") || nameB.includes("general");

      if (isOtherA && !isOtherB) return 1;
      if (!isOtherA && isOtherB) return -1;
      return 0;
    });
  }, [localCategories, type]);

  const currentCategoryObj = useMemo(() => {
    const validCategories =
      localCategories && localCategories.length > 0
        ? localCategories
        : DEFAULT_CATEGORIES;
    return (
      validCategories.find(
        (c) =>
          c &&
          c.name &&
          c.name.toLowerCase() === selectedCategory.toLowerCase(),
      ) ||
      (filteredCategories || [])[0] ||
      validCategories[0]
    );
  }, [localCategories, filteredCategories, selectedCategory]);

  const subcategories = useMemo(
    () =>
      getCategorySubcategories(
        selectedCategory || currentCategoryObj?.name || "",
        type,
        currentCategoryObj?.subcategories,
      ),
    [selectedCategory, currentCategoryObj, type],
  );

  useEffect(() => {
    if (subcategories && subcategories.length > 0) {
      const exists = subcategories.some(
        (s) => s.name.toLowerCase() === selectedSubcategory.toLowerCase(),
      );
      if (!exists) {
        setSelectedSubcategory(subcategories[0].name);
      }
    }
  }, [subcategories, selectedSubcategory]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const validCategories =
      localCategories && localCategories.length > 0
        ? localCategories
        : DEFAULT_CATEGORIES;
    if (newType !== "transfer") {
      const matchingCats = validCategories.filter(
        (c) => c && c.type === newType,
      );
      const alreadyMatches = matchingCats.find(
        (c) =>
          c &&
          c.name &&
          c.name.toLowerCase() === selectedCategory.toLowerCase(),
      );
      const targetCat = alreadyMatches || matchingCats[0];
      const catName =
        targetCat?.name || (newType === "income" ? "Salary" : "Food & Drink");
      setSelectedCategory(catName);
      const subs = getCategorySubcategories(
        catName,
        newType,
        targetCat?.subcategories,
      );
      setSelectedSubcategory(subs[0]?.name || "");
    } else {
      setSelectedCategory("Transfer");
      setSelectedSubcategory("");
    }
  };

  const isAmountZero =
    !amount ||
    amount === "0" ||
    amount === "0.00" ||
    parseFloat(amount) <= 0 ||
    isNaN(parseFloat(amount));

  const resolvedCatColor =
    currentCategoryObj?.color ||
    getCategoryColor(selectedCategory || "General");

  const handleSave = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      openCalculator();
      return;
    }

    const txData = {
      type,
      amount: num,
      category: selectedCategory || filteredCategories[0]?.name || "General",
      subcategory: selectedSubcategory || undefined,
      accountId: selectedAccountId || accounts[0]?.id || "acc-cash",
      toAccountId:
        type === "transfer" ? toAccountId || accounts[1]?.id : undefined,
      date: realDate.toISOString(),
      note: note.trim() || undefined,
      categoryColor: resolvedCatColor,
      categoryIcon: currentCategoryObj?.icon || selectedCategory,
    };

    if (editingTransaction && onUpdate) {
      onUpdate(editingTransaction.id, txData);
    } else {
      onSave(txData);
    }
    onClose();
  };

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (editingTransaction && onDelete) {
      onDelete(editingTransaction.id);
      setIsDeleteConfirmOpen(false);
      onClose();
    }
  };

  const openDatePicker = () => {
    const d = realDate;
    setCalMonth(d.getMonth());
    setCalYear(d.getFullYear());
    setCalDay(d.getDate());

    let h = d.getHours();
    const isPm = h >= 12;
    setCalAmPm(isPm ? "PM" : "AM");
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    setCalHour(h);
    setCalMinute(d.getMinutes());

    setIsDatePickerOpen(true);
  };

  const confirmDatePicker = () => {
    let finalHour = calHour;
    if (calAmPm === "PM" && finalHour < 12) finalHour += 12;
    if (calAmPm === "AM" && finalHour === 12) finalHour = 0;

    const d = new Date(calYear, calMonth, calDay, finalHour, calMinute);
    setRealDate(d);
    setIsDatePickerOpen(false);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDayIndex = getFirstDayOfMonth(calYear, calMonth);

  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const bgModal = isLight ? "#FFFFFF" : "#121824";
  const textColor = isLight ? "#0F172A" : "#F8FAFC";
  const subtextColor = isLight ? "#64748B" : "#94A3B8";

  const typeColor =
    type === "expense" ? "#EF4444" : type === "income" ? "#10B981" : "#0284C7";

  return (
    <>
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            justifyContent: "flex-end",
            alignItems: "center",
            position: (Platform.OS === "web" ? "fixed" : "relative") as any,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: (Platform.OS === "web" ? "100vw" : "100%") as any,
            height: (Platform.OS === "web" ? "100vh" : "100%") as any,
            zIndex: 99999,
          }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: bgModal,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              borderWidth: 1,
              borderColor: isLight ? "rgba(0,0,0,0.06)" : "#30363D",
              paddingTop: Math.max(insets.top, 16),
              paddingBottom: Math.max(insets.bottom, 22) + 28,
              paddingHorizontal: 16,
              alignItems: "center",
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 20,
            }}
          >
            <View
              style={{
                width: "100%",
                minHeight: 52,
                paddingTop: 4,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 0,
                paddingBottom: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: "Plus Jakarta Sans",
                  fontSize: 18,
                  fontWeight: "700",
                  color: textColor,
                  letterSpacing: -0.3,
                }}
              >
                {editingTransaction ? "Edit Record" : "Add Record"}
              </Text>
              <Pressable
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isLight ? "#F1F5F9" : "#1E293B",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} color={subtextColor} />
              </Pressable>
            </View>

            <View
              style={{
                width: "100%",
                backgroundColor: bgModal,
                paddingTop: 8,
                paddingBottom: 16,
                gap: 16,
              }}
            >
              <View style={{ width: "100%" }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    paddingBottom: 10,
                  }}
                >
                  {(["expense", "income", "transfer"] as TransactionType[]).map(
                    (t) => {
                      const isActive = type === t;
                      const activeText = isActive
                        ? t === "expense"
                          ? "#EF4444"
                          : t === "income"
                            ? "#10B981"
                            : "#0284C7"
                        : subtextColor;
                      return (
                        <Pressable
                          key={t}
                          style={{
                            flex: 1,
                            alignItems: "center",
                            paddingVertical: 4,
                          }}
                          onPress={() => handleTypeChange(t)}
                        >
                          <Text
                            style={{
                              fontFamily: "Plus Jakarta Sans",
                              fontSize: 14,
                              fontWeight: isActive ? "700" : "500",
                              color: activeText,
                              textTransform: "capitalize",
                            }}
                          >
                            {t}
                          </Text>
                        </Pressable>
                      );
                    },
                  )}
                </View>
                <View
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 1,
                    backgroundColor: isLight ? "#E4E4E7" : "#1E293B",
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      top: -1,
                      left:
                        type === "expense"
                          ? "0%"
                          : type === "income"
                            ? "33.33%"
                            : "66.66%",
                      width: "33.33%",
                      height: 3,
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: "65%",
                        height: 3,
                        borderRadius: 1.5,
                        backgroundColor:
                          type === "expense"
                            ? "#EF4444"
                            : type === "income"
                              ? "#10B981"
                              : "#0284C7",
                      }}
                    />
                  </View>
                </View>
              </View>

              <Pressable
                onPress={openCalculator}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: subtextColor,
                    textTransform: "capitalize",
                    marginBottom: 4,
                    textAlign: "center",
                  }}
                >
                  {type}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 26,
                      fontWeight: "700",
                      color: typeColor,
                      textAlign: "center",
                    }}
                  >
                    {currency.symbol || "PKR"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "700",
                      color: typeColor,
                      textAlign: "center",
                      padding: 0,
                    }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {amount || "0.00"}
                  </Text>
                </View>
              </Pressable>
            </View>

            <View
              style={{
                width: "100%",
                flex: 1,
                overflow: "hidden",
              }}
            >
              <ScrollView
                ref={formScrollViewRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="none"
                automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
                bounces={true}
                overScrollMode="never"
                contentContainerStyle={{
                  paddingBottom: keyboardHeight > 0 ? keyboardHeight + 140 : 32,
                }}
                style={{
                  width: "100%",
                  flex: 1,
                }}
              >
                {type !== "transfer" ? (
                  <Pressable
                    style={{
                      width: "100%",
                      minHeight: 84,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 18,
                      paddingHorizontal: 0,
                    }}
                    onPress={() => {
                      setSelectingAccountTarget("from");
                      setIsSelectAccountModalOpen(true);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily:
                            Platform.OS === "ios" ? "Poppins" : "sans-serif",
                          fontWeight: "500",
                          fontSize: 12,
                          lineHeight: 18,
                          color: "#71717A",
                          marginBottom: 4,
                        }}
                      >
                        Account
                      </Text>
                      <Text
                        style={{
                          fontSize: 16.5,
                          fontWeight: "600",
                          color: textColor,
                        }}
                      >
                        {accounts.find((a) => a.id === selectedAccountId)
                          ?.name || "Credit Card"}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: isLight ? "#F4F4F5" : "#1E293B",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CreditCard size={18} color={textColor} />
                    </View>
                  </Pressable>
                ) : (
                  <>
                    <Pressable
                      style={{
                        width: "100%",
                        minHeight: 84,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: 18,
                        paddingHorizontal: 0,
                      }}
                      onPress={() => {
                        setSelectingAccountTarget("from");
                        setIsSelectAccountModalOpen(true);
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily:
                              Platform.OS === "ios" ? "Poppins" : "sans-serif",
                            fontWeight: "500",
                            fontSize: 12,
                            lineHeight: 18,
                            color: "#71717A",
                            marginBottom: 4,
                          }}
                        >
                          From Account
                        </Text>
                        <Text
                          style={{
                            fontSize: 16.5,
                            fontWeight: "600",
                            color: textColor,
                          }}
                        >
                          {accounts.find((a) => a.id === selectedAccountId)
                            ?.name || "Credit Card"}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: isLight ? "#F4F4F5" : "#1E293B",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CreditCard size={18} color={textColor} />
                      </View>
                    </Pressable>

                    <View
                      style={{
                        width: "100%",
                        height: 1,
                        backgroundColor: isLight ? "#E4E4E7" : "#1E293B",
                      }}
                    />

                    <Pressable
                      style={{
                        width: "100%",
                        minHeight: 84,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: 18,
                        paddingHorizontal: 0,
                      }}
                      onPress={() => {
                        setSelectingAccountTarget("to");
                        setIsSelectAccountModalOpen(true);
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily:
                              Platform.OS === "ios" ? "Poppins" : "sans-serif",
                            fontWeight: "500",
                            fontSize: 12,
                            lineHeight: 18,
                            color: "#71717A",
                            marginBottom: 4,
                          }}
                        >
                          To Account
                        </Text>
                        <Text
                          style={{
                            fontSize: 16.5,
                            fontWeight: "600",
                            color: textColor,
                          }}
                        >
                          {accounts.find((a) => a.id === toAccountId)?.name ||
                            accounts[1]?.name ||
                            "Savings"}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: isLight ? "#F4F4F5" : "#1E293B",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CreditCard size={18} color={textColor} />
                      </View>
                    </Pressable>
                  </>
                )}

                <View
                  style={{
                    width: "100%",
                    height: 1,
                    backgroundColor: isLight ? "#E4E4E7" : "#1E293B",
                  }}
                />

                {type !== "transfer" && (
                  <>
                    <Pressable
                      onPress={() => setIsCategoryModalOpen(true)}
                      style={{
                        width: "100%",
                        minHeight: 84,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: 18,
                        paddingHorizontal: 0,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily:
                              Platform.OS === "ios" ? "Poppins" : "sans-serif",
                            fontWeight: "500",
                            fontSize: 12,
                            lineHeight: 18,
                            color: "#71717A",
                            marginBottom: 4,
                          }}
                        >
                          Category
                        </Text>
                        <Text
                          style={{
                            fontSize: 16.5,
                            fontWeight: "600",
                            color: textColor,
                          }}
                        >
                          {selectedCategory ||
                            currentCategoryObj?.name ||
                            "Transport"}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: resolvedCatColor
                            ? resolvedCatColor + "22"
                            : isLight
                              ? "#F4F4F5"
                              : "#1E293B",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        <CategoryIconView
                          iconName={
                            currentCategoryObj?.icon || selectedCategory
                          }
                          color={resolvedCatColor}
                          size={20}
                          containerSize={44}
                          customBg={resolvedCatColor + "22"}
                          customColor={resolvedCatColor}
                          isLight={isLight}
                        />
                      </View>
                    </Pressable>

                    <View
                      style={{
                        width: "100%",
                        height: 1,
                        backgroundColor: isLight ? "#E4E4E7" : "#1E293B",
                      }}
                    />
                  </>
                )}

                {type !== "transfer" && (
                  <>
                    <View
                      style={{
                        width: "100%",
                        paddingVertical: 18,
                        paddingHorizontal: 0,
                        gap: 12,
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily:
                            Platform.OS === "ios" ? "Poppins" : "sans-serif",
                          fontWeight: "500",
                          fontSize: 12,
                          lineHeight: 18,
                          color: "#71717A",
                        }}
                      >
                        Subcategory
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                          gap: 10,
                          alignItems: "center",
                        }}
                        style={{
                          width: "100%",
                          height: 44,
                        }}
                      >
                        {subcategories.map((sub) => {
                          const isSel =
                            (selectedSubcategory || "").toLowerCase() ===
                            sub.name.toLowerCase();
                          const accountIconBg = isLight ? "#F0F4FF" : "#1E293B";
                          const subColor =
                            sub.color || getCategoryColor(sub.name);
                          return (
                            <Pressable
                              key={sub.id || sub.name}
                              onPress={() => setSelectedSubcategory(sub.name)}
                              style={{
                                height: 38,
                                borderRadius: 19,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                gap: 6,
                                borderWidth: 1,
                                borderColor: isSel
                                  ? isLight
                                    ? "#CBD5E1"
                                    : "#475569"
                                  : isLight
                                    ? "#E2E8F0"
                                    : "#30363D",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: isSel
                                  ? accountIconBg
                                  : isLight
                                    ? "#FFFFFF"
                                    : "#161B22",
                              }}
                            >
                              <CategoryIconView
                                iconName={sub.icon || sub.name}
                                color={subColor}
                                size={12}
                                containerSize={24}
                                borderRadius={12}
                                customBg={
                                  subColor
                                    ? subColor + "22"
                                    : isLight
                                      ? "#E2E8F0"
                                      : "#334155"
                                }
                                customColor={subColor}
                              />
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: isSel ? "600" : "500",
                                  color: isSel
                                    ? isLight
                                      ? "#002F52"
                                      : "#FFFFFF"
                                    : isLight
                                      ? "#1E293B"
                                      : "#CBD5E1",
                                }}
                              >
                                {sub.name}
                              </Text>
                            </Pressable>
                          );
                        })}

                        <Pressable
                          onPress={handleOpenAddSubModal}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 19,
                            borderWidth: 1,
                            borderColor: isLight ? "#E2E8F0" : "#30363D",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: isLight ? "#FFFFFF" : "#161B22",
                          }}
                        >
                          <Plus
                            size={16}
                            color={isLight ? "#012E4F" : "#E2E8F0"}
                          />
                        </Pressable>
                      </ScrollView>
                    </View>

                    <View
                      style={{
                        width: "100%",
                        height: 1,
                        backgroundColor: isLight ? "#E4E4E7" : "#1E293B",
                      }}
                    />
                  </>
                )}

                <Pressable
                  onPress={openDatePicker}
                  style={{
                    width: "100%",
                    minHeight: 84,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 18,
                    paddingHorizontal: 0,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === "ios" ? "Poppins" : "sans-serif",
                        fontWeight: "500",
                        fontSize: 12,
                        lineHeight: 18,
                        color: "#71717A",
                        marginBottom: 4,
                      }}
                    >
                      Date & Time
                    </Text>
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === "ios" ? "Poppins" : "sans-serif",
                        fontWeight: "700",
                        fontSize: 14.5,
                        lineHeight: 21,
                        color: textColor,
                      }}
                    >
                      {dateStr}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: isLight ? "#F4F4F5" : "#1E293B",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Calendar size={18} color={textColor} />
                  </View>
                </Pressable>

                <View
                  style={{
                    width: "100%",
                    height: 1,
                    backgroundColor: isLight ? "#E4E4E7" : "#1E293B",
                  }}
                />

                <Pressable
                  onPress={() => {
                    noteInputRef.current?.focus();
                    scrollToNote();
                  }}
                  style={{
                    width: "100%",
                    minHeight: 84,
                    justifyContent: "center",
                    paddingVertical: 18,
                    paddingHorizontal: 0,
                  }}
                >
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === "ios" ? "Poppins" : "sans-serif",
                      fontWeight: "500",
                      fontSize: 12,
                      lineHeight: 18,
                      color: "#71717A",
                      marginBottom: 6,
                    }}
                  >
                    Notes
                  </Text>
                  <TextInput
                    ref={noteInputRef}
                    style={{
                      fontSize: 16.5,
                      fontWeight: "500",
                      color: textColor,
                      padding: 0,
                      height: 28,
                      width: "100%",
                    }}
                    value={note}
                    onChangeText={setNote}
                    placeholder="Add your note here"
                    placeholderTextColor={subtextColor + "70"}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onSubmitEditing={() => Keyboard.dismiss()}
                    onFocus={scrollToNote}
                  />
                </Pressable>
              </ScrollView>
            </View>

            <View
              style={{
                width: "100%",
                marginTop: 12,
                alignItems: "center",
              }}
            >
              {editingTransaction ? (
                <View style={{ width: "100%", gap: 10, alignItems: "center" }}>
                  {onDelete && (
                    <Pressable
                      onPress={handleDelete}
                      style={{
                        width: "100%",
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: isLight
                          ? "#FCE8E6"
                          : "rgba(239, 68, 68, 0.2)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "700",
                          color: "#DC2626",
                        }}
                      >
                        Delete
                      </Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={handleSave}
                    style={{
                      width: "100%",
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: isAmountZero
                        ? isLight
                          ? "rgba(1, 46, 79, 0.38)"
                          : "rgba(56, 189, 248, 0.25)"
                        : isLight
                          ? "#012E4F"
                          : "#38BDF8",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "700",
                        color: isAmountZero
                          ? isLight
                            ? "rgba(255, 255, 255, 0.85)"
                            : "rgba(255, 255, 255, 0.65)"
                          : isLight
                            ? "#FFFFFF"
                            : "#0F172A",
                      }}
                    >
                      Save Changes
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={handleSave}
                  style={{
                    width: "100%",
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: isAmountZero
                      ? isLight
                        ? "rgba(1, 46, 79, 0.38)"
                        : "rgba(56, 189, 248, 0.25)"
                      : isLight
                        ? "#012E4F"
                        : "#38BDF8",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: isAmountZero
                        ? isLight
                          ? "rgba(255, 255, 255, 0.85)"
                          : "rgba(255, 255, 255, 0.65)"
                        : isLight
                          ? "#FFFFFF"
                          : "#0F172A",
                    }}
                  >
                    Add Record
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Record?"
        message="Are you sure you want to delete this record? This action cannot be undone."
        itemDetails={{
          category: selectedCategory || editingTransaction?.category,
          amount: `${type === "income" ? "+" : type === "expense" ? "-" : ""}${currency?.symbol || ""}${amount}`,
          note: note || undefined,
        }}
        isLight={isLight}
      />

      {/* CATEGORY SELECTION MODAL */}
      <Modal
        visible={isCategoryModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setIsCategoryModalOpen(false);
          setIsAddingCat(false);
        }}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
          onPress={() => {
            setIsCategoryModalOpen(false);
            setIsAddingCat(false);
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              borderWidth: 1,
              borderColor: isLight ? "rgba(0,0,0,0.06)" : "#30363D",
              backgroundColor: isLight ? "#FFFFFF" : "#1E293B",
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: Math.max(
                insets.bottom + 16,
                Platform.OS === "android" ? 38 : 28,
              ),
            }}
          >
            <View
              style={{
                width: "100%",
                height: 63,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 4,
              }}
            >
              <View style={{ width: 28, height: 28 }} />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: isLight ? "#111827" : "#FFFFFF",
                  textAlign: "center",
                  fontFamily: Platform.OS === "ios" ? "Poppins" : "sans-serif",
                }}
              >
                Category
              </Text>
              <Pressable
                onPress={() => {
                  setIsCategoryModalOpen(false);
                  setIsAddingCat(false);
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: isLight ? "#F1F5F9" : "#1E293B",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} color={subtextColor} />
              </Pressable>
            </View>

            <ScrollView
              style={{
                width: "100%",
                maxHeight: 280,
                marginTop: 4,
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                  gap: 10,
                  width: "100%",
                }}
              >
                {filteredCategories.map((catItem) => {
                  const isSel =
                    (selectedCategory || "").toLowerCase() ===
                    catItem.name.toLowerCase();
                  const catColor =
                    catItem.color || getCategoryColor(catItem.name);
                  return (
                    <Pressable
                      key={catItem.id || catItem.name}
                      onPress={() => {
                        setSelectedCategory(catItem.name);
                        const subs = getCategorySubcategories(
                          catItem.name,
                          type,
                          catItem.subcategories,
                        );
                        if (subs && subs.length > 0) {
                          setSelectedSubcategory(subs[0].name);
                        } else {
                          setSelectedSubcategory("");
                        }
                        setIsCategoryModalOpen(false);
                      }}
                      style={{
                        width: "22.5%",
                        aspectRatio: 0.92,
                        backgroundColor: isSel
                          ? isLight
                            ? "#F0F4FF"
                            : "#1E293B"
                          : isLight
                            ? "#F3F4F6"
                            : "#161B22",
                        borderRadius: 18,
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 4,
                        borderWidth: isSel ? 2 : 1,
                        borderColor: isSel
                          ? isLight
                            ? "#012E4F"
                            : "#38BDF8"
                          : isLight
                            ? "#E5E7EB"
                            : "#30363D",
                      }}
                    >
                      <View
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          backgroundColor: catColor + "22",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 4,
                        }}
                      >
                        <CategoryIconView
                          iconName={catItem.icon || catItem.name}
                          color={catColor}
                          size={22}
                          containerSize={34}
                          borderRadius={10}
                          customBg="transparent"
                          customColor={catColor}
                          isLight={isLight}
                        />
                      </View>
                      <Text
                        numberOfLines={1}
                        style={{
                          color: isSel
                            ? isLight
                              ? "#012E4F"
                              : "#FFFFFF"
                            : isLight
                              ? "#4B5563"
                              : "#9CA3AF",
                          fontWeight: isSel ? "700" : "500",
                          fontSize: 12.5,
                          textAlign: "center",
                        }}
                      >
                        {catItem.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* CALCULATOR OVERLAY MODAL */}
      <Modal
        visible={isCalculatorOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCalculatorOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
          onPress={() => setIsCalculatorOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              borderWidth: 1,
              borderColor: isLight ? "rgba(0,0,0,0.06)" : "#30363D",
              backgroundColor: isLight ? "#FFFFFF" : "#1E293B",
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: Math.max(insets.bottom, 20) + 12,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                marginBottom: 14,
                opacity: 0.6,
                backgroundColor: isLight ? "#E4E4E7" : "#3F3F46",
                alignSelf: "center",
              }}
            />
            <Text
              style={{
                fontFamily: "Plus Jakarta Sans",
                fontSize: 13,
                fontWeight: "500",
                color: subtextColor,
                marginBottom: 4,
              }}
            >
              Amount
            </Text>
            <Text
              style={{
                fontFamily: "Plus Jakarta Sans",
                fontSize: 42,
                fontWeight: "700",
                color: textColor,
                marginBottom: 14,
                textAlign: "center",
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {calcAmount || "0"}
            </Text>

            <View
              style={{
                width: "100%",
                maxWidth: 360,
                paddingHorizontal: 16,
                gap: 14,
                marginVertical: 12,
              }}
            >
              {[
                ["1", "2", "3"],
                ["4", "5", "6"],
                ["7", "8", "9"],
                [".", "0", "back"],
              ].map((row, rIdx) => (
                <View
                  key={rIdx}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    alignItems: "center",
                  }}
                >
                  {row.map((btnKey) => (
                    <Pressable
                      key={btnKey}
                      onPress={() => handleCalcKeyPress(btnKey)}
                      style={({ pressed }) => ({
                        width: 80,
                        height: 52,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 16,
                        backgroundColor: pressed
                          ? isLight
                            ? "#F1F5F9"
                            : "#1E293B"
                          : "transparent",
                      })}
                    >
                      {btnKey === "back" ? (
                        <Delete size={24} color={textColor} />
                      ) : (
                        <Text
                          style={{
                            fontFamily: "Plus Jakarta Sans",
                            fontSize: 28,
                            fontWeight: "500",
                            color: textColor,
                          }}
                        >
                          {btnKey}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => {
                setAmount(calcAmount);
                setIsCalculatorOpen(false);
              }}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 14,
                backgroundColor: "#012E4F",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" }}
              >
                Save
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <SelectAccountModal
        isOpen={isSelectAccountModalOpen}
        onClose={() => setIsSelectAccountModalOpen(false)}
        accounts={accounts}
        currency={currency}
        selectedAccountId={
          selectingAccountTarget === "to" ? toAccountId : selectedAccountId
        }
        onSelectAccount={(accId) => {
          if (accId) {
            if (selectingAccountTarget === "to") {
              setToAccountId(accId);
            } else {
              setSelectedAccountId(accId);
            }
          }
        }}
        totalBalance={accounts.reduce((sum, a) => sum + (a.balance || 0), 0)}
        showTotalBalance={false}
        isLight={isLight}
      />
    </>
  );
};

export default AddTransactionModal;