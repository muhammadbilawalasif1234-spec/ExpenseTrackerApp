import React from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

interface TopBarCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  selectedMonth: string;
  selectedCalendarDay: number | null;
  onSelectDay: (day: number, date: Date) => void;
  onSelectAllMonth: (date: Date) => void;
  isLight?: boolean;
}

const parseSelectedMonthStr = (monthStr: string) => {
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

const MONTH_NAMES = [
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

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const TopBarCalendarModal: React.FC<TopBarCalendarModalProps> = ({
  visible,
  onClose,
  selectedMonth,
  selectedCalendarDay,
  onSelectDay,
  onSelectAllMonth,
  isLight = true,
}) => {
  const insets = useSafeAreaInsets();
  const initial = React.useMemo(
    () => parseSelectedMonthStr(selectedMonth),
    [selectedMonth],
  );
  const [viewMonth, setViewMonth] = React.useState(initial.month);
  const [viewYear, setViewYear] = React.useState(initial.year);

  // Animated slide-up for sheet while black backdrop displays instantly
  const slideAnim = React.useRef(new Animated.Value(400)).current;

  React.useEffect(() => {
    if (visible) {
      slideAnim.setValue(380);
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 26,
        mass: 0.8,
        stiffness: 280,
        useNativeDriver: true,
      }).start();

      const parsed = parseSelectedMonthStr(selectedMonth);
      setViewMonth(parsed.month);
      setViewYear(parsed.year);
    }
  }, [visible, selectedMonth, slideAnim]);

  if (!visible) return null;

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const calendarDays = Array.from({ length: totalDays }, (_, i) => i + 1);
  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();

  const today = new Date();
  const isTodayMonth =
    today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const todayDate = today.getDate();

  const currentSelectedMonthParsed = parseSelectedMonthStr(selectedMonth);
  const isCurrentSelectedMonth =
    currentSelectedMonthParsed.year === viewYear &&
    currentSelectedMonthParsed.month === viewMonth;

  const sheetBg = isLight ? "#FFFFFF" : "#161B22";
  const bottomPadding = Math.max(
    insets.bottom + 36,
    Platform.OS === "android" ? 52 : 44,
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        {/* Instant black background overlay with tap to dismiss */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close calendar"
        />

        {/* Bottom sheet pop-up sliding up from bottom to top */}
        <Animated.View
          style={[
            styles.calendarSheet,
            {
              backgroundColor: sheetBg,
              paddingBottom: bottomPadding,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Top drag handle indicator */}
          <View
            style={[
              styles.dragHandle,
              { backgroundColor: isLight ? "#E2E8F0" : "#3F3F46" },
            ]}
          />

          {/* Month Header Row: Perfectly centered with equal space from top edge and below to separator line */}
          <View style={styles.calendarHeader}>
            <Pressable
              style={styles.calendarNavBtn}
              onPress={handlePrevMonth}
              accessibilityLabel="Previous month"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ChevronLeft
                size={24}
                color={isLight ? "#012E4F" : "#FFFFFF"}
                strokeWidth={2.8}
              />
            </Pressable>

            <Text
              style={[
                styles.calendarTitle,
                { color: isLight ? "#012E4F" : "#FFFFFF" },
              ]}
            >
              {`${MONTH_NAMES[viewMonth]}  ${viewYear}`}
            </Text>

            <Pressable
              style={styles.calendarNavBtn}
              onPress={handleNextMonth}
              accessibilityLabel="Next month"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ChevronRight
                size={24}
                color={isLight ? "#012E4F" : "#FFFFFF"}
                strokeWidth={2.8}
              />
            </Pressable>
          </View>

          {/* Horizontal Separator Line below header */}
          <View
            style={[
              styles.calendarSeparator,
              { backgroundColor: isLight ? "#E2E8F0" : "#30363D" },
            ]}
          />

          {/* Weekday labels */}
          <View style={styles.weekDaysRow}>
            {WEEK_DAYS.map((wd) => (
              <Text
                key={wd}
                style={[
                  styles.weekDayText,
                  { color: isLight ? "#8E9DAE" : "#94A3B8" },
                ]}
              >
                {wd}
              </Text>
            ))}
          </View>

          {/* Calendar Days Grid */}
          <View style={styles.calendarGrid}>
            {/* Empty offset days */}
            {Array.from({ length: firstDayOffset }).map((_, idx) => (
              <View key={`empty-${idx}`} style={styles.emptyDayCell} />
            ))}

            {/* Days */}
            {calendarDays.map((day) => {
              const isSelected =
                isCurrentSelectedMonth && selectedCalendarDay === day;
              const isToday = isTodayMonth && day === todayDate;
              const isFuture = isTodayMonth
                ? day > todayDate
                : viewYear > today.getFullYear() ||
                  (viewYear === today.getFullYear() &&
                    viewMonth > today.getMonth());

              return (
                <Pressable
                  key={day}
                  style={styles.dayCell}
                  onPress={() => {
                    const targetDate = new Date(viewYear, viewMonth, day);
                    onSelectDay(day, targetDate);
                    onClose();
                  }}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  {isSelected ? (
                    <View style={styles.selectedDayBadge}>
                      <Text style={styles.selectedDayNumberText}>{day}</Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.dayCellText,
                        {
                          color: isToday
                            ? isLight
                              ? "#012E4F"
                              : "#38BDF8"
                            : isFuture
                              ? isLight
                                ? "#CBD5E1"
                                : "#64748B"
                              : isLight
                                ? "#0F172A"
                                : "#F1F5F9",
                          fontWeight: isToday
                            ? "700"
                            : isFuture
                              ? "600"
                              : "700",
                        },
                      ]}
                    >
                      {day}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  calendarSheet: {
    width: "100%",
    maxWidth: 412,
    alignSelf: "center",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 12,
    paddingTop: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 20,
    position: "relative",
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    position: "absolute",
    top: 8,
    opacity: 0.7,
  },
  calendarHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 18,
    paddingBottom: 18,
  },
  calendarTitle: {
    fontFamily: "Poppins",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  calendarNavBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  calendarSeparator: {
    width: "100%",
    height: 1,
    marginBottom: 16,
  },
  weekDaysRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  weekDayText: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Poppins",
    fontSize: 14,
    fontWeight: "600",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    paddingHorizontal: 4,
    rowGap: 8,
  },
  emptyDayCell: {
    width: "14.285%",
    height: 38,
  },
  dayCell: {
    width: "14.285%",
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDayBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#012E4F",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDayNumberText: {
    fontFamily: "Poppins",
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  dayCellText: {
    fontFamily: "Poppins",
    fontSize: 16,
    textAlign: "center",
  },
});

export default TopBarCalendarModal;
