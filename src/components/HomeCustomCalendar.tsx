import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, Platform } from "react-native";
import { ChevronLeft, ChevronRight, Edit2 } from "lucide-react-native";
import { StartEndDateModal } from "./modals/StartEndDateModal";

interface HomeCustomCalendarProps {
  startDate: Date;
  endDate: Date;
  onApplyDateRange: (start: Date, end: Date) => void;
  onCancel: () => void;
  isLight?: boolean;
}

export const HomeCustomCalendar: React.FC<HomeCustomCalendarProps> = ({
  startDate,
  endDate,
  onApplyDateRange,
  onCancel,
  isLight = true,
}) => {
  const [selectedStart, setSelectedStart] = useState<Date>(startDate);
  const [selectedEnd, setSelectedEnd] = useState<Date>(endDate);
  const [viewDate, setViewDate] = useState<Date>(() => new Date(startDate));
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectionStep, setSelectionStep] = useState<"start" | "end">("end");

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

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayIndex = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayIndex(currentYear, currentMonth);

  const prevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isBetweenDays = (target: Date, d1: Date, d2: Date) => {
    const t = target.getTime();
    const start = new Date(
      d1.getFullYear(),
      d1.getMonth(),
      d1.getDate(),
      0,
      0,
      0,
    ).getTime();
    const end = new Date(
      d2.getFullYear(),
      d2.getMonth(),
      d2.getDate(),
      23,
      59,
      59,
    ).getTime();
    const minT = Math.min(start, end);
    const maxT = Math.max(start, end);
    return t > minT && t < maxT;
  };

  const handleDayClick = (dayNum: number) => {
    const clickedDate = new Date(currentYear, currentMonth, dayNum);

    if (selectionStep === "start") {
      setSelectedStart(clickedDate);
      setSelectedEnd(clickedDate);
      setSelectionStep("end");
    } else {
      if (clickedDate < selectedStart) {
        setSelectedEnd(selectedStart);
        setSelectedStart(clickedDate);
      } else {
        setSelectedEnd(clickedDate);
      }
      setSelectionStep("start");
    }
  };

  const handleModalSave = (newStart: Date, newEnd: Date) => {
    setSelectedStart(newStart);
    setSelectedEnd(newEnd);
    setViewDate(new Date(newStart));
  };

  const handleApply = () => {
    const minD = selectedStart < selectedEnd ? selectedStart : selectedEnd;
    const maxD = selectedStart < selectedEnd ? selectedEnd : selectedStart;
    onApplyDateRange(minD, maxD);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isLight ? "transparent" : "#000000" },
      ]}
    >
      {/* Tile properties: width: 412; height: 72; justify-content: space-between; top: 11px; padding: 25px 15px */}
      <View style={styles.tile}>
        <View style={{ width: 24 }} />
        <Text
          style={[styles.tileTitle, { color: isLight ? "#012E4F" : "#FFFFFF" }]}
        >
          Start date – End date
        </Text>
        <Pressable
          style={styles.pencilBtn}
          onPress={() => setIsModalOpen(true)}
          hitSlop={8}
        >
          <Edit2
            size={18}
            color={isLight ? "#012E4F" : "#38BDF8"}
            strokeWidth={2.5}
          />
        </Pressable>
      </View>

      {/* Calender Properties: width: 378; height: 378; border-radius: 14px; border: 1.5px solid #012E4F; background: #FFFFFF */}
      <View
        style={[
          styles.calendarCard,
          {
            backgroundColor: isLight ? "#FFFFFF" : "#0B0D12",
            borderColor: isLight ? "#012E4F" : "#30363D",
          },
        ]}
      >
        {/* Month Header row: Month name centered */}
        <View
          style={[
            styles.monthHeader,
            { borderBottomColor: isLight ? "#012E4F" : "#30363D" },
          ]}
        >
          <Pressable style={styles.arrowBtn} onPress={prevMonth} hitSlop={8}>
            <ChevronLeft size={20} color={isLight ? "#012E4F" : "#E2E8F0"} />
          </Pressable>
          <Text
            style={[
              styles.monthTitle,
              { color: isLight ? "#012E4F" : "#FFFFFF" },
            ]}
          >
            {monthNames[currentMonth]}
          </Text>
          <Pressable style={styles.arrowBtn} onPress={nextMonth} hitSlop={8}>
            <ChevronRight size={20} color={isLight ? "#012E4F" : "#E2E8F0"} />
          </Pressable>
        </View>

        {/* Days of week header row: Sun Mon Tue Wed Thu Fri Sat */}
        <View style={styles.weekDaysRow}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <Text
              key={d}
              style={[
                styles.weekDayText,
                { color: isLight ? "#012E4F" : "#94A3B8" },
              ]}
            >
              {d}
            </Text>
          ))}
        </View>

        {/* Days Grid */}
        <View style={styles.daysGrid}>
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <View key={`empty-${idx}`} style={styles.dayCell} />
          ))}

          {/* Month Day Numbers */}
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const currentDayDate = new Date(currentYear, currentMonth, dayNum);

            const isStart = isSameDay(currentDayDate, selectedStart);
            const isEnd = isSameDay(currentDayDate, selectedEnd);
            const isInRange = isBetweenDays(
              currentDayDate,
              selectedStart,
              selectedEnd,
            );

            return (
              <Pressable
                key={`day-${dayNum}`}
                style={styles.dayCell}
                onPress={() => handleDayClick(dayNum)}
              >
                {isInRange && (
                  <View
                    style={[
                      styles.rangeHighlight,
                      {
                        backgroundColor: isLight
                          ? "rgba(52, 93, 122, 0.12)"
                          : "rgba(56, 189, 248, 0.18)",
                      },
                    ]}
                  />
                )}

                <View
                  style={[
                    styles.dayBadge,
                    isEnd
                      ? styles.endBadge
                      : isStart
                        ? [
                            styles.startBadge,
                            !isLight && { backgroundColor: "#334155" },
                          ]
                        : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: isLight ? "#012E4F" : "#E2E8F0" },
                      isEnd
                        ? styles.endText
                        : isStart
                          ? [styles.startText, !isLight && { color: "#FFFFFF" }]
                          : null,
                    ]}
                  >
                    {dayNum}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Apply and cancel button properties: width: 378; height: 48; border-radius: 10px; background: #345D7A */}
      <View
        style={[
          styles.buttonContainer,
          { backgroundColor: isLight ? "#2E5675" : "#1E293B" },
        ]}
      >
        {/* Cancel Button */}
        <Pressable style={styles.actionBtn} onPress={onCancel}>
          <Text
            style={[
              styles.cancelText,
              { color: isLight ? "#9EBFD1" : "#94A3B8" },
            ]}
          >
            Cancel
          </Text>
        </Pressable>

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Apply Button */}
        <Pressable style={styles.actionBtn} onPress={handleApply}>
          <Text style={styles.applyText}>Apply</Text>
        </Pressable>
      </View>

      {/* Start and End date screen Modal */}
      <StartEndDateModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        startDate={selectedStart}
        endDate={selectedEnd}
        onSave={handleModalSave}
        isLight={isLight}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 4,
  },
  tile: {
    width: "100%",
    maxWidth: 412,
    height: 72,
    paddingTop: 25,
    paddingBottom: 25,
    paddingLeft: 16,
    paddingRight: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    opacity: 1,
  },
  tileTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#012E4F",
    letterSpacing: -0.3,
  },
  pencilBtn: {
    padding: 4,
  },
  calendarCard: {
    width: "100%",
    maxWidth: 412,
    height: 378,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#012E4F",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  monthHeader: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#012E4F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#012E4F",
    letterSpacing: -0.2,
  },
  weekDaysRow: {
    flexDirection: "row",
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 0,
  },
  weekDayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#012E4F",
  },
  daysGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  dayCell: {
    width: "14.28%",
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  rangeHighlight: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 4,
    bottom: 4,
    backgroundColor: "rgba(52, 93, 122, 0.12)",
  },
  dayBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  startBadge: {
    backgroundColor: "#D9D9D9",
  },
  endBadge: {
    backgroundColor: "#345D7A",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#012E4F",
  },
  startText: {
    color: "#012E4F",
    fontWeight: "700",
  },
  endText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 412,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#2E5675",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    marginTop: 33,
  },
  actionBtn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: "#9EBFD1",
    fontSize: 15,
    fontWeight: "600",
  },
  applyText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  verticalDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
});

export default HomeCustomCalendar;
