import React from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { BarChart3, BookOpen, Home, User, Wallet } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActiveScreen } from "../types";

export interface TabRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BottomNavigationProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  onAddPress: () => void;
  onProfilePress?: () => void;
  isLight?: boolean;
  hasBottomBanner?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
  onTabLayout?: (
    tab: "home" | "records" | "accounts" | "stats" | "profile",
    layout: TabRect,
  ) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeScreen,
  onSelectScreen,
  onAddPress,
  onProfilePress,
  isLight = true,
  hasBottomBanner = false,
  onLayout,
  onTabLayout,
}) => {
  const insets = useSafeAreaInsets();

  // Agar neechay ad mojood hai toh extra bottom inset nahi denge taake icons ad ke paas rahein
  const bottomInset = hasBottomBanner ? 0 : Math.max(insets.bottom, 12);

  const inactiveColor = isLight ? "#8A96A6" : "#64748B";
  const activeColor = isLight ? "#012E4F" : "#38BDF8";
  const containerBg = isLight ? "#FFFFFF" : "#0D1520";
  const borderTopColor = isLight ? "#F1F5F9" : "#1E293B";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: containerBg,
          borderTopColor: borderTopColor,
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          borderBottomWidth: hasBottomBanner ? StyleSheet.hairlineWidth : 0,
          borderBottomColor: borderTopColor,
        },
      ]}
      onLayout={onLayout}
    >
      <View style={styles.contentRow}>
        {/* 1. Home */}
        <Pressable
          style={styles.navItem}
          onPress={() => onSelectScreen("dashboard")}
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            onTabLayout?.("home", { x: x + 14, y: y + 10, width, height });
          }}
        >
          <View style={styles.iconContainer}>
            <Home
              size={20}
              color={
                activeScreen === "dashboard" || activeScreen === "records"
                  ? activeColor
                  : inactiveColor
              }
              strokeWidth={
                activeScreen === "dashboard" || activeScreen === "records"
                  ? 2.3
                  : 1.8
              }
            />
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.85}
            style={[
              styles.navText,
              activeScreen === "dashboard" || activeScreen === "records"
                ? [styles.navTextActive, { color: activeColor }]
                : [styles.navTextInactive, { color: inactiveColor }],
            ]}
          >
            Home
          </Text>
        </Pressable>

        {/* 2. Ledger */}
        <Pressable
          style={styles.navItem}
          onPress={() => onSelectScreen("transactions")}
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            onTabLayout?.("records", { x: x + 14, y: y + 10, width, height });
          }}
        >
          <View style={styles.iconContainer}>
            <BookOpen
              size={20}
              color={
                activeScreen === "transactions" ? activeColor : inactiveColor
              }
              strokeWidth={activeScreen === "transactions" ? 2.3 : 1.8}
            />
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.85}
            style={[
              styles.navText,
              activeScreen === "transactions"
                ? [styles.navTextActive, { color: activeColor }]
                : [styles.navTextInactive, { color: inactiveColor }],
            ]}
          >
            Ledger
          </Text>
        </Pressable>

        {/* 3. Accounts */}
        <Pressable
          style={styles.navItem}
          onPress={() => onSelectScreen("accounts")}
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            onTabLayout?.("accounts", { x: x + 14, y: y + 10, width, height });
          }}
        >
          <View style={styles.iconContainer}>
            <Wallet
              size={20}
              color={activeScreen === "accounts" ? activeColor : inactiveColor}
              strokeWidth={activeScreen === "accounts" ? 2.3 : 1.8}
            />
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.85}
            style={[
              styles.navText,
              activeScreen === "accounts"
                ? [styles.navTextActive, { color: activeColor }]
                : [styles.navTextInactive, { color: inactiveColor }],
            ]}
          >
            Accounts
          </Text>
        </Pressable>

        {/* 4. Stats */}
        <Pressable
          style={styles.navItem}
          onPress={() => onSelectScreen("reports")}
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            onTabLayout?.("stats", { x: x + 14, y: y + 10, width, height });
          }}
        >
          <View style={styles.iconContainer}>
            <BarChart3
              size={20}
              color={activeScreen === "reports" ? activeColor : inactiveColor}
              strokeWidth={activeScreen === "reports" ? 2.3 : 1.8}
            />
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.85}
            style={[
              styles.navText,
              activeScreen === "reports"
                ? [styles.navTextActive, { color: activeColor }]
                : [styles.navTextInactive, { color: inactiveColor }],
            ]}
          >
            Stats
          </Text>
        </Pressable>

        {/* 5. Profile */}
        <Pressable
          style={styles.navItem}
          onPress={() => onSelectScreen("profile")}
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            onTabLayout?.("profile", { x: x + 14, y: y + 10, width, height });
          }}
        >
          <View style={styles.iconContainer}>
            <User
              size={20}
              color={activeScreen === "profile" ? activeColor : inactiveColor}
              strokeWidth={activeScreen === "profile" ? 2.3 : 1.8}
            />
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.85}
            style={[
              styles.navText,
              activeScreen === "profile"
                ? [styles.navTextActive, { color: activeColor }]
                : [styles.navTextInactive, { color: inactiveColor }],
            ]}
          >
            Profile
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 4,
    paddingRight: 14,
    paddingLeft: 14,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    gap: 2,
    height: 48,
  },
  navItem: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconContainer: {
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  navText: {
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
    letterSpacing: -0.1,
    textAlign: "center",
  },
  navTextActive: {
    fontWeight: "700",
    color: "#012E4F",
  },
  navTextInactive: {
    fontWeight: "600",
    color: "#8A96A6",
  },
});

export default BottomNavigation;
