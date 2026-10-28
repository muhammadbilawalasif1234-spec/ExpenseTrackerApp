import React from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react-native";
import { TimeTab } from "../types";

interface TimePeriodSelectorProps {
  timeTab: TimeTab;
  onSelectTab: (tab: TimeTab) => void;
  periodLabel?: string;
  onPrev?: () => void;
  onNext?: () => void;
  onResetToday?: () => void;
  isLight?: boolean;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  showNavBar?: boolean;
}

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  timeTab,
  onSelectTab,
  periodLabel,
  onPrev,
  onNext,
  onResetToday,
  isLight = true,
  showNavBar = false,
}) => {
  const tabs: { label: string; value: TimeTab; width?: number }[] = [
    { label: "Today", value: "Daily" as TimeTab },
    { label: "This week", value: "Weekly" as TimeTab },
    { label: "This month", value: "Monthly" as TimeTab },
    { label: "Total", value: "Total" as TimeTab },
    { label: "Custom", value: "Custom" as TimeTab },
  ];

  const navBg = isLight ? "#FFFFFF" : "#161B22";
  const navBorder = isLight ? "#E2E8F0" : "#30363D";
  const iconBtnBg = isLight ? "#FFFFFF" : "#21262D";
  const iconColor = isLight ? "#1E293B" : "#E2E8F0";
  const labelColor = isLight ? "#0F172A" : "#F8FAFC";

  return (
    <View style={styles.container}>
      {/* 5 Tabs matching Home.png + Custom: Today, This week, This month, Total, Custom */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab, idx) => {
          const isActive = timeTab === tab.value;

          return (
            <Pressable
              key={`${tab.label}-${idx}`}
              style={[
                styles.pill,
                tab.width ? { width: tab.width } : null,
                isActive
                  ? [styles.activePill, { backgroundColor: "#345D7A" }]
                  : [
                      styles.inactivePill,
                      {
                        backgroundColor: isLight ? "#FFFFFF" : "#161B22",
                        borderColor: isLight ? "#E2E8F0" : "#30363D",
                      },
                    ],
              ]}
              onPress={() => onSelectTab(tab.value)}
            >
              <Text
                style={[
                  styles.pillText,
                  isActive
                    ? styles.activePillText
                    : [
                        styles.inactivePillText,
                        { color: isLight ? "#000000" : "#E2E8F0" },
                      ],
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Optional Calendar Navigation Bar if explicitly toggled */}
      {showNavBar && periodLabel && timeTab !== "Custom" && (
        <View
          style={[
            styles.navBar,
            { backgroundColor: navBg, borderColor: navBorder },
          ]}
        >
          <Pressable
            style={[styles.navBtn, { backgroundColor: iconBtnBg }]}
            onPress={onPrev}
            disabled={timeTab === "Total"}
          >
            <ChevronLeft
              size={16}
              color={timeTab === "Total" ? "#94A3B8" : iconColor}
            />
          </Pressable>

          <View style={styles.navLabelContainer}>
            <Calendar size={13} color="#5D7D95" />
            <Text
              style={[styles.navLabelText, { color: labelColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.85}
            >
              {periodLabel}
            </Text>
          </View>

          <View style={styles.navRight}>
            {onResetToday && timeTab !== "Total" && (
              <Pressable
                style={[
                  styles.todayBtn,
                  {
                    backgroundColor: isLight
                      ? "#E0F2FE"
                      : "rgba(56, 189, 248, 0.15)",
                  },
                ]}
                onPress={onResetToday}
              >
                <RotateCcw size={10} color="#5D7D95" />
                <Text style={[styles.todayBtnText, { color: "#5D7D95" }]}>
                  Today
                </Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.navBtn, { backgroundColor: iconBtnBg }]}
              onPress={onNext}
              disabled={timeTab === "Total"}
            >
              <ChevronRight
                size={16}
                color={timeTab === "Total" ? "#94A3B8" : iconColor}
              />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 42,
  },
  scrollContent: {
    paddingHorizontal: 0,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    height: 42,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  activePill: {
    backgroundColor: "#345D7A",
    borderColor: "transparent",
  },
  inactivePill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pillText: {
    fontFamily: "Poppins",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0,
  },
  activePillText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  inactivePillText: {
    color: "#000000",
  },
  navBar: {
    marginHorizontal: 16,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  navLabelContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginHorizontal: 4,
  },
  navLabelText: {
    fontSize: 12,
    fontWeight: "600",
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  todayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  todayBtnText: {
    fontSize: 10,
    fontWeight: "700",
  },
});

export default TimePeriodSelector;
