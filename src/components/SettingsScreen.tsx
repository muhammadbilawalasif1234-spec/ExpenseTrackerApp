import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Coins,
  Compass,
  Folder,
  Landmark,
  Megaphone,
  RotateCcw,
  Sparkles,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { DEFAULT_CATEGORIES } from "../constants/theme";
import {
  Category,
  Currency,
  Subcategory,
  ThemeMode,
  UserProfile,
} from "../types";
import { CategoryScreens } from "./CategoryScreens";
import { CurrencyLockedModal } from "./CurrencyLockedModal";

export interface SettingsScreenProps {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  resolvedTheme: "dark" | "light";
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  onNavigateAccounts: () => void;
  isLight?: boolean;
  categories?: Category[];
  onAddCategory?: (cat: Omit<Category, "id">) => Category;
  onUpdateCategory?: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory?: (id: string) => void;
  onAddSubcategory?: (categoryId: string, sub: Omit<Subcategory, "id">) => void;
  onDeleteSubcategory?: (categoryId: string, subId: string) => void;
  profile?: UserProfile;
  updateProfile?: (partial: Partial<UserProfile>) => void;
  onBack?: () => void;
  onClearAllData?: () => void;
  onReplayOnboarding?: () => void;
  onShowUserGuide?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  themeMode,
  setThemeMode,
  resolvedTheme,
  currency,
  setCurrency,
  onNavigateAccounts,
  isLight = true,
  categories = DEFAULT_CATEGORIES,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddSubcategory,
  onDeleteSubcategory,
  profile,
  updateProfile,
  onBack,
  onClearAllData,
  onReplayOnboarding,
  onShowUserGuide,
}) => {
  const [isCurrencyLockedModalOpen, setIsCurrencyLockedModalOpen] =
    useState(false);
  const [isViewingCategoriesFlow, setIsViewingCategoriesFlow] = useState(false);
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);

  const showAds = profile?.showAds ?? true;

  const handleToggleAds = (value: boolean) => {
    if (updateProfile) {
      updateProfile({ showAds: value });
    }
  };

  const bgScreen = isLight ? "#FFFFFF" : "#0B1118";
  const cardBg = isLight ? "rgba(237, 237, 237, 0.4)" : "#161B22";
  const cardBorder = isLight ? "#E2E8F0" : "#30363D";
  const titleColor = isLight ? "#012E4F" : "#F1F5F9";
  const labelColor = isLight ? "#64748B" : "#94A3B8";
  const textColor = isLight ? "#1E293B" : "#E2E8F0";

  if (isViewingCategoriesFlow) {
    return (
      <CategoryScreens
        categories={categories}
        isLight={isLight}
        onBackToProfile={() => setIsViewingCategoriesFlow(false)}
        onAddCategory={
          onAddCategory || ((cat) => ({ ...cat, id: `cat-${Date.now()}` }))
        }
        onUpdateCategory={onUpdateCategory || (() => {})}
        onDeleteCategory={onDeleteCategory || (() => {})}
        onAddSubcategory={onAddSubcategory || (() => {})}
        onDeleteSubcategory={onDeleteSubcategory || (() => {})}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgScreen, overflow: "hidden" },
      ]}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: bgScreen }]}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 16 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <View style={styles.titleSection}>
          {onBack && (
            <Pressable
              onPress={onBack}
              style={styles.backButtonTouch}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ChevronLeft size={24} color={titleColor} strokeWidth={2} />
            </Pressable>
          )}
          <Text style={[styles.screenTitle, { color: titleColor }]}>
            Settings
          </Text>
        </View>

        {/* Theme Card */}
        <View
          style={[
            styles.themeCard,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <View style={styles.themeTitleContainer}>
            <Text style={[styles.themeTitleText, { color: titleColor }]}>
              Theme
            </Text>
          </View>
          <View style={styles.themeTabsRow}>
            <Pressable
              onPress={() => setThemeMode("default")}
              style={[
                styles.singleTab,
                themeMode === "default"
                  ? styles.singleTabActive
                  : [
                      styles.singleTabInactive,
                      {
                        backgroundColor: isLight ? "#FFFFFF" : "#0D1117",
                        borderColor: isLight ? "#E2E8F0" : "#30363D",
                      },
                    ],
              ]}
            >
              <Text
                style={[
                  styles.singleTabText,
                  themeMode === "default"
                    ? styles.singleTabTextActive
                    : [styles.singleTabTextInactive, { color: textColor }],
                ]}
                numberOfLines={1}
              >
                System
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setThemeMode("light")}
              style={[
                styles.singleTab,
                themeMode === "light"
                  ? styles.singleTabActive
                  : [
                      styles.singleTabInactive,
                      {
                        backgroundColor: isLight ? "#FFFFFF" : "#0D1117",
                        borderColor: isLight ? "#E2E8F0" : "#30363D",
                      },
                    ],
              ]}
            >
              <Text
                style={[
                  styles.singleTabText,
                  themeMode === "light"
                    ? styles.singleTabTextActive
                    : [styles.singleTabTextInactive, { color: textColor }],
                ]}
                numberOfLines={1}
              >
                Light
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setThemeMode("dark")}
              style={[
                styles.singleTab,
                themeMode === "dark"
                  ? styles.singleTabActive
                  : [
                      styles.singleTabInactive,
                      {
                        backgroundColor: isLight ? "#FFFFFF" : "#0D1117",
                        borderColor: isLight ? "#E2E8F0" : "#30363D",
                      },
                    ],
              ]}
            >
              <Text
                style={[
                  styles.singleTabText,
                  themeMode === "dark"
                    ? styles.singleTabTextActive
                    : [styles.singleTabTextInactive, { color: textColor }],
                ]}
                numberOfLines={1}
              >
                Dark
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Settings Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <Text style={[styles.cardTitle, { color: titleColor }]}>
            Settings
          </Text>

          <View style={styles.settingsList}>
            <Pressable
              onPress={() => setIsViewingCategoriesFlow(true)}
              style={styles.settingItem}
            >
              <View style={styles.settingItemLeft}>
                <View
                  style={[
                    styles.settingIconBox,
                    { backgroundColor: isLight ? "#EEF2F6" : "#21262D" },
                  ]}
                >
                  <Folder
                    size={14}
                    color={isLight ? "#012E4F" : "#E2E8F0"}
                    strokeWidth={1.8}
                  />
                </View>
                <Text style={[styles.settingItemLabel, { color: textColor }]}>
                  Categories
                </Text>
              </View>
              <ChevronRight size={17} color={isLight ? "#94A3B8" : "#64748B"} />
            </Pressable>

            <Pressable onPress={onNavigateAccounts} style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View
                  style={[
                    styles.settingIconBox,
                    { backgroundColor: isLight ? "#EEF2F6" : "#21262D" },
                  ]}
                >
                  <Landmark
                    size={14}
                    color={isLight ? "#012E4F" : "#E2E8F0"}
                    strokeWidth={1.8}
                  />
                </View>
                <Text style={[styles.settingItemLabel, { color: textColor }]}>
                  Accounts
                </Text>
              </View>
              <ChevronRight size={17} color={isLight ? "#94A3B8" : "#64748B"} />
            </Pressable>

            {/* Default Currency - Triggers professional locked prompt popup */}
            <Pressable
              onPress={() => setIsCurrencyLockedModalOpen(true)}
              style={styles.settingItem}
            >
              <View style={styles.settingItemLeft}>
                <View
                  style={[
                    styles.settingIconBox,
                    { backgroundColor: isLight ? "#EEF2F6" : "#21262D" },
                  ]}
                >
                  <Coins
                    size={14}
                    color={isLight ? "#012E4F" : "#E2E8F0"}
                    strokeWidth={1.8}
                  />
                </View>
                <Text style={[styles.settingItemLabel, { color: textColor }]}>
                  Default Currency
                </Text>
              </View>
              <View style={styles.settingItemRight}>
                <Text
                  style={[
                    styles.currencyValueText,
                    { color: isLight ? "#64748B" : "#94A3B8" },
                  ]}
                >
                  {currency?.code || "USD"} (
                  {currency?.symbol != null
                    ? String(currency.symbol).trim()
                    : "$"}
                  )
                </Text>
                <ChevronRight
                  size={17}
                  color={isLight ? "#94A3B8" : "#64748B"}
                />
              </View>
            </Pressable>

            <View style={styles.settingItem}>
              <View
                style={[
                  styles.settingItemLeft,
                  { flex: 1, minWidth: 0, paddingRight: 8 },
                ]}
              >
                <View
                  style={[
                    styles.settingIconBox,
                    { backgroundColor: isLight ? "#EEF2F6" : "#21262D" },
                  ]}
                >
                  <Megaphone
                    size={14}
                    color={isLight ? "#012E4F" : "#E2E8F0"}
                    strokeWidth={1.8}
                  />
                </View>
                <Text style={[styles.settingItemLabel, { color: textColor }]}>
                  Display Ads
                </Text>
              </View>
              <Switch
                value={showAds}
                onValueChange={handleToggleAds}
                trackColor={{
                  false: isLight ? "#CBD5E1" : "#334155",
                  true: isLight ? "#012E4F" : "#38BDF8",
                }}
                thumbColor={
                  showAds
                    ? isLight
                      ? "#FFFFFF"
                      : "#0B1118"
                    : isLight
                      ? "#FFFFFF"
                      : "#94A3B8"
                }
                ios_backgroundColor={isLight ? "#CBD5E1" : "#334155"}
              />
            </View>

            {onShowUserGuide && (
              <Pressable onPress={onShowUserGuide} style={styles.settingItem}>
                <View style={styles.settingItemLeft}>
                  <View
                    style={[
                      styles.settingIconBox,
                      {
                        backgroundColor: isLight
                          ? "rgba(14, 165, 233, 0.12)"
                          : "rgba(56, 189, 248, 0.15)",
                      },
                    ]}
                  >
                    <Sparkles size={14} color="#0EA5E9" strokeWidth={1.8} />
                  </View>
                  <Text style={[styles.settingItemLabel, { color: textColor }]}>
                    App Feature & Gesture Guide
                  </Text>
                </View>
                <ChevronRight size={17} color={labelColor} />
              </Pressable>
            )}

            {onReplayOnboarding && (
              <Pressable
                onPress={onReplayOnboarding}
                style={styles.settingItem}
              >
                <View style={styles.settingItemLeft}>
                  <View
                    style={[
                      styles.settingIconBox,
                      { backgroundColor: isLight ? "#EEF2F6" : "#21262D" },
                    ]}
                  >
                    <Compass
                      size={14}
                      color={isLight ? "#012E4F" : "#38BDF8"}
                      strokeWidth={1.8}
                    />
                  </View>
                  <Text style={[styles.settingItemLabel, { color: textColor }]}>
                    Replay Onboarding Tour
                  </Text>
                </View>
                <ChevronRight size={17} color={labelColor} />
              </Pressable>
            )}

            {onClearAllData && (
              <Pressable
                onPress={() => setIsClearDataModalOpen(true)}
                style={styles.settingItem}
              >
                <View style={styles.settingItemLeft}>
                  <View
                    style={[
                      styles.settingIconBox,
                      { backgroundColor: isLight ? "#EEF2F6" : "#21262D" },
                    ]}
                  >
                    <RotateCcw
                      size={14}
                      color={isLight ? "#EF4444" : "#F87171"}
                      strokeWidth={1.8}
                    />
                  </View>
                  <Text
                    style={[
                      styles.settingItemLabel,
                      { color: "#EF4444", fontWeight: "600" },
                    ]}
                  >
                    Clear All App Data
                  </Text>
                </View>
                <ChevronRight size={17} color="#EF4444" />
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Professional Currency Locked Prompt Modal */}
      <CurrencyLockedModal
        visible={isCurrencyLockedModalOpen}
        currency={currency}
        onClose={() => setIsCurrencyLockedModalOpen(false)}
        isLight={isLight}
      />

      <Modal
        visible={isClearDataModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsClearDataModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isLight ? "#FFFFFF" : "#1E293B",
                borderColor: isLight ? "#F1F5F9" : "#334155",
                maxWidth: 340,
                alignItems: "center",
                paddingVertical: 24,
                paddingHorizontal: 20,
              },
            ]}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: isLight
                  ? "#FEE2E2"
                  : "rgba(239, 68, 68, 0.18)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <AlertTriangle size={26} color="#EF4444" strokeWidth={2} />
            </View>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "800",
                color: isLight ? "#0F172A" : "#F8FAFC",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Clear All App Data?
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: isLight ? "#64748B" : "#94A3B8",
                textAlign: "center",
                lineHeight: 19,
                marginBottom: 24,
              }}
            >
              Are you sure you want to delete all transactions, accounts, and
              budgets? This will reset the app to a clean, fresh state.
            </Text>
            <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
              <Pressable
                onPress={() => setIsClearDataModalOpen(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: isLight ? "#FFFFFF" : "#334155",
                  borderWidth: isLight ? 1 : 0,
                  borderColor: "#E2E8F0",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 13.5,
                    fontWeight: "600",
                    color: isLight ? "#475569" : "#CBD5E1",
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (onClearAllData) onClearAllData();
                  setIsClearDataModalOpen(false);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: "#EF4444",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 13.5,
                    fontWeight: "700",
                    color: "#FFFFFF",
                  }}
                >
                  Clear All
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 12,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonTouch: { padding: 4, marginLeft: -4 },
  screenTitle: { fontSize: 24, fontWeight: "600", letterSpacing: -0.3 },
  card: {
    width: "100%",
    alignSelf: "stretch",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  themeCard: {
    width: "100%",
    alignSelf: "stretch",
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    paddingRight: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    gap: 10,
    justifyContent: "flex-start",
  },
  themeTitleContainer: {
    width: "100%",
    height: 53,
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: "center",
  },
  themeTitleText: { fontSize: 22, fontWeight: "600", letterSpacing: -0.4 },
  themeTabsRow: {
    width: "100%",
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  singleTab: {
    flex: 1,
    height: 42,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  singleTabActive: { backgroundColor: "#537287" },
  singleTabInactive: { borderWidth: 1 },
  singleTabText: { fontSize: 14, textAlign: "center" },
  singleTabTextActive: { color: "#FFFFFF", fontWeight: "500" },
  singleTabTextInactive: { fontWeight: "400" },
  cardTitle: { fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  settingsList: { gap: 2 },
  settingItem: {
    width: "100%",
    minHeight: 60,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    flex: 1,
    minWidth: 0,
  },
  settingItemRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  settingIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingItemLabel: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: "600",
    marginRight: 10,
  },
  currencyValueText: { fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: { width: "100%", borderRadius: 20, borderWidth: 1, elevation: 5 },
});

export default SettingsScreen;
