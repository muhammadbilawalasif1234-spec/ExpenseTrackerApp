import React from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Award,
  Check,
  Coins,
  Download,
  Eye,
  Laptop,
  Layers,
  Mail,
  Moon,
  Palette,
  Play,
  Radio,
  RotateCcw,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Sun,
  User,
  X,
  Zap,
} from "lucide-react-native";
import { COLORS, CURRENCIES } from "../constants/theme";
import { Currency, ThemeMode } from "../types";
import { formatCurrency } from "../utils/formatters";
import { AppLogo } from "./AppLogo";

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  themeMode?: ThemeMode;
  setThemeMode?: (mode: ThemeMode) => void;
  onReplaySplash: () => void;
  onReplayOnboarding?: () => void;
  onReplayUserGuide?: () => void;
  onClearAllData?: () => void;
  totalBalance: number;
  userName?: string;
  avatarUrl?: string | null;
  userEmail?: string;
  onShowRewardedAd?: () => void;
  onShowRewardedInterstitialAd?: () => void;
  onShowInterstitialAd?: () => void;
  onShowAppOpenAd?: () => void;
  isBannerVisible?: boolean;
  onToggleBanner?: () => void;
  rewardPoints?: number;
  isProActive?: boolean;
  isLight?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  currency,
  setCurrency,
  themeMode = "default",
  setThemeMode,
  onReplaySplash,
  onReplayOnboarding,
  onReplayUserGuide,
  onClearAllData,
  totalBalance,
  userName = "",
  avatarUrl,
  userEmail = "",
  onShowRewardedAd,
  onShowRewardedInterstitialAd,
  onShowInterstitialAd,
  onShowAppOpenAd,
  isBannerVisible = true,
  onToggleBanner,
  rewardPoints = 0,
  isProActive = false,
  isLight = false,
}) => {
  const insets = useSafeAreaInsets();
  const topDistance = Math.max(insets.top, 16);
  const bottomDistance = insets.bottom > 0 ? insets.bottom : 16;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      presentationStyle="fullScreen"
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: isLight ? "#FFFFFF" : "#0D1117",
            paddingTop: topDistance + 8,
            paddingBottom: bottomDistance,
            position: (Platform.OS === "web" ? "fixed" : "relative") as any,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: (Platform.OS === "web" ? "100vw" : "100%") as any,
            height: (Platform.OS === "web" ? "100vh" : "100%") as any,
            zIndex: 99999,
          },
        ]}
      >
        <View style={[styles.dialog, isLight && styles.dialogLight]}>
          {/* Header */}
          <View style={[styles.header, isLight && styles.headerLight]}>
            <View style={styles.headerLeft}>
              <AppLogo size={34} />
              <View>
                <Text
                  style={[
                    styles.headerTitle,
                    isLight && styles.headerTitleLight,
                  ]}
                >
                  Expense Tracker
                </Text>
                <Text
                  style={[
                    styles.headerSubtitle,
                    isLight && styles.headerSubtitleLight,
                  ]}
                >
                  Profile & System Settings
                </Text>
              </View>
            </View>

            <Pressable
              style={[styles.closeBtn, isLight && styles.closeBtnLight]}
              onPress={onClose}
            >
              <X size={16} color={isLight ? "#64748B" : COLORS.grayLight} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
          >
            {/* User Profile Card */}
            <View style={[styles.userCard, isLight && styles.userCardLight]}>
              <View
                style={[
                  styles.userAvatar,
                  {
                    overflow: "hidden",
                    backgroundColor: isLight ? "#FFFFFF" : "#1E293B",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: isLight ? "#E2E8F0" : "#334155",
                  },
                ]}
              >
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: 48, height: 48, borderRadius: 16 }}
                  />
                ) : (
                  <User size={24} color={isLight ? "#94A3B8" : "#64748B"} />
                )}
              </View>
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text
                    style={[styles.userName, isLight && styles.userNameLight]}
                    numberOfLines={1}
                  >
                    {userName || "Personal Account"}
                  </Text>
                  <View style={styles.proTag}>
                    <Text style={styles.proTagText}>PRO</Text>
                  </View>
                </View>
                {userEmail ? (
                  <View style={styles.emailRow}>
                    <Mail size={11} color={isLight ? "#64748B" : "#94A3B8"} />
                    <Text
                      style={[
                        styles.emailText,
                        isLight && styles.emailTextLight,
                      ]}
                      numberOfLines={1}
                    >
                      {userEmail}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.emailText,
                      isLight && styles.emailTextLight,
                      { marginTop: 2 },
                    ]}
                  >
                    Local Vault Storage
                  </Text>
                )}
                <Text style={styles.statusText}>
                  Active Member • Offline Vault Sync
                </Text>
              </View>
            </View>

            {/* App Theme Mode Selector */}
            {setThemeMode && (
              <View
                style={[styles.sectionBox, isLight && styles.sectionBoxLight]}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <Palette size={14} color="#818CF8" />
                    <Text
                      style={[
                        styles.sectionTitle,
                        isLight && styles.sectionTitleLight,
                      ]}
                    >
                      App Theme Mode
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.currentCurrencyText,
                      isLight && styles.currentCurrencyTextLight,
                    ]}
                  >
                    {themeMode === "default"
                      ? "SYSTEM"
                      : themeMode.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.themeGrid}>
                  <Pressable
                    onPress={() => setThemeMode("dark")}
                    style={[
                      styles.themeCard,
                      isLight && styles.themeCardLight,
                      themeMode === "dark" && styles.themeCardActiveDark,
                    ]}
                  >
                    <Moon
                      size={16}
                      color={
                        themeMode === "dark"
                          ? "#818CF8"
                          : isLight
                            ? "#64748B"
                            : "#94A3B8"
                      }
                    />
                    <Text
                      style={[
                        styles.themeCardTitle,
                        isLight && styles.themeCardTitleLight,
                        themeMode === "dark" && styles.themeCardTitleActive,
                      ]}
                    >
                      Dark
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setThemeMode("light")}
                    style={[
                      styles.themeCard,
                      isLight && styles.themeCardLight,
                      themeMode === "light" && styles.themeCardActiveLight,
                    ]}
                  >
                    <Sun
                      size={16}
                      color={
                        themeMode === "light"
                          ? "#F59E0B"
                          : isLight
                            ? "#64748B"
                            : "#94A3B8"
                      }
                    />
                    <Text
                      style={[
                        styles.themeCardTitle,
                        isLight && styles.themeCardTitleLight,
                        themeMode === "light" && styles.themeCardTitleActive,
                      ]}
                    >
                      Light
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setThemeMode("default")}
                    style={[
                      styles.themeCard,
                      isLight && styles.themeCardLight,
                      themeMode === "default" && styles.themeCardActiveDefault,
                    ]}
                  >
                    <Laptop
                      size={16}
                      color={
                        themeMode === "default"
                          ? "#10B981"
                          : isLight
                            ? "#64748B"
                            : "#94A3B8"
                      }
                    />
                    <Text
                      style={[
                        styles.themeCardTitle,
                        isLight && styles.themeCardTitleLight,
                        themeMode === "default" && styles.themeCardTitleActive,
                      ]}
                    >
                      System
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Currency Selector */}
            <View
              style={[styles.sectionBox, isLight && styles.sectionBoxLight]}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <Coins size={14} color="#F59E0B" />
                  <Text
                    style={[
                      styles.sectionTitle,
                      isLight && styles.sectionTitleLight,
                    ]}
                  >
                    Base Currency
                  </Text>
                </View>
                <Text
                  style={[
                    styles.currentCurrencyText,
                    isLight && styles.currentCurrencyTextLight,
                  ]}
                >
                  {currency.code} ({currency.symbol.trim()})
                </Text>
              </View>

              <View style={styles.currencyGrid}>
                {CURRENCIES.map((c) => {
                  const isSelected = c.code === currency.code;
                  return (
                    <Pressable
                      key={c.code}
                      onPress={() => setCurrency(c)}
                      style={[
                        styles.currencyButton,
                        isLight && styles.currencyButtonLight,
                        isSelected && styles.currencyButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.currencyBtnCode,
                          isLight && styles.currencyBtnCodeLight,
                          isSelected && styles.currencyBtnCodeActive,
                        ]}
                      >
                        {c.code}
                      </Text>
                      <Text
                        style={[
                          styles.currencyBtnSymbol,
                          isLight && styles.currencyBtnSymbolLight,
                          isSelected && styles.currencyBtnSymbolActive,
                        ]}
                      >
                        {c.symbol.trim()}
                      </Text>
                      {isSelected && (
                        <Check size={11} color="#000000" strokeWidth={3} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* App Actions & Tools */}
            <View style={styles.actionsSection}>
              <Text
                style={[
                  styles.sectionCategoryTitle,
                  isLight && styles.sectionCategoryTitleLight,
                ]}
              >
                App Actions & Tools
              </Text>

              <Pressable
                style={[
                  styles.actionRowBtn,
                  isLight && styles.actionRowBtnLight,
                ]}
                onPress={() => {
                  onClose();
                  onReplaySplash();
                }}
              >
                <View style={styles.actionLeft}>
                  <View
                    style={[
                      styles.actionIconBox,
                      { backgroundColor: "rgba(245, 158, 11, 0.15)" },
                    ]}
                  >
                    <Play size={15} color="#F59E0B" />
                  </View>
                  <View style={styles.actionTexts}>
                    <Text
                      style={[
                        styles.actionTitle,
                        isLight && styles.actionTitleLight,
                      ]}
                    >
                      Replay Splash Screen
                    </Text>
                    <Text
                      style={[
                        styles.actionSubtitle,
                        isLight && styles.actionSubtitleLight,
                      ]}
                    >
                      View logo, app bio & loading board
                    </Text>
                  </View>
                </View>
                <Text style={styles.actionLinkText}>Play</Text>
              </Pressable>

              {onReplayOnboarding && (
                <Pressable
                  style={[
                    styles.actionRowBtn,
                    isLight && styles.actionRowBtnLight,
                  ]}
                  onPress={() => {
                    onClose();
                    onReplayOnboarding();
                  }}
                >
                  <View style={styles.actionLeft}>
                    <View
                      style={[
                        styles.actionIconBox,
                        { backgroundColor: "rgba(1, 52, 89, 0.15)" },
                      ]}
                    >
                      <Layers size={15} color="#0F3D5E" />
                    </View>
                    <View style={styles.actionTexts}>
                      <Text
                        style={[
                          styles.actionTitle,
                          isLight && styles.actionTitleLight,
                        ]}
                      >
                        Open Onboard 1 Screen
                      </Text>
                      <Text
                        style={[
                          styles.actionSubtitle,
                          isLight && styles.actionSubtitleLight,
                        ]}
                      >
                        Preview Figma Onboard 1 screen & tour
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.actionLinkText, { color: "#0F3D5E" }]}>
                    View
                  </Text>
                </Pressable>
              )}

              {onReplayUserGuide && (
                <Pressable
                  style={[
                    styles.actionRowBtn,
                    isLight && styles.actionRowBtnLight,
                  ]}
                  onPress={() => {
                    onClose();
                    onReplayUserGuide();
                  }}
                >
                  <View style={styles.actionLeft}>
                    <View
                      style={[
                        styles.actionIconBox,
                        { backgroundColor: "rgba(2, 132, 199, 0.15)" },
                      ]}
                    >
                      <Sparkles size={15} color="#0284C7" />
                    </View>
                    <View style={styles.actionTexts}>
                      <Text
                        style={[
                          styles.actionTitle,
                          isLight && styles.actionTitleLight,
                        ]}
                      >
                        Interactive User Guide
                      </Text>
                      <Text
                        style={[
                          styles.actionSubtitle,
                          isLight && styles.actionSubtitleLight,
                        ]}
                      >
                        Tour all gesture pointers, floating buttons & tabs
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.actionLinkText, { color: "#0284C7" }]}>
                    Tour
                  </Text>
                </Pressable>
              )}

              <Pressable
                style={[
                  styles.actionRowBtn,
                  isLight && styles.actionRowBtnLight,
                ]}
                onPress={() => {
                  Alert.alert(
                    "Clear All App Data",
                    "Are you sure you want to delete all transactions and reset the app? This will reset the app to a clean, fresh state.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Clear Data",
                        style: "destructive",
                        onPress: () => {
                          onClose();
                          if (onClearAllData) {
                            onClearAllData();
                          }
                        },
                      },
                    ],
                  );
                }}
              >
                <View style={styles.actionLeft}>
                  <View
                    style={[
                      styles.actionIconBox,
                      { backgroundColor: "rgba(251, 113, 133, 0.15)" },
                    ]}
                  >
                    <RotateCcw size={15} color="#FB7185" />
                  </View>
                  <View style={styles.actionTexts}>
                    <Text
                      style={[
                        styles.actionTitle,
                        isLight && styles.actionTitleLight,
                      ]}
                    >
                      Clear All App Data
                    </Text>
                    <Text
                      style={[
                        styles.actionSubtitle,
                        isLight && styles.actionSubtitleLight,
                      ]}
                    >
                      Reset app to a fresh and clean state
                    </Text>
                  </View>
                </View>
                <Text style={[styles.actionLinkText, { color: "#FB7185" }]}>
                  Reset
                </Text>
              </Pressable>
            </View>

            {/* Google AdMob Suite & Rewards */}
            <View style={styles.actionsSection}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={[
                    styles.sectionCategoryTitle,
                    isLight && styles.sectionCategoryTitleLight,
                  ]}
                >
                  AdMob Ads & Rewards
                </Text>
                <View
                  style={{
                    backgroundColor: "#EAB308",
                    paddingHorizontal: 5,
                    paddingVertical: 1,
                    borderRadius: 3,
                  }}
                >
                  <Text
                    style={{ fontSize: 8, fontWeight: "900", color: "#000000" }}
                  >
                    TEST SUITE
                  </Text>
                </View>
              </View>

              {onShowRewardedAd && (
                <Pressable
                  style={[
                    styles.actionRowBtn,
                    isLight && styles.actionRowBtnLight,
                  ]}
                  onPress={() => {
                    onClose();
                    onShowRewardedAd();
                  }}
                >
                  <View style={styles.actionLeft}>
                    <View
                      style={[
                        styles.actionIconBox,
                        { backgroundColor: "rgba(245, 158, 11, 0.15)" },
                      ]}
                    >
                      <Award size={15} color="#F59E0B" />
                    </View>
                    <View style={styles.actionTexts}>
                      <Text
                        style={[
                          styles.actionTitle,
                          isLight && styles.actionTitleLight,
                        ]}
                      >
                        Watch Rewarded Video Ad
                      </Text>
                      <Text
                        style={[
                          styles.actionSubtitle,
                          isLight && styles.actionSubtitleLight,
                        ]}
                      >
                        Earn +100 Points & 24h Pro Pass (Balance: {rewardPoints}{" "}
                        pts)
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.actionLinkText, { color: "#F59E0B" }]}>
                    Watch
                  </Text>
                </Pressable>
              )}

              {onShowRewardedInterstitialAd && (
                <Pressable
                  style={[
                    styles.actionRowBtn,
                    isLight && styles.actionRowBtnLight,
                  ]}
                  onPress={() => {
                    onClose();
                    onShowRewardedInterstitialAd();
                  }}
                >
                  <View style={styles.actionLeft}>
                    <View
                      style={[
                        styles.actionIconBox,
                        { backgroundColor: "rgba(245, 158, 11, 0.2)" },
                      ]}
                    >
                      <Zap size={14} color="#F59E0B" fill="#F59E0B" />
                    </View>
                    <View style={styles.actionTexts}>
                      <Text
                        style={[
                          styles.actionTitle,
                          isLight && styles.actionTitleLight,
                        ]}
                      >
                        Watch Rewarded Interstitial Ad
                      </Text>
                      <Text
                        style={[
                          styles.actionSubtitle,
                          isLight && styles.actionSubtitleLight,
                        ]}
                      >
                        Instant reward! Earn +150 Points & 48h Pro Pass
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.actionLinkText, { color: "#F59E0B" }]}>
                    Watch
                  </Text>
                </Pressable>
              )}

              {onShowInterstitialAd && (
                <Pressable
                  style={[
                    styles.actionRowBtn,
                    isLight && styles.actionRowBtnLight,
                  ]}
                  onPress={() => {
                    onClose();
                    onShowInterstitialAd();
                  }}
                >
                  <View style={styles.actionLeft}>
                    <View
                      style={[
                        styles.actionIconBox,
                        { backgroundColor: "rgba(16, 185, 129, 0.15)" },
                      ]}
                    >
                      <Layers size={15} color="#10B981" />
                    </View>
                    <View style={styles.actionTexts}>
                      <Text
                        style={[
                          styles.actionTitle,
                          isLight && styles.actionTitleLight,
                        ]}
                      >
                        Show Interstitial Ad
                      </Text>
                      <Text
                        style={[
                          styles.actionSubtitle,
                          isLight && styles.actionSubtitleLight,
                        ]}
                      >
                        Test full-screen interstitial ad unit
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.actionLinkText, { color: "#10B981" }]}>
                    Test
                  </Text>
                </Pressable>
              )}

              {onShowAppOpenAd && (
                <Pressable
                  style={[
                    styles.actionRowBtn,
                    isLight && styles.actionRowBtnLight,
                  ]}
                  onPress={() => {
                    onClose();
                    onShowAppOpenAd();
                  }}
                >
                  <View style={styles.actionLeft}>
                    <View
                      style={[
                        styles.actionIconBox,
                        { backgroundColor: "rgba(56, 189, 248, 0.15)" },
                      ]}
                    >
                      <Radio size={15} color="#38BDF8" />
                    </View>
                    <View style={styles.actionTexts}>
                      <Text
                        style={[
                          styles.actionTitle,
                          isLight && styles.actionTitleLight,
                        ]}
                      >
                        Show App Open Ad
                      </Text>
                      <Text
                        style={[
                          styles.actionSubtitle,
                          isLight && styles.actionSubtitleLight,
                        ]}
                      >
                        Test launch & foreground screen ad
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.actionLinkText, { color: "#38BDF8" }]}>
                    Launch
                  </Text>
                </Pressable>
              )}

              {onToggleBanner && (
                <Pressable
                  style={[
                    styles.actionRowBtn,
                    isLight && styles.actionRowBtnLight,
                  ]}
                  onPress={onToggleBanner}
                >
                  <View style={styles.actionLeft}>
                    <View
                      style={[
                        styles.actionIconBox,
                        { backgroundColor: "rgba(168, 85, 247, 0.15)" },
                      ]}
                    >
                      <Eye size={15} color="#A855F7" />
                    </View>
                    <View style={styles.actionTexts}>
                      <Text
                        style={[
                          styles.actionTitle,
                          isLight && styles.actionTitleLight,
                        ]}
                      >
                        Bottom Banner Ad
                      </Text>
                      <Text
                        style={[
                          styles.actionSubtitle,
                          isLight && styles.actionSubtitleLight,
                        ]}
                      >
                        Currently{" "}
                        {isBannerVisible ? "Visible on screens" : "Hidden"}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.actionLinkText,
                      {
                        color: isBannerVisible
                          ? "#A855F7"
                          : isLight
                            ? "#64748B"
                            : "#94A3B8",
                      },
                    ]}
                  >
                    {isBannerVisible ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Bio & Version Card */}
            <View style={[styles.bioCard, isLight && styles.bioCardLight]}>
              <Text style={[styles.bioTitle, isLight && styles.bioTitleLight]}>
                Expense Tracker • Smart Wealth
              </Text>
              <Text style={[styles.bioDesc, isLight && styles.bioDescLight]}>
                Take complete control of your financial journey with real-time
                analytics, multi-wallet sync, and budget goals.
              </Text>
              <Text
                style={[styles.bioFooter, isLight && styles.bioFooterLight]}
              >
                100% Encrypted Local Storage • Version 2.5.0
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <Pressable style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  dialog: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
    gap: 16,
  },
  dialogLight: {
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#30363D",
  },
  headerLight: {
    borderBottomColor: "#E2E8F0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerTitleLight: {
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#94A3B8",
  },
  headerSubtitleLight: {
    color: "#64748B",
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#21262D",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnLight: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  scrollArea: {
    flex: 1,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#1E2430",
    borderWidth: 1,
    borderColor: "#30363D",
    marginBottom: 12,
  },
  userCardLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000000",
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    flexShrink: 1,
  },
  userNameLight: {
    color: "#0F172A",
  },
  proTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.4)",
  },
  proTagText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#F59E0B",
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  emailText: {
    fontSize: 11,
    color: "#94A3B8",
    flexShrink: 1,
  },
  emailTextLight: {
    color: "#64748B",
  },
  statusText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 3,
  },
  sectionBox: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#12161E",
    borderWidth: 1,
    borderColor: "#252C36",
    marginBottom: 12,
    gap: 8,
  },
  sectionBoxLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sectionTitleLight: {
    color: "#0F172A",
  },
  currentCurrencyText: {
    fontSize: 11,
    color: "#94A3B8",
  },
  currentCurrencyTextLight: {
    color: "#64748B",
  },
  currencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  currencyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#1C222D",
    borderWidth: 1,
    borderColor: "#30363D",
  },
  currencyButtonLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  currencyButtonActive: {
    backgroundColor: "#F59E0B",
    borderColor: "#F59E0B",
  },
  currencyBtnCode: {
    fontSize: 11,
    fontWeight: "700",
    color: "#CBD5E1",
  },
  currencyBtnCodeLight: {
    color: "#1E293B",
  },
  currencyBtnCodeActive: {
    color: "#000000",
  },
  currencyBtnSymbol: {
    fontSize: 10,
    color: "#94A3B8",
  },
  currencyBtnSymbolLight: {
    color: "#64748B",
  },
  currencyBtnSymbolActive: {
    color: "#000000",
  },
  actionsSection: {
    gap: 8,
    marginBottom: 12,
  },
  sectionCategoryTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  sectionCategoryTitleLight: {
    color: "#94A3B8",
  },
  actionRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#1C222D",
    borderWidth: 1,
    borderColor: "#30363D",
  },
  actionRowBtnLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  actionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTexts: {
    flex: 1,
    minWidth: 0,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  actionTitleLight: {
    color: "#0F172A",
  },
  actionSubtitle: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 1,
  },
  actionSubtitleLight: {
    color: "#64748B",
  },
  actionLinkText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#F59E0B",
  },
  bioCard: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#12161E",
    borderWidth: 1,
    borderColor: "#252C36",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  bioCardLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  bioTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#E2E8F0",
  },
  bioTitleLight: {
    color: "#0F172A",
  },
  bioDesc: {
    fontSize: 10,
    lineHeight: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
  bioDescLight: {
    color: "#64748B",
  },
  bioFooter: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 2,
  },
  bioFooterLight: {
    color: "#94A3B8",
  },
  themeGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  themeCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#1C222D",
    borderWidth: 1,
    borderColor: "#30363D",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  themeCardLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  themeCardActiveDark: {
    borderColor: "#818CF8",
    backgroundColor: "rgba(129, 140, 248, 0.15)",
  },
  themeCardActiveLight: {
    borderColor: "#F59E0B",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  },
  themeCardActiveDefault: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  themeCardTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
  },
  themeCardTitleLight: {
    color: "#64748B",
  },
  themeCardTitleActive: {
    color: "#FFFFFF",
  },
  doneBtn: {
    backgroundColor: "#F59E0B",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000000",
  },
});

export default ProfileModal;
