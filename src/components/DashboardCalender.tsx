import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Transaction } from "../types";

interface DashboardCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  transactions: Transaction[];
  isLight?: boolean;
}

export const DashboardCalendar: React.FC<DashboardCalendarProps> = ({
  selectedDate,
  onSelectDate,
  transactions,
  isLight = true,
}) => {
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const currentDay = selectedDate.getDate();

  const monthNames = [
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
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayIndex = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayIndex(currentYear, currentMonth);

  const calendarDays = Array.from({ length: totalDays }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    onSelectDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    onSelectDate(newDate);
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onSelectDate(newDate);
  };

  // Theme Colors matching ledger calendar and light/dark theme
  const containerBg = isLight ? "#FFFFFF" : "#161B22";
  const borderCol = isLight ? "#E2E8F0" : "#30363D";
  const textColor = isLight ? "#0F2C4C" : "#FFFFFF";
  const subTextColor = isLight ? "#64748B" : "#94A3B8";
  const activeColor = "#5D7D95"; // Premium brand color specified by user

  return (
    <View
      style={[
        styles.calendarCard,
        { backgroundColor: containerBg, borderColor: borderCol },
      ]}
    >
      {/* Month Switcher Header */}
      <View style={styles.calendarHeader}>
        <Pressable onPress={handlePrevMonth} style={styles.navBtn}>
          <ChevronLeft size={18} color={isLight ? "#475569" : "#94A3B8"} />
        </Pressable>

        <Text style={[styles.calendarTitle, { color: textColor }]}>
          {monthNames[currentMonth]} {currentYear}
        </Text>

        <Pressable onPress={handleNextMonth} style={styles.navBtn}>
          <ChevronRight size={18} color={isLight ? "#475569" : "#94A3B8"} />
        </Pressable>
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendDotGreen} />
        <Text style={[styles.legendText, { color: subTextColor }]}>Income</Text>
        <View style={styles.legendDotRed} />
        <Text style={[styles.legendText, { color: subTextColor }]}>
          Expense
        </Text>
      </View>

      {/* Weekday labels */}
      <View style={styles.weekDaysRow}>
        {weekDays.map((wd) => (
          <Text key={wd} style={[styles.weekDayText, { color: subTextColor }]}>
            {wd}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {/* Empty leading days */}
        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <View key={`empty-${idx}`} style={styles.emptyDayCell} />
        ))}

        {/* Days of the Month */}
        {calendarDays.map((day) => {
          const isSelected = currentDay === day;

          // Check if there are transactions on this specific day
          const dayTransactions = (transactions || []).filter((tx) => {
            if (!tx || !tx.date) return false;
            const txDate = new Date(tx.date);
            return (
              txDate.getDate() === day &&
              txDate.getMonth() === currentMonth &&
              txDate.getFullYear() === currentYear
            );
          });

          const hasActivity = dayTransactions.length > 0;
          const hasIncome = dayTransactions.some((tx) => tx.type === "income");
          const hasExpense = dayTransactions.some(
            (tx) => tx.type === "expense",
          );

          return (
            <Pressable
              key={day}
              style={[
                styles.dayCell,
                isSelected && [
                  styles.dayCellSelected,
                  { backgroundColor: activeColor },
                ],
              ]}
              onPress={() => handleSelectDay(day)}
            >
              <Text
                style={[
                  styles.dayCellText,
                  { color: isLight ? "#1E293B" : "#E2E8F0" },
                  isSelected && styles.dayCellTextSelected,
                  hasActivity && !isSelected && styles.dayCellTextActivity,
                ]}
              >
                {day}
              </Text>

              {hasActivity && (
                <View style={styles.activityDotWrap}>
                  {hasIncome && <View style={styles.miniDotGreen} />}
                  {hasExpense && <View style={styles.miniDotRed} />}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  navBtn: {
    padding: 6,
    borderRadius: 8,
  },
  calendarTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 14,
  },
  legendDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00C466",
  },
  legendDotRed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F05252",
    marginLeft: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "500",
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  weekDayText: {
    width: 32,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emptyDayCell: {
    width: "14.28%",
    height: 38,
  },
  dayCell: {
    width: "14.28%",
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginVertical: 1,
  },
  dayCellSelected: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dayCellText: {
    fontSize: 12,
    fontWeight: "500",
  },
  dayCellTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  dayCellTextActivity: {
    fontWeight: "700",
  },
  activityDotWrap: {
    flexDirection: "row",
    gap: 2,
    marginTop: 2,
    height: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  miniDotGreen: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#00C466",
  },
  miniDotRed: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F05252",
  },
});
