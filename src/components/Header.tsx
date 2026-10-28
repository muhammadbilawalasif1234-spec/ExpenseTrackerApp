import React from "react";
import { Image, StyleSheet, Text, View, Pressable } from "react-native";
import { Bell, User, Settings } from "lucide-react-native";
import { ThemeMode } from "../types";

interface HeaderProps {
  userName?: string;
  avatarUrl?: string | null;
  themeMode?: ThemeMode;
  resolvedTheme?: "light" | "dark";
  isLight?: boolean;
  onThemeToggle?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  onSettingsPress?: () => void;
  onSearchPress?: () => void;
  profileAnchorRef?: React.Ref<View>;
}

export const Header: React.FC<HeaderProps> = ({
  userName = "",
  avatarUrl,
  themeMode = "light",
  resolvedTheme = "light",
  isLight = true,
  onThemeToggle,
  onNotificationsPress,
  onProfilePress,
  onSettingsPress,
  onSearchPress,
  profileAnchorRef,
}) => {
  return (
    <View style={styles.container}>
      {/* Profile & Avatar Group (Left-aligned) */}
      <Pressable
        ref={profileAnchorRef}
        collapsable={false}
        style={styles.leftRow}
        onPress={onProfilePress}
        accessibilityRole="button"
        accessibilityLabel="Profile"
      >
        {/* Avatar Container (50 x 50, borderRadius: 25) */}
        <View
          style={[
            styles.avatarWrapper,
            {
              backgroundColor: isLight ? "#F1F5F9" : "#1E293B",
              borderColor: isLight ? "#E2E8F0" : "#334155",
            },
          ]}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <User
              size={24}
              color={isLight ? "#94A3B8" : "#64748B"}
              strokeWidth={1.8}
            />
          )}
        </View>

        {/* User Text Info */}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.greeting,
              { color: isLight ? "#64748B" : "#94A3B8" },
            ]}
            numberOfLines={1}
          >
            {userName && userName.trim() ? "Good Morning!" : "Welcome!"}
          </Text>
          <Text
            style={[
              styles.userName,
              { color: isLight ? "#002F52" : "#F1F5F9" },
            ]}
            numberOfLines={1}
          >
            {userName && userName.trim() ? userName.trim() : "My Profile"}
          </Text>
        </View>
      </Pressable>

      {/* Right Action Group: Notification bell and Settings */}
      <View style={styles.rightActions}>
        <Pressable
          style={styles.iconBtn}
          onPress={onNotificationsPress}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          hitSlop={10}
        >
          <Bell
            size={23}
            color={isLight ? "#0F172A" : "#F1F5F9"}
            strokeWidth={1.8}
          />
        </Pressable>

        <Pressable
          style={styles.iconBtn}
          onPress={onSettingsPress}
          accessibilityRole="button"
          accessibilityLabel="Settings"
          hitSlop={10}
        >
          <Settings
            size={23}
            color={isLight ? "#0F172A" : "#F1F5F9"}
            strokeWidth={1.8}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    justifyContent: "center",
  },
  greeting: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
    lineHeight: 24,
    marginTop: 1,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#EF4444",
  },
});

export default Header;
