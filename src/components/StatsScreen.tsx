import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Tag
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { Currency, Transaction } from "../types";
import { getCategoryColor } from "../utils/categoryColors";
import { formatNumberWithCommas } from "../utils/formatters";
import { renderIconComponent } from "./CategoryIconView";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { SwipeableItem } from "./SwipeableItem";
import { TopBarCalendarModal } from "./TopBarCalendarModal";

interface StatsScreenProps {
  transactions: Transaction[];
  currency: Currency;
  onBack?: () => void;
  isLight?: boolean;
  onPressTransaction?: (tx: Transaction) => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  categories?: any[];
  accounts?: any[];
}

type TimeFilterType = "Weekly" | "Monthly" | "Annually" | "Period";

const getCategoryIcon = (
  categoryName: string,
  size = 16,
  color = "#64748B",
  customIconName?: string,
) => {
  return renderIconComponent(customIconName || categoryName, size, color);
};

const EXPENSE_COLOR = "#EB5B52";
const INCOME_COLOR = "#10B981";

const formatMonthYear = (date: Date) => {
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
  return `${monthsShort[date.getMonth()]} ${date.getFullYear()}`;
};

const parseSelectedMonth = (monthStr: string) => {
  if (!monthStr) {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  }
  const parts = monthStr.trim().split(/\s+/);
  let mName = (parts[0] || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  let yearStr = parts[1] || parts[2] || "";
  if (/^\d+$/.test(mName) && parseInt(mName, 10) > 12) {
    yearStr = parts[0];
    mName = (parts[1] || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  }

  const monthNum = parseInt(mName, 10);
  if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
    return {
      month: monthNum - 1,
      year: parseInt(yearStr, 10) || new Date().getFullYear(),
    };
  }

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

  const parsedMonthIndex = monthMap[mName];
  return {
    month:
      parsedMonthIndex !== undefined ? parsedMonthIndex : new Date().getMonth(),
    year: parseInt(yearStr, 10) || new Date().getFullYear(),
  };
};

const parseTxDate = (dateVal: any): Date => {
  if (!dateVal) return new Date();
  if (dateVal instanceof Date) return dateVal;
  if (typeof dateVal === "number") return new Date(dateVal);
  if (typeof dateVal === "string") {
    const cleanStr = dateVal.trim();
    const isoMatch = cleanStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      const y = parseInt(isoMatch[1], 10);
      const m = parseInt(isoMatch[2], 10) - 1;
      const d = parseInt(isoMatch[3], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    const slashMatch = cleanStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (slashMatch) {
      const p1 = parseInt(slashMatch[1], 10);
      const p2 = parseInt(slashMatch[2], 10);
      const y = parseInt(slashMatch[3], 10);
      let m = p1 - 1;
      let d = p2;
      if (p1 > 12) {
        d = p1;
        m = p2 - 1;
      }
      return new Date(y, m, d);
    }
    const dObj = new Date(cleanStr);
    if (!isNaN(dObj.getTime())) {
      return new Date(
        dObj.getUTCFullYear(),
        dObj.getUTCMonth(),
        dObj.getUTCDate(),
      );
    }
  }
  return new Date(dateVal);
};

export const StatsScreen: React.FC<StatsScreenProps> = ({
  transactions = [],
  currency = {
    code: "PKR",
    symbol: "PKR ",
    name: "Pakistani Rupee",
    position: "prefix",
  },
  onBack,
  isLight = true,
  onPressTransaction,
  onEditTransaction,
  onDeleteTransaction,
  categories = [],
  accounts = [],
}) => {
  const [activeType, setActiveType] = useState<"expense" | "income">("expense");
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>("Monthly");
  const [showPeriodTabs, setShowPeriodTabs] = useState(false);

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const [selectedMonth, setSelectedMonth] = useState(() => {
    return formatMonthYear(new Date());
  });

  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(
    null,
  );

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const touchStartX = React.useRef(0);

  const { month: parsedMonth, year: parsedYear } =
    parseSelectedMonth(selectedMonth);
  const totalDays = new Date(parsedYear, parsedMonth + 1, 0).getDate();
  const calendarDays = Array.from({ length: totalDays }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    const { month, year } = parseSelectedMonth(selectedMonth);
    const prevDate = new Date(year, month - 1, 1);
    const newMonthStr = formatMonthYear(prevDate);
    setSelectedMonth(newMonthStr);
    const maxDaysInNewMonth = new Date(year, month, 0).getDate();
    if (selectedCalendarDay !== null) {
      const clampedDay = Math.min(selectedCalendarDay, maxDaysInNewMonth);
      setSelectedCalendarDay(clampedDay);
      setCurrentDate(
        new Date(prevDate.getFullYear(), prevDate.getMonth(), clampedDay),
      );
    } else {
      setCurrentDate(prevDate);
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
      setCurrentDate(
        new Date(nextDate.getFullYear(), nextDate.getMonth(), clampedDay),
      );
    } else {
      setCurrentDate(nextDate);
    }
  };

  const topBarCalendarLabel = useMemo(() => {
    if (selectedCalendarDay !== null) {
      return `${selectedCalendarDay} ${selectedMonth.toUpperCase()}`;
    }
    return selectedMonth.toUpperCase();
  }, [selectedCalendarDay, selectedMonth]);

  const cardPeriodLabel = useMemo(() => {
    if (timeFilter === "Weekly") {
      const start = new Date(currentDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.getDate()} - ${end.getDate()} ${end.toLocaleDateString("en-US", { month: "short" })}`;
    }
    if (timeFilter === "Monthly") {
      if (selectedCalendarDay !== null) {
        const monthShort = new Date(
          parsedYear,
          parsedMonth,
          1,
        ).toLocaleDateString("en-US", { month: "short" });
        return `${selectedCalendarDay} ${monthShort} ${parsedYear}`;
      }
      const lastDay = new Date(parsedYear, parsedMonth + 1, 0).getDate();
      const monthShort = new Date(
        parsedYear,
        parsedMonth,
        1,
      ).toLocaleDateString("en-US", { month: "short" });
      return `1 - ${lastDay} ${monthShort} ${parsedYear}`;
    }
    if (timeFilter === "Annually") {
      return `1 Jan - 31 Dec`;
    }
    return "All Records";
  }, [currentDate, timeFilter, selectedCalendarDay, parsedMonth, parsedYear]);

  const donutCenterLabel = useMemo(() => {
    if (showPeriodTabs) {
      return activeType === "expense" ? "Spent" : "Earned";
    }
    return activeType === "expense" ? "Expense" : "Income";
  }, [showPeriodTabs, activeType]);

  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter((tx) => {
      if (!tx || !tx.date) return false;
      const txType = (tx.type || "").toString().toLowerCase();
      if (txType !== activeType.toLowerCase()) return false;

      const txDate = parseTxDate(tx.date);
      if (!txDate || isNaN(txDate.getTime())) return false;

      if (timeFilter === "Weekly") {
        const start = new Date(currentDate);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        return txDate >= start && txDate <= end;
      }

      if (timeFilter === "Monthly") {
        if (selectedCalendarDay !== null) {
          return (
            txDate.getDate() === selectedCalendarDay &&
            txDate.getMonth() === parsedMonth &&
            txDate.getFullYear() === parsedYear
          );
        }
        return (
          txDate.getMonth() === parsedMonth &&
          txDate.getFullYear() === parsedYear
        );
      }

      if (timeFilter === "Annually") {
        return txDate.getFullYear() === parsedYear;
      }

      return true;
    });
  }, [
    transactions,
    activeType,
    timeFilter,
    currentDate,
    selectedCalendarDay,
    parsedMonth,
    parsedYear,
  ]);

  const { categoryItems, totalAmount } = useMemo(() => {
    const total = filteredTransactions.reduce(
      (acc, t) => acc + (t.amount || 0),
      0,
    );
    const map: Record<
      string,
      { amount: number; color?: string; iconName?: string }
    > = {};

    filteredTransactions.forEach((tx) => {
      const cat = tx.category || "Other";
      if (!map[cat]) {
        map[cat] = {
          amount: 0,
          color: (tx as any).categoryColor,
          iconName: (tx as any).categoryIcon,
        };
      }
      map[cat].amount += tx.amount || 0;
      if ((tx as any).categoryColor) {
        map[cat].color = (tx as any).categoryColor;
      }
      if ((tx as any).categoryIcon) {
        map[cat].iconName = (tx as any).categoryIcon;
      }
    });

    const items = Object.entries(map).map(([name, data]) => {
      const catObj = (categories || []).find(
        (c: any) =>
          c &&
          c.name &&
          c.name.trim().toLowerCase() === name.trim().toLowerCase(),
      );
      const color = data.color || catObj?.color || getCategoryColor(name);
      const iconName = data.iconName || catObj?.icon || name;
      const percentage = total > 0 ? (data.amount / total) * 100 : 0;
      return {
        id: `cat-${name}`,
        name,
        amount: data.amount,
        color,
        iconName,
        percentage,
      };
    });

    items.sort((a, b) => b.amount - a.amount);
    return { categoryItems: items, totalAmount: total };
  }, [filteredTransactions, categories]);

  const formattedDonutAmount = useMemo(() => {
    return totalAmount.toFixed(2);
  }, [totalAmount]);

  const topBadges = useMemo(() => {
    return categoryItems.slice(0, 3).map((item) => ({
      label: item.name,
      amount: Math.round(item.amount).toString(),
      color: item.color,
    }));
  }, [categoryItems]);

  const donutSegments = useMemo(() => {
    if (totalAmount === 0 || categoryItems.length === 0) return [];
    const segments: {
      id: string;
      color: string;
      startAngle: number;
      endAngle: number;
    }[] = [];
    let currentAngle = 10;
    const gap = categoryItems.length > 1 ? 8 : 0;
    const totalGapDegrees = gap * categoryItems.length;
    const availableDegrees = 360 - totalGapDegrees;

    categoryItems.forEach((item) => {
      const segmentSize = Math.max(
        0.1,
        (item.percentage / 100) * availableDegrees,
      );
      const endAngle = currentAngle + segmentSize;
      segments.push({
        id: item.id,
        color: item.color,
        startAngle: currentAngle,
        endAngle: endAngle,
      });
      currentAngle = endAngle + gap;
    });

    return segments;
  }, [categoryItems, totalAmount]);

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number,
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
  ) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(" ");
  };

  const selectedCategoryTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    return (filteredTransactions || [])
      .filter(
        (tx) =>
          tx &&
          (tx.category || "").toLowerCase() === selectedCategory.toLowerCase(),
      )
      .sort(
        (a, b) => parseTxDate(b.date).getTime() - parseTxDate(a.date).getTime(),
      );
  }, [filteredTransactions, selectedCategory]);

  const selectedCategoryPeriodTotal = useMemo(() => {
    if (!selectedCategory) return 0;
    return selectedCategoryTransactions.reduce(
      (sum, tx) => sum + (tx.amount || 0),
      0,
    );
  }, [selectedCategoryTransactions]);

  const shouldScrollStats = useMemo(() => {
    return categoryItems.length > 0;
  }, [categoryItems.length]);

  const shouldScrollDrilldown = useMemo(() => {
    return selectedCategoryTransactions.length > 0;
  }, [selectedCategoryTransactions.length]);

  const monthlyCategoryHistory = useMemo(() => {
    if (!selectedCategory) return { data: [], maxVal: 1 };
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
    const data = months.map((m, idx) => ({
      month: m,
      monthIndex: idx,
      amount: 0,
    }));

    (transactions || []).forEach((tx) => {
      if (!tx || !tx.date) return;
      if ((tx.type || "").toString().toLowerCase() !== activeType.toLowerCase())
        return;
      if ((tx.category || "").toLowerCase() !== selectedCategory.toLowerCase())
        return;
      const d = parseTxDate(tx.date);
      if (d.getFullYear() === parsedYear) {
        const mIdx = d.getMonth();
        if (data[mIdx]) {
          data[mIdx].amount += tx.amount || 0;
        }
      }
    });

    const maxVal = Math.max(...data.map((d) => d.amount), 1);
    return { data, maxVal };
  }, [transactions, selectedCategory, activeType, parsedYear]);

  const handlePressTransaction = (tx: Transaction) => {
    if (onPressTransaction) {
      onPressTransaction(tx);
    } else if (onEditTransaction) {
      onEditTransaction(tx);
    }
  };

  const bg = isLight ? "#FFFFFF" : "#0D1117";
  const textPrimary = isLight ? "#0B2E4F" : "#FFFFFF";
  const textSecondary = isLight ? "#64748B" : "#94A3B8";
  const cardBorder = isLight ? "#E2E8F0" : "#30363D";
  const btnBg = isLight ? "#FFFFFF" : "#161B22";
  const selectBg = isLight ? "#F0F4FA" : "#161B22";

  const renderCalendarModal = () => (
    <TopBarCalendarModal
      visible={isDatePickerOpen}
      onClose={() => setIsDatePickerOpen(false)}
      selectedMonth={selectedMonth}
      selectedCalendarDay={selectedCalendarDay}
      onSelectDay={(day, date) => {
        setSelectedCalendarDay(day);
        setCurrentDate(date);
      }}
      onSelectAllMonth={(date) => {
        setSelectedCalendarDay(null);
        setCurrentDate(date);
      }}
      isLight={isLight}
    />
  );

  if (selectedCategory) {
    const isExpense = activeType === "expense";
    const waveColor = isExpense ? EXPENSE_COLOR : INCOME_COLOR;
    const monthData = monthlyCategoryHistory.data;
    const maxVal = monthlyCategoryHistory.maxVal;

    const peakMonth = monthData.reduce<null | {
      month: string;
      monthIndex: number;
      amount: number;
    }>((highest, current) => {
      if (current.amount > 0 && (!highest || current.amount > highest.amount)) {
        return current;
      }
      return highest;
    }, null);

    const currentMonthAmt = monthData[parsedMonth]?.amount || 0;
    const prevMonthAmt =
      monthData[parsedMonth > 0 ? parsedMonth - 1 : 11]?.amount || 0;
    const pctChange =
      prevMonthAmt > 0
        ? `${(currentMonthAmt - prevMonthAmt) / prevMonthAmt >= 0 ? "+" : ""}${Math.round(((currentMonthAmt - prevMonthAmt) / prevMonthAmt) * 100)}%`
        : currentMonthAmt > 0
          ? "+100%"
          : "0%";

    const displayTotal = selectedCategoryPeriodTotal;

    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <View style={[styles.fixedTopContainer, { backgroundColor: bg }]}>
          <View
            style={[
              styles.statisticsHeaderRow,
              {
                borderBottomColor: isLight ? "#E2E8F0" : "#30363D",
                backgroundColor: bg,
              },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                flex: 1,
              }}
            >
              <Pressable
                style={[styles.drilldownBackBtn, { backgroundColor: selectBg }]}
                onPress={() => setSelectedCategory(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Back"
              >
                <ChevronLeft
                  size={18}
                  color={isLight ? "#0F2C4C" : "#FFFFFF"}
                  strokeWidth={2.4}
                />
              </Pressable>
              <View
                style={{
                  height: 38,
                  justifyContent: "center",
                  paddingTop: 8,
                  flex: 1,
                }}
              >
                <Text
                  style={[
                    styles.mainTitle,
                    { color: isLight ? "#012E4F" : "#FFFFFF" },
                  ]}
                  numberOfLines={1}
                >
                  {selectedCategory.toUpperCase()}
                </Text>
              </View>
            </View>
            <Pressable
              style={[
                styles.circleActionButton,
                { backgroundColor: isLight ? "#EAEFF5" : "#21262D" },
              ]}
              onPress={() => setIsDatePickerOpen(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Select Date"
            >
              <CalendarIcon
                size={18}
                color={isLight ? "#012E4F" : "#FFFFFF"}
                strokeWidth={2.2}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={[
            styles.scrollView,
            !shouldScrollDrilldown && { overflow: "hidden" },
          ]}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 16 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={shouldScrollDrilldown}
          bounces={false}
          overScrollMode="never"
        >
          <View style={styles.drilldownHeroCard}>
            <View style={styles.vectorDesign} pointerEvents="none">
              <Svg width={179.78} height={161.84} viewBox="0 0 180 162">
                <Path
                  d="M 180,0 L 55,0 C 24,0 0,24 0,55 C 0,85 28,95 48,115 C 68,135 88,162 125,162 C 160,162 180,140 180,105 Z"
                  fill="#BA8585"
                />
              </Svg>
            </View>

            <View style={styles.drilldownHeroLeft}>
              <Text style={styles.drilldownHeroCurrency}>
                {currency.symbol.trim() || "PKR"}
              </Text>
              <Text style={styles.drilldownHeroAmount}>
                {"  " + formatNumberWithCommas(displayTotal, 2)}
              </Text>
            </View>

            <View style={styles.drilldownWaveWrapper} pointerEvents="none">
              <Svg width={115} height={80} viewBox="0 0 115 80">
                <Path
                  d="M 10,0 C 22,22 8,40 38,62 C 54,74 76,78 115,80 L 115,0 Z"
                  fill="#002138"
                  opacity={0.8}
                />
                <Path
                  d="M 38,0 C 44,20 22,34 54,54 C 70,66 88,75 115,80 L 115,0 Z"
                  fill={waveColor}
                />
              </Svg>
            </View>
          </View>

          <View
            style={[
              styles.middleCard,
              { backgroundColor: btnBg, borderColor: cardBorder },
            ]}
          >
            <View style={styles.middleCardHeader}>
              <Text style={[styles.middleCardTitle, { color: textPrimary }]}>
                Last 12 Months ({parsedYear})
              </Text>
              <View style={[styles.pctBadge, { backgroundColor: waveColor }]}>
                <Text style={styles.pctBadgeText}>{pctChange}</Text>
              </View>
            </View>

            <View style={styles.barChartContainer}>
              <View style={styles.barsRow}>
                {monthData.map((item) => {
                  const isPeak =
                    peakMonth &&
                    peakMonth.month === item.month &&
                    peakMonth.amount > 0;
                  const isSelectedMonth = item.monthIndex === parsedMonth;
                  const barHeight =
                    maxVal > 0 && item.amount > 0
                      ? Math.max(14, (item.amount / maxVal) * 150)
                      : 14;

                  return (
                    <Pressable
                      key={item.month}
                      style={styles.barColumn}
                      onPress={() => {
                        const targetDate = new Date(
                          parsedYear,
                          item.monthIndex,
                          1,
                        );
                        setSelectedMonth(formatMonthYear(targetDate));
                        setCurrentDate(targetDate);
                      }}
                    >
                      <View style={styles.peakLabelSlot}>
                        {isPeak && (
                          <Text
                            style={[
                              styles.peakAmountText,
                              { color: isLight ? "#0F2C4C" : "#FFFFFF" },
                            ]}
                          >
                            {Math.round(item.amount).toLocaleString()}
                          </Text>
                        )}
                      </View>

                      <View
                        style={[
                          isPeak ? styles.peakDot : styles.normalDot,
                          { backgroundColor: waveColor },
                        ]}
                      />

                      <View
                        style={[
                          styles.barStick,
                          {
                            height: barHeight,
                            backgroundColor: waveColor,
                            opacity: isSelectedMonth ? 1 : 0.65,
                          },
                        ]}
                      />

                      <View style={styles.barMonthLabelContainer}>
                        <Text
                          style={[
                            styles.barMonthRotatedLabel,
                            {
                              color: isSelectedMonth
                                ? waveColor
                                : isLight
                                  ? "#0F2C4C"
                                  : "#CBD5E1",
                              fontWeight: isSelectedMonth ? "700" : "500",
                            },
                          ]}
                        >
                          {item.month}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.transactionsSection}>
            <Text
              style={[
                styles.sectionHeaderLabel,
                { color: isLight ? "#0F2C4C" : "#FFFFFF" },
              ]}
            >
              TRANSACTIONS
            </Text>
            {selectedCategoryTransactions.length === 0 ? (
              <View style={[styles.emptyBox, { borderColor: cardBorder }]}>
                <Tag size={24} color={waveColor} />
                <Text style={styles.emptyText}>
                  No {activeType} records in {selectedCategory} for{" "}
                  {cardPeriodLabel}
                </Text>
              </View>
            ) : (
              selectedCategoryTransactions.map((tx) => (
                <SwipeableItem
                  key={tx.id}
                  onDelete={() => setTxToDelete(tx)}
                  isLight={isLight}
                >
                  <Pressable
                    style={[
                      styles.txItem,
                      {
                        backgroundColor: isLight ? "#F8FAFC" : btnBg,
                        borderColor: isLight ? "#F1F5F9" : cardBorder,
                      },
                    ]}
                    onPress={() => handlePressTransaction(tx)}
                    accessibilityRole="button"
                  >
                    <View style={styles.txLeft}>
                      <View
                        style={[
                          styles.txIconBox,
                          {
                            backgroundColor: isExpense ? "#FCECEE" : "#EAFBF3",
                          },
                        ]}
                      >
                        {getCategoryIcon(
                          tx.category || tx.note || "Other",
                          18,
                          waveColor,
                        )}
                      </View>
                      <View style={styles.txMeta}>
                        <Text
                          style={[styles.txNote, { color: textPrimary }]}
                          numberOfLines={1}
                        >
                          {tx.note || tx.category}
                        </Text>
                        <Text
                          style={[styles.txDate, { color: textSecondary }]}
                          numberOfLines={1}
                        >
                          {tx.date
                            ? new Date(tx.date).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Record"}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[styles.txAmount, { color: waveColor }]}
                      numberOfLines={1}
                    >
                      {isExpense ? "-" : "+"}
                      {formatNumberWithCommas(Number(tx.amount || 0), 2)}
                    </Text>
                  </Pressable>
                </SwipeableItem>
              ))
            )}
          </View>
        </ScrollView>

        <DeleteConfirmModal
          visible={!!txToDelete}
          onClose={() => setTxToDelete(null)}
          onConfirm={() => {
            if (txToDelete && onDeleteTransaction) {
              onDeleteTransaction(txToDelete.id);
            }
            setTxToDelete(null);
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

        {renderCalendarModal()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.fixedTopContainer, { backgroundColor: bg }]}>
        <View
          style={[
            styles.statisticsHeaderRow,
            {
              borderBottomColor: isLight ? "#E2E8F0" : "#30363D",
              backgroundColor: bg,
            },
          ]}
        >
          <View style={{ height: 38, justifyContent: "center", paddingTop: 8 }}>
            <Text
              style={[
                styles.mainTitle,
                { color: isLight ? "#012E4F" : "#FFFFFF" },
              ]}
            >
              Statistics
            </Text>
          </View>
          <Pressable
            style={[
              styles.circleActionButton,
              { backgroundColor: isLight ? "#EAEFF5" : "#21262D" },
            ]}
            onPress={() => setIsDatePickerOpen(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Select Date"
          >
            <CalendarIcon
              size={18}
              color={isLight ? "#012E4F" : "#FFFFFF"}
              strokeWidth={2.2}
            />
          </Pressable>
        </View>

        <View
          style={styles.typeTabsRow}
          onTouchStart={(e) => {
            touchStartX.current = e.nativeEvent.pageX;
          }}
          onTouchEnd={(e) => {
            const diff = e.nativeEvent.pageX - touchStartX.current;
            if (Math.abs(diff) > 20) {
              setShowPeriodTabs(true);
            }
          }}
        >
          <Pressable
            style={[
              styles.topThreeTabPill,
              activeType === "expense"
                ? [styles.tabPillActive, { backgroundColor: "#345D7A" }]
                : [
                    styles.tabPillInactive,
                    { backgroundColor: btnBg, borderColor: cardBorder },
                  ],
            ]}
            onPress={() => setActiveType("expense")}
          >
            <Text
              style={[
                styles.tabPillText,
                activeType === "expense"
                  ? styles.tabPillTextActive
                  : { color: textPrimary },
              ]}
            >
              Expense
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.topThreeTabPill,
              activeType === "income"
                ? [styles.tabPillActive, { backgroundColor: "#345D7A" }]
                : [
                    styles.tabPillInactive,
                    { backgroundColor: btnBg, borderColor: cardBorder },
                  ],
            ]}
            onPress={() => setActiveType("income")}
          >
            <Text
              style={[
                styles.tabPillText,
                activeType === "income"
                  ? styles.tabPillTextActive
                  : { color: textPrimary },
              ]}
            >
              Income
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.topThreeTabPill,
              showPeriodTabs
                ? [styles.tabPillActive, { backgroundColor: "#345D7A" }]
                : [
                    styles.tabPillInactive,
                    { backgroundColor: btnBg, borderColor: cardBorder },
                  ],
              styles.dropdownTabPill,
            ]}
            onPress={() => setShowPeriodTabs((prev) => !prev)}
          >
            <Text
              style={[
                styles.tabPillText,
                showPeriodTabs
                  ? styles.tabPillTextActive
                  : { color: textPrimary },
              ]}
            >
              {timeFilter}
            </Text>
            {showPeriodTabs ? (
              <ChevronUp size={14} color="#FFFFFF" strokeWidth={2} />
            ) : (
              <ChevronDown size={14} color={textPrimary} strokeWidth={2} />
            )}
          </Pressable>
        </View>

        {showPeriodTabs && (
          <View style={styles.timeTabsRow}>
            {(
              ["Weekly", "Monthly", "Annually", "Period"] as TimeFilterType[]
            ).map((tab) => {
              const isActive = timeFilter === tab;
              return (
                <Pressable
                  key={tab}
                  style={[
                    styles.periodTabPill,
                    isActive
                      ? [styles.tabPillActive, { backgroundColor: "#345D7A" }]
                      : [
                          styles.tabPillInactive,
                          { backgroundColor: btnBg, borderColor: cardBorder },
                        ],
                  ]}
                  onPress={() => setTimeFilter(tab)}
                >
                  <Text
                    style={[
                      styles.tabPillText,
                      isActive
                        ? styles.tabPillTextActive
                        : { color: textPrimary },
                    ]}
                  >
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <ScrollView
        style={[
          styles.scrollView,
          !shouldScrollStats && { overflow: "hidden" },
        ]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 16 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={shouldScrollStats}
        bounces={false}
        overScrollMode="never"
      >
        <View style={[styles.heroCard, { backgroundColor: "#013459" }]}>
          {showPeriodTabs && (
            <Text style={styles.cardPeriodLabel}>{cardPeriodLabel}</Text>
          )}

          <View style={styles.donutContainer}>
            <Svg width={182} height={182} viewBox="0 0 182 182">
              <Defs>
                <LinearGradient
                  id="paint0_linear_expo"
                  x1="91"
                  y1="0"
                  x2="91"
                  y2="182"
                  gradientUnits="userSpaceOnUse"
                >
                  <Stop offset="0%" stopColor="#8EBAD9" stopOpacity={0.88} />
                  <Stop offset="25%" stopColor="#5B8FB3" stopOpacity={0.92} />
                  <Stop offset="60%" stopColor="#2B5F84" stopOpacity={0.96} />
                  <Stop offset="100%" stopColor="#0E4168" stopOpacity={1} />
                </LinearGradient>
                <LinearGradient
                  id="specular_top_expo"
                  x1="91"
                  y1="0"
                  x2="91"
                  y2="90"
                  gradientUnits="userSpaceOnUse"
                >
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.38} />
                  <Stop offset="45%" stopColor="#FFFFFF" stopOpacity={0.1} />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Circle cx={91} cy={91} r={90} fill="url(#paint0_linear_expo)" />
              <Circle cx={91} cy={91} r={90} fill="url(#specular_top_expo)" />
              <Circle
                cx={91}
                cy={91}
                r={90.5}
                fill="none"
                stroke="#529ECE"
                strokeWidth={1.2}
              />
              {donutSegments.length === 0 ? (
                <Circle
                  cx={91}
                  cy={91}
                  r={74.5}
                  fill="none"
                  stroke="#334155"
                  strokeOpacity={0.3}
                  strokeWidth={10}
                />
              ) : categoryItems.length === 1 ? (
                <Circle
                  cx={91}
                  cy={91}
                  r={74.5}
                  fill="none"
                  stroke={categoryItems[0].color}
                  strokeWidth={10}
                />
              ) : (
                donutSegments.map((seg) => (
                  <Path
                    key={seg.id}
                    d={describeArc(91, 91, 74.5, seg.startAngle, seg.endAngle)}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={10}
                    strokeLinecap="round"
                  />
                ))
              )}
            </Svg>

            <View style={styles.donutCenter}>
              <Text style={styles.donutLabel}>{donutCenterLabel}</Text>
              <Text style={styles.donutAmount} numberOfLines={1}>
                {formattedDonutAmount}
              </Text>
            </View>
          </View>

          {topBadges.length > 0 && (
            <View style={styles.badgesRow}>
              {topBadges.map((badge, idx) => (
                <Pressable
                  key={idx}
                  style={styles.badgePill}
                  onPress={() => setSelectedCategory(badge.label)}
                >
                  <View
                    style={[styles.badgeDot, { backgroundColor: badge.color }]}
                  />
                  <View style={styles.badgeTextCol}>
                    <Text style={styles.badgeName} numberOfLines={1}>
                      {badge.label}
                    </Text>
                    <Text
                      style={[styles.badgeAmount, { color: badge.color }]}
                      numberOfLines={1}
                    >
                      {badge.amount}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.dataCardsContainer}>
          {categoryItems.length === 0 ? (
            <View style={styles.dataCardEmpty}>
              <CalendarIcon size={26} color={textSecondary} />
              <Text style={[styles.emptyText, { color: textSecondary }]}>
                No {activeType} records for {cardPeriodLabel}
              </Text>
            </View>
          ) : (
            <View style={styles.dataCardsList}>
              {categoryItems.map((item) => {
                const barColor = item.color || getCategoryColor(item.name);
                return (
                  <Pressable
                    key={item.id}
                    style={styles.singleDataCard}
                    onPress={() => setSelectedCategory(item.name)}
                  >
                    <View style={styles.categoryTextRow}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: `${barColor}1F`,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {getCategoryIcon(
                            item.name,
                            13,
                            barColor,
                            item.iconName,
                          )}
                        </View>
                        <Text
                          style={[styles.categoryName, { color: textPrimary }]}
                        >
                          {item.name}
                        </Text>
                      </View>
                      <Text
                        style={[styles.categoryAmount, { color: textPrimary }]}
                      >
                        {Math.round(item.amount).toString()}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.progressTrack,
                        { backgroundColor: `${barColor}1F` },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${Math.min(100, Math.max(4, item.percentage))}%`,
                            backgroundColor: barColor,
                          },
                        ]}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {renderCalendarModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  fixedTopContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingTop: 0,
    zIndex: 10,
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: "center",
  },
  drilldownBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statisticsHeaderRow: {
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
  mainTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  circleActionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  typeTabsRow: {
    maxWidth: 412,
    width: "100%",
    paddingHorizontal: 16,
    height: 48,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 16,
  },
  topThreeTabPill: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dropdownTabPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  timeTabsRow: {
    maxWidth: 412,
    width: "100%",
    paddingHorizontal: 16,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  periodTabPill: {
    flex: 1,
    height: 38,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tabPillActive: {
    backgroundColor: "#5D7D95",
  },
  tabPillInactive: {
    borderWidth: 1,
  },
  tabPillText: {
    fontFamily: "Poppins",
    fontSize: 13,
    fontWeight: "500",
  },
  tabPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  heroCard: {
    maxWidth: 380,
    width: "100%",
    height: 325,
    borderRadius: 18,
    paddingTop: 20,
    paddingRight: 16,
    paddingBottom: 22,
    paddingLeft: 16,
    gap: 18,
    backgroundColor: "#013459",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    position: "relative",
    overflow: "hidden",
  },
  cardPeriodLabel: {
    position: "absolute",
    top: 16,
    left: 20,
    width: 83,
    height: 18,
    opacity: 1,
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0,
    textAlign: "center",
    color: "#FFFFFF",
  },
  donutContainer: {
    width: 182,
    height: 182,
    borderRadius: 1000,
    borderWidth: 1,
    borderColor: "#529ECE",
    backgroundColor: "#013459",
    opacity: 1,
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  donutCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    width: 130,
    gap: 2,
  },
  donutLabel: {
    fontFamily: "Poppins",
    fontSize: 13,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.75)",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  donutAmount: {
    fontFamily: "Poppins",
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  badgesRow: {
    width: "100%",
    maxWidth: 360,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    opacity: 1,
  },
  badgePill: {
    width: 95,
    height: 48,
    borderRadius: 24,
    opacity: 1,
    paddingHorizontal: 10,
    gap: 7,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  badgeTextCol: {
    flex: 1,
    justifyContent: "center",
    gap: 1,
  },
  badgeName: {
    fontFamily: "Poppins",
    fontSize: 11,
    fontWeight: "500",
    color: "#FFFFFF",
    lineHeight: 14,
  },
  badgeAmount: {
    fontFamily: "Poppins",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 15,
  },
  dataCardsContainer: {
    maxWidth: 380,
    width: "100%",
    alignSelf: "center",
    marginTop: 18,
    marginBottom: 16,
    paddingHorizontal: 0,
    borderWidth: 0,
  },
  dataCardsList: {
    width: "100%",
    gap: 18,
    alignItems: "stretch",
  },
  dataCardEmpty: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 32,
  },
  singleDataCard: {
    width: "100%",
    alignSelf: "stretch",
    gap: 8,
    opacity: 1,
  },
  categoryTextRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  categoryName: {
    fontFamily: "Poppins",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  categoryAmount: {
    fontFamily: "Poppins",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  progressTrack: {
    width: "100%",
    height: 14,
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 10,
  },
  drilldownHeroCard: {
    maxWidth: 380,
    width: "100%",
    height: 80,
    borderRadius: 12,
    backgroundColor: "#013459",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
    alignSelf: "center",
    paddingLeft: 20,
    paddingRight: 0,
    marginBottom: 24,
    opacity: 1,
  },
  drilldownHeroLeft: {
    zIndex: 2,
    flexDirection: "row",
    alignItems: "baseline",
  },
  drilldownHeroCurrency: {
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: "700",
    color: "#5D8DAE",
    letterSpacing: 0.5,
  },
  drilldownHeroAmount: {
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  vectorDesign: {
    position: "absolute",
    top: -68.27,
    left: 232.38,
    width: 179.78,
    height: 161.84,
    transform: [{ rotate: "-21.32deg" }],
    opacity: 0.1,
    zIndex: 1,
  },
  drilldownWaveWrapper: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 115,
    height: 80,
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 2,
  },
  middleCard: {
    maxWidth: 380,
    width: "100%",
    height: 342,
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignSelf: "center",
    justifyContent: "space-between",
    opacity: 1,
    marginBottom: 24,
  },
  middleCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 28,
    marginBottom: 6,
  },
  middleCardTitle: {
    fontFamily: "Poppins",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  pctBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pctBadgeText: {
    fontFamily: "Poppins",
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  barChartContainer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingTop: 8,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 248,
    width: "100%",
    paddingHorizontal: 2,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },
  peakLabelSlot: {
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  peakAmountText: {
    fontFamily: "Poppins",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    width: 50,
  },
  peakDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 6,
  },
  normalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  barStick: {
    width: 8.5,
    borderRadius: 4.25,
  },
  barMonthLabelContainer: {
    height: 24,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  barMonthRotatedLabel: {
    fontFamily: "Poppins",
    fontSize: 10.5,
    fontWeight: "500",
    textAlign: "center",
  },
  transactionsSection: {
    maxWidth: 380,
    width: "100%",
    alignSelf: "center",
    marginTop: 0,
    marginBottom: 20,
  },
  sectionHeaderLabel: {
    fontFamily: "Poppins",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    width: "100%",
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  txMeta: {
    maxWidth: 190,
  },
  txNote: {
    fontFamily: "Poppins",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  txDate: {
    fontFamily: "Poppins",
    fontSize: 13,
    fontWeight: "400",
    marginTop: 2,
    lineHeight: 18,
  },
  txAmount: {
    fontFamily: "Poppins",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#94A3B8",
    textAlign: "center",
  },
});

export default StatsScreen;
