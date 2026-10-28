import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AddTransactionModal,
  BalanceCard,
  BottomNavigation,
  BudgetsScreen,
  CurrencyLockedModal,
  DraggableAddButton,
  Header,
  HomeCustomCalendar,
  IncomeExpenseCard,
  LedgerScreen,
  NotificationsModal,
  OnboardingFlow,
  PaywallModal,
  ProfileModal,
  ProfileScreen,
  RecordsScreen,
  SearchModal,
  SelectAccountModal,
  SelectCurrencyScreen,
  SettingsScreen,
  SplashScreen,
  StatsScreen,
  TransactionsSection,
  UserGuideOverlay,
  WalletsScreen,
} from "./src/components";
import { useAdMob } from "./src/hooks/useAdMob";
import { useExpenseData } from "./src/hooks/useExpenseData";
import { remoteConfigService } from "./src/services/RemoteConfigService";
import { ActiveScreen, Currency, Profile, Transaction } from "./src/types";

function ExpenseAppContent() {
  const insets = useSafeAreaInsets();
  const standardTabTopPadding = 8;
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const systemColorScheme = useColorScheme();

  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSelectCurrency, setShowSelectCurrency] = useState(false);
  const [isCurrencyLockedModalOpen, setIsCurrencyLockedModalOpen] =
    useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSelectAccountOpen, setIsSelectAccountOpen] = useState(false);
  const [bottomNavTop, setBottomNavTop] = useState<number | undefined>();
  const [bottomNavLayout, setBottomNavLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [tabLayouts, setTabLayouts] = useState<{
    [key: string]: { x: number; y: number; width: number; height: number };
  }>({});
  const [draggableButtonPos, setDraggableButtonPos] = useState<{
    x: number;
    y: number;
    size: number;
  } | null>(null);
  const [balanceCardLayout, setBalanceCardLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [statsCardLayout, setStatsCardLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [headerLayout, setHeaderLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [headerContainerHeight, setHeaderContainerHeight] = useState<number>(0);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [isGuideLayoutReady, setIsGuideLayoutReady] = useState(false);
  const [addModalInitialType, setAddModalInitialType] = useState<
    "expense" | "income" | "transfer"
  >("expense");

  useEffect(() => {
    async function checkFirstTimeStatus() {
      try {
        const stored = await AsyncStorage.getItem("@spendly_has_onboarded");
        setHasCompletedOnboarding(stored === "true");
      } catch {
        setHasCompletedOnboarding(false);
      }
    }
    checkFirstTimeStatus();
  }, []);

  const {
    isLoading,
    totalBalance,
    periodStats,
    currency,
    setCurrency,
    themeMode,
    setThemeMode,
    resolvedTheme,
    toggleTheme,
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    timeTab,
    setTimeTab,
    periodFilteredTransactions,
    transactions,
    budgets,
    savingsGoals,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addOrUpdateBudget,
    deleteBudget,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addAccount,
    updateAccount,
    deleteAccount,
    isAddModalOpen,
    setIsAddModalOpen,
    activeScreen,
    setActiveScreen,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
    getPeriodDisplayLabel,
    customStartDate,
    customEndDate,
    setCustomDateRange,
    profile,
    updateProfile,
    clearAllData,
    selectedDate,
    setSelectedDate,
    ledgerNotes,
    setLedgerNotes,
  } = useExpenseData();

  const effectiveResolvedTheme =
    themeMode === "dark"
      ? "dark"
      : themeMode === "light"
        ? "light"
        : systemColorScheme === "dark"
          ? "dark"
          : "light";

  const isLightMode = effectiveResolvedTheme === "light";

  const safeProfile: Profile = {
    firstName: profile?.firstName != null ? String(profile.firstName) : "",
    lastName: profile?.lastName != null ? String(profile.lastName) : "",
    email: profile?.email != null ? String(profile.email) : "",
    phone: profile?.phone != null ? String(profile.phone) : "",
    bio: profile?.bio != null ? String(profile.bio) : "",
    username: profile?.username != null ? String(profile.username) : "",
    avatarUrl: profile?.avatarUrl != null ? String(profile.avatarUrl) : null,
    showAds: profile?.showAds ?? true,
  };

  const safeCurrency: Currency =
    typeof currency === "string"
      ? { code: currency, symbol: "$", name: currency, position: "prefix" }
      : {
          code: (currency as any)?.code || "USD",
          symbol:
            (currency as any)?.symbol != null
              ? String((currency as any).symbol)
              : "$",
          name: (currency as any)?.name || "US Dollar",
          position: (currency as any)?.position || "prefix",
        };

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isCustomApplied, setIsCustomApplied] = useState<boolean>(false);

  const {
    isBannerVisible,
    toggleBanner,
    showAppOpen,
    showInterstitial,
    showRewarded,
    showRewardedInterstitial,
    rewardPoints,
    isProActive,
  } = useAdMob();

  const isAdsEnabled = safeProfile?.showAds ?? true;

  const triggerDelayedInterstitial = () => {
    if (!isAdsEnabled) return;
    setTimeout(() => {
      showInterstitial();
    }, 15000);
  };

  const openUserGuide = () => {
    const hasHomeMeasurements =
      activeScreen === "dashboard" &&
      timeTab !== "Custom" &&
      headerContainerHeight > 0 &&
      balanceCardLayout !== null &&
      statsCardLayout !== null;
    if (activeScreen !== "dashboard" || timeTab === "Custom") {
      setIsGuideLayoutReady(false);
      setHeaderContainerHeight(0);
      setBalanceCardLayout(null);
      setStatsCardLayout(null);
    } else {
      setIsGuideLayoutReady(hasHomeMeasurements);
    }
    setActiveScreen("dashboard" as ActiveScreen);
    if (timeTab === "Custom") setTimeTab("Monthly" as any);
    setIsCustomApplied(false);
    setShowUserGuide(true);
  };

  useEffect(() => {
    if (!showUserGuide) {
      setIsGuideLayoutReady(false);
      return;
    }
    setIsGuideLayoutReady(
      activeScreen === "dashboard" &&
        timeTab !== "Custom" &&
        headerContainerHeight > 0 &&
        balanceCardLayout !== null &&
        statsCardLayout !== null,
    );
  }, [
    showUserGuide,
    activeScreen,
    timeTab,
    headerContainerHeight,
    balanceCardLayout,
    statsCardLayout,
  ]);

  const handleSplashComplete = async () => {
    await remoteConfigService.init();
    const sessionNum = remoteConfigService.getSessionCount();

    let onboarded = false;
    try {
      const stored = await AsyncStorage.getItem("@spendly_has_onboarded");
      onboarded = stored === "true";
    } catch {}

    if (!onboarded) {
      setShowSelectCurrency(true);
    } else if (sessionNum > 1 && remoteConfigService.shouldShowPaywall()) {
      setIsPaywallOpen(true);
    }

    if (isAdsEnabled && onboarded) showAppOpen();
    setShowSplash(false);
  };

  const handleCurrencySelected = async (selectedCurr: Currency) => {
    setCurrency(selectedCurr as any);
    setShowSelectCurrency(false);
    setShowOnboarding(true);
  };

  const handleOnboardingFinish = async () => {
    triggerDelayedInterstitial();
    setShowOnboarding(false);
    setHasCompletedOnboarding(true);
    try {
      await AsyncStorage.setItem("@spendly_has_onboarded", "true");
    } catch {}
    setIsPaywallOpen(true);
    const seenGuide = await AsyncStorage.getItem("@spendly_user_guide_seen");
    if (seenGuide !== "true") openUserGuide();
  };

  const handleClearAllData = async () => {
    if (typeof clearAllData === "function") {
      try {
        await clearAllData();
      } catch {}
    }
    setHasCompletedOnboarding(false);
    setShowOnboarding(false);
    setShowSelectCurrency(true);
    setShowSplash(false);
  };

  if (isLoading || showSplash || hasCompletedOnboarding === null) {
    return (
      <View
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          backgroundColor: isLightMode ? "#FFFFFF" : "#0D1117",
        }}
      >
        <StatusBar
          barStyle={isLightMode ? "dark-content" : "light-content"}
          backgroundColor={isLightMode ? "#FFFFFF" : "#0D1117"}
        />
        <SplashScreen
          visible={true}
          onComplete={handleSplashComplete}
          appName="Spendly"
          bio="Track • Budget • Save"
          isLight={isLightMode}
        />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <View
        style={[
          styles.mainContainer,
          isLightMode ? styles.mainContainerLight : styles.mainContainerDark,
          { flex: 1, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <StatusBar
          barStyle={isLightMode ? "dark-content" : "light-content"}
          backgroundColor={isLightMode ? "#FFFFFF" : "#0D1117"}
        />
        <SelectCurrencyScreen
          visible={showSelectCurrency}
          currentCurrency={safeCurrency}
          onSelectCurrency={handleCurrencySelected}
          isLight={isLightMode}
        />
        <OnboardingFlow
          visible={showOnboarding}
          onFinish={handleOnboardingFinish}
        />
      </View>
    );
  }

  const periodExpensesByCategory: Record<string, number> = {};
  (transactions || [])
    .filter((t) => t && t.type === "expense")
    .forEach((t) => {
      const key = t.category.toLowerCase();
      periodExpensesByCategory[key] =
        (periodExpensesByCategory[key] || 0) + t.amount;
    });

  const handleSelectScreen = (screen: ActiveScreen) => {
    setActiveScreen(screen);
    triggerDelayedInterstitial();
  };

  return (
    <View
      style={[
        styles.mainContainer,
        isLightMode ? styles.mainContainerLight : styles.mainContainerDark,
        {
          paddingTop: standardTabTopPadding,
          paddingBottom: 0,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <StatusBar
        barStyle={isLightMode ? "dark-content" : "light-content"}
        backgroundColor={isLightMode ? "#FFFFFF" : "#0D1117"}
      />

      <View style={[styles.screenWrapper, { backgroundColor: "#0D1117" }]}>
        {activeScreen === "dashboard" && (
          <View
            style={[
              styles.subScreenContainer,
              { backgroundColor: isLightMode ? "#FFFFFF" : "#0D1117" },
            ]}
          >
            <View
              style={{
                width: "100%",
                backgroundColor: isLightMode ? "#FFFFFF" : "#0D1117",
                minHeight: 76,
                paddingHorizontal: 16,
                paddingBottom: 12,
                zIndex: 10,
              }}
              onLayout={(e) =>
                setHeaderContainerHeight(e.nativeEvent.layout.height)
              }
            >
              <View
                style={styles.headerSection}
                onLayout={(e) => setHeaderLayout(e.nativeEvent.layout)}
              >
                <Header
                  userName={`${safeProfile.firstName} ${safeProfile.lastName}`.trim()}
                  avatarUrl={safeProfile.avatarUrl}
                  themeMode={themeMode as any}
                  resolvedTheme={effectiveResolvedTheme as any}
                  isLight={isLightMode}
                  onThemeToggle={toggleTheme}
                  onNotificationsPress={() => setIsNotificationsOpen(true)}
                  onProfilePress={() =>
                    handleSelectScreen("profile" as ActiveScreen)
                  }
                  onSettingsPress={() =>
                    handleSelectScreen("settings" as ActiveScreen)
                  }
                  onSearchPress={() => setIsSearchOpen(true)}
                />
              </View>
            </View>

            <ScrollView
              style={[
                styles.scrollArea,
                {
                  backgroundColor: isLightMode ? "#FFFFFF" : "#0D1117",
                },
              ]}
              showsVerticalScrollIndicator={false}
              bounces={true}
              overScrollMode="always"
              contentContainerStyle={[
                styles.scrollContent,
                {
                  backgroundColor: isLightMode ? "#FFFFFF" : "#0D1117",
                  paddingHorizontal: 16,
                  paddingTop: 0,
                  paddingBottom: 20,
                },
              ]}
            >
              {timeTab === "Custom" ? (
                !isCustomApplied ? (
                  <HomeCustomCalendar
                    startDate={customStartDate}
                    endDate={customEndDate}
                    onApplyDateRange={(start: Date, end: Date) => {
                      setCustomDateRange(start, end);
                      setIsCustomApplied(true);
                    }}
                    onCancel={() => setTimeTab("Monthly" as any)}
                    isLight={isLightMode}
                  />
                ) : (
                  <View
                    style={[
                      styles.customAppliedCard,
                      {
                        backgroundColor: isLightMode ? "#FFFFFF" : "#1E293B",
                        borderColor: isLightMode ? "#E2E8F0" : "#30363D",
                      },
                    ]}
                  >
                    <View style={styles.customAppliedTextGroup}>
                      <Text
                        style={[
                          styles.customAppliedTitle,
                          {
                            color: isLightMode ? "#012E4F" : "#FFFFFF",
                          },
                        ]}
                      >
                        Start date – End date
                      </Text>
                      <Text
                        style={[
                          styles.customAppliedSubtitle,
                          {
                            color: isLightMode ? "#64748B" : "#94A3B8",
                          },
                        ]}
                      >
                        {getPeriodDisplayLabel()}
                      </Text>
                    </View>
                    <Pressable
                      style={[
                        styles.customChangeRangeBtn,
                        {
                          backgroundColor: isLightMode
                            ? "rgba(52, 93, 122, 0.1)"
                            : "rgba(255, 255, 255, 0.08)",
                        },
                      ]}
                      onPress={() => setIsCustomApplied(false)}
                    >
                      <Text
                        style={[
                          styles.customChangeRangeText,
                          {
                            color: isLightMode ? "#345D7A" : "#38BDF8",
                          },
                        ]}
                      >
                        Change Range
                      </Text>
                    </Pressable>
                  </View>
                )
              ) : (
                <>
                  <View
                    style={styles.balanceCardSection}
                    onLayout={(e) => setBalanceCardLayout(e.nativeEvent.layout)}
                  >
                    <BalanceCard
                      totalBalance={
                        selectedAccountId
                          ? (accounts.find((a) => a.id === selectedAccountId)
                              ?.balance ?? 0)
                          : totalBalance
                      }
                      title={
                        selectedAccountId
                          ? (accounts.find((a) => a.id === selectedAccountId)
                              ?.name ?? "Total Balance")
                          : "Total Balance"
                      }
                      onBalancePress={() => setIsSelectAccountOpen(true)}
                      currency={safeCurrency}
                      periodLabel={timeTab as any}
                      onTransferPress={() => {
                        setAddModalInitialType("transfer");
                        setIsAddModalOpen(true);
                      }}
                      isLight={isLightMode}
                    />
                  </View>
                  <View
                    style={styles.statsCardSection}
                    onLayout={(e) => setStatsCardLayout(e.nativeEvent.layout)}
                  >
                    <IncomeExpenseCard
                      periodIncome={periodStats.income}
                      periodExpense={periodStats.expense}
                      currency={safeCurrency}
                      onAddPress={(type: "income" | "expense" = "income") => {
                        setAddModalInitialType(type);
                        setIsAddModalOpen(true);
                      }}
                      isLight={isLightMode}
                    />
                  </View>
                </>
              )}
              {!(timeTab === "Custom" && !isCustomApplied) && (
                <View style={styles.transactionsSection}>
                  <TransactionsSection
                    transactions={periodFilteredTransactions}
                    periodLabel={getPeriodDisplayLabel()}
                    timeTab={timeTab as any}
                    selectedDate={selectedDate}
                    categories={categories}
                    currency={safeCurrency}
                    onPressTransaction={(tx: Transaction) => {
                      setEditingTransaction(tx);
                      setIsAddModalOpen(true);
                    }}
                    onAddTransaction={() => {
                      setEditingTransaction(null);
                      setAddModalInitialType("expense");
                      setIsAddModalOpen(true);
                    }}
                    onDeleteTransaction={deleteTransaction}
                    onViewAll={() =>
                      handleSelectScreen("records" as ActiveScreen)
                    }
                    isLight={isLightMode}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {activeScreen === "transactions" && (
          <View
            style={[
              styles.subScreenContainer,
              { backgroundColor: isLightMode ? "#FFFFFF" : "#0D1117" },
            ]}
          >
            <LedgerScreen
              transactions={transactions}
              categories={categories}
              accounts={accounts}
              currency={safeCurrency}
              onAddTransaction={() => {
                setEditingTransaction(null);
                setAddModalInitialType("expense");
                setIsAddModalOpen(true);
              }}
              onPressTransaction={(tx: Transaction) => {
                setEditingTransaction(tx);
                setIsAddModalOpen(true);
              }}
              onDeleteTransaction={deleteTransaction}
              isLight={isLightMode}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onNavigateAccounts={() =>
                handleSelectScreen("accounts" as ActiveScreen)
              }
              onNavigateBudgets={() =>
                handleSelectScreen("budgets" as ActiveScreen)
              }
              notes={ledgerNotes as any}
              onSaveNotes={setLedgerNotes as any}
            />
          </View>
        )}

        {activeScreen === "records" && (
          <View
            style={[
              styles.subScreenContainer,
              { backgroundColor: isLightMode ? "#FFFFFF" : "#0D1117" },
            ]}
          >
            <RecordsScreen
              transactions={transactions}
              categories={categories}
              currency={safeCurrency}
              accounts={accounts}
              onAddNewClick={() => {
                setEditingTransaction(null);
                setAddModalInitialType("expense");
                setIsAddModalOpen(true);
              }}
              onPressTransaction={(tx: Transaction) => {
                setEditingTransaction(tx);
                setIsAddModalOpen(true);
              }}
              onDeleteTransaction={deleteTransaction}
              onBack={() => handleSelectScreen("dashboard" as ActiveScreen)}
              isLight={isLightMode}
            />
          </View>
        )}

        {activeScreen === "reports" && (
          <View
            style={[
              styles.subScreenContainer,
              { backgroundColor: isLightMode ? "#FFFFFF" : "#0D1117" },
            ]}
          >
            <StatsScreen
              transactions={transactions}
              categories={categories}
              accounts={accounts}
              currency={safeCurrency}
              onBack={() => setActiveScreen("dashboard" as ActiveScreen)}
              isLight={isLightMode}
              onPressTransaction={(tx: Transaction) => {
                setEditingTransaction(tx);
                setIsAddModalOpen(true);
              }}
              onDeleteTransaction={deleteTransaction}
            />
          </View>
        )}

        {activeScreen === "accounts" && (
          <View
            style={[
              styles.subScreenContainer,
              { backgroundColor: isLightMode ? "#FFFFFF" : "#0D1117" },
            ]}
          >
            <WalletsScreen
              accounts={accounts}
              currency={safeCurrency}
              onAddAccount={(acc: any) =>
                addAccount({ ...acc, balance: 0, initialBalance: 0 })
              }
              onUpdateAccount={updateAccount}
              onDeleteAccount={deleteAccount}
              onBack={() => setActiveScreen("dashboard" as ActiveScreen)}
              isLight={isLightMode}
              profile={safeProfile}
            />
          </View>
        )}

        {activeScreen === "profile" && (
          <View
            style={[
              styles.subScreenContainer,
              { backgroundColor: isLightMode ? "#FFFFFF" : "#0D1117" },
            ]}
          >
            <ProfileScreen
              profile={safeProfile}
              updateProfile={updateProfile}
              themeMode={themeMode as any}
              setThemeMode={setThemeMode as any}
              resolvedTheme={effectiveResolvedTheme as any}
              currency={safeCurrency}
              setCurrency={() => setIsCurrencyLockedModalOpen(true)}
              onNavigateAccounts={() =>
                handleSelectScreen("accounts" as ActiveScreen)
              }
              categories={categories}
              isLight={isLightMode}
              onAddCategory={addCategory as any}
              onUpdateCategory={updateCategory}
              onDeleteCategory={deleteCategory}
              onAddSubcategory={addSubcategory}
              onDeleteSubcategory={deleteSubcategory}
              onClearAllData={handleClearAllData}
              onReplayOnboarding={() => setShowSelectCurrency(true)}
              onOpenSettings={() =>
                handleSelectScreen("settings" as ActiveScreen)
              }
            />
          </View>
        )}

        {activeScreen === "settings" && (
          <View
            style={[
              styles.subScreenContainer,
              { backgroundColor: isLightMode ? "#FFFFFF" : "#0D1117" },
            ]}
          >
            <SettingsScreen
              themeMode={themeMode as any}
              setThemeMode={setThemeMode as any}
              resolvedTheme={effectiveResolvedTheme as any}
              currency={safeCurrency}
              setCurrency={() => setIsCurrencyLockedModalOpen(true)}
              onNavigateAccounts={() =>
                handleSelectScreen("accounts" as ActiveScreen)
              }
              categories={categories}
              isLight={isLightMode}
              onAddCategory={addCategory as any}
              onUpdateCategory={updateCategory}
              onDeleteCategory={deleteCategory}
              onAddSubcategory={addSubcategory}
              onDeleteSubcategory={deleteSubcategory}
              profile={safeProfile}
              updateProfile={updateProfile}
              onBack={() => handleSelectScreen("dashboard" as ActiveScreen)}
              onClearAllData={handleClearAllData}
              onReplayOnboarding={() => setShowSelectCurrency(true)}
              onShowUserGuide={openUserGuide}
            />
          </View>
        )}

        {activeScreen === "budgets" && (
          <View
            style={[
              styles.subScreenContainer,
              { backgroundColor: isLightMode ? "#FFFFFF" : "#0D1117" },
            ]}
          >
            <BudgetsScreen
              budgets={budgets}
              categories={categories}
              currency={safeCurrency}
              periodExpensesByCategory={periodExpensesByCategory}
              onAddOrUpdateBudget={addOrUpdateBudget}
              onDeleteBudget={deleteBudget}
              isLight={isLightMode}
              onNavigateLedgerTotal={() =>
                setActiveScreen("transactions" as ActiveScreen)
              }
            />
          </View>
        )}
      </View>

      {!isAddModalOpen && (
        <BottomNavigation
          activeScreen={activeScreen as ActiveScreen}
          onSelectScreen={handleSelectScreen}
          onAddPress={() => {
            setEditingTransaction(null);
            setAddModalInitialType("expense");
            setIsAddModalOpen(true);
          }}
          isLight={isLightMode}
          hasBottomBanner={isAdsEnabled && isBannerVisible}
          onLayout={(event: LayoutChangeEvent) =>
            setBottomNavTop(event.nativeEvent.layout.y)
          }
          onTabLayout={(tab, layout) =>
            setTabLayouts((prev) => ({ ...prev, [tab]: layout }))
          }
        />
      )}

      {isAdsEnabled && isBannerVisible && (
        <View
          style={[
            styles.bottomAdWrapper,
            {
              backgroundColor: isLightMode ? "#FFFFFF" : "#0D1117",
              paddingBottom: Math.max(insets.bottom, 4),
            },
          ]}
        >
          <View
            style={[
              styles.adCardContainer,
              { backgroundColor: isLightMode ? "#FFFFFF" : "#0D1117" },
            ]}
          >
            <BannerAd
              unitId={TestIds.BANNER}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            />
          </View>
        </View>
      )}

      {activeScreen === "dashboard" &&
        timeTab !== "Total" &&
        timeTab !== "Custom" &&
        !isAddModalOpen && (
          <DraggableAddButton
            hasBottomBanner={isAdsEnabled && isBannerVisible}
            bottomNavTop={bottomNavTop}
            onPositionChange={setDraggableButtonPos}
            onPress={() => {
              setEditingTransaction(null);
              setAddModalInitialType("expense");
              setIsAddModalOpen(true);
            }}
          />
        )}

      <AddTransactionModal
        visible={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={(data: Omit<Transaction, "id">) => {
          addTransaction(data);
          const config = remoteConfigService.getConfig();
          if (isAdsEnabled && config.overallInter) triggerDelayedInterstitial();
        }}
        onUpdate={(id: string, updated: Partial<Transaction>) =>
          updateTransaction?.(id, updated)
        }
        onDelete={(id: string) => deleteTransaction(id)}
        editingTransaction={editingTransaction}
        categories={categories}
        accounts={accounts}
        currency={safeCurrency}
        isLight={isLightMode}
        initialType={addModalInitialType}
      />
      <NotificationsModal
        visible={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        currency={safeCurrency}
        transactions={transactions}
        budgets={budgets}
        savingsGoals={savingsGoals}
        isLight={isLightMode}
      />
      <ProfileModal
        visible={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currency={safeCurrency}
        setCurrency={() => setIsCurrencyLockedModalOpen(true)}
        themeMode={themeMode as any}
        setThemeMode={setThemeMode as any}
        onReplaySplash={() => setShowSplash(true)}
        onReplayOnboarding={() => setShowSelectCurrency(true)}
        onReplayUserGuide={openUserGuide}
        onClearAllData={handleClearAllData}
        totalBalance={totalBalance}
        userName={`${safeProfile.firstName} ${safeProfile.lastName}`.trim()}
        avatarUrl={safeProfile.avatarUrl}
        userEmail=""
        onShowRewardedAd={() => showRewarded()}
        onShowRewardedInterstitialAd={showRewardedInterstitial}
        onShowInterstitialAd={() => triggerDelayedInterstitial()}
        onShowAppOpenAd={showAppOpen}
        isBannerVisible={isBannerVisible}
        onToggleBanner={toggleBanner}
        rewardPoints={rewardPoints}
        isProActive={isProActive}
        isLight={isLightMode}
      />
      <SearchModal
        visible={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        transactions={transactions}
        currency={safeCurrency}
        isLight={isLightMode}
      />
      <SelectAccountModal
        isOpen={isSelectAccountOpen}
        onClose={() => setIsSelectAccountOpen(false)}
        accounts={accounts}
        currency={safeCurrency}
        selectedAccountId={selectedAccountId}
        onSelectAccount={setSelectedAccountId}
        totalBalance={totalBalance}
        isLight={isLightMode}
      />
      <SelectCurrencyScreen
        visible={showSelectCurrency}
        currentCurrency={safeCurrency}
        onSelectCurrency={handleCurrencySelected}
        isLight={isLightMode}
      />
      <OnboardingFlow
        visible={showOnboarding}
        onFinish={handleOnboardingFinish}
      />
      <CurrencyLockedModal
        visible={isCurrencyLockedModalOpen}
        currency={safeCurrency}
        onClose={() => setIsCurrencyLockedModalOpen(false)}
        isLight={isLightMode}
      />
      <PaywallModal
        visible={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        closeTimerSeconds={
          remoteConfigService.getConfig().premiumScreenCloseTime
        }
        ctaColor={remoteConfigService.getConfig().adCtaColor}
        isLight={isLightMode}
        onSubscribe={async () => {
          await new Promise((r) => setTimeout(r, 1500));
          updateProfile?.({ showAds: false });
          setIsPaywallOpen(false);
          return true;
        }}
        onRestore={async () => {
          await new Promise((r) => setTimeout(r, 1500));
          updateProfile?.({ showAds: false });
          setIsPaywallOpen(false);
          return true;
        }}
      />
      <UserGuideOverlay
        visible={showUserGuide && isGuideLayoutReady}
        onClose={async () => {
          setShowUserGuide(false);
          try {
            await AsyncStorage.setItem("@spendly_user_guide_seen", "true");
          } catch {}
        }}
        isLight={isLightMode}
        hasBottomBanner={isAdsEnabled && isBannerVisible}
        bottomNavTop={bottomNavTop}
        bottomNavLayout={bottomNavLayout}
        tabLayouts={tabLayouts}
        draggableButtonPos={draggableButtonPos}
        balanceCardLayout={balanceCardLayout}
        statsCardLayout={statsCardLayout}
        headerLayout={headerLayout}
        headerContainerHeight={headerContainerHeight}
        headerPaddingTop={standardTabTopPadding}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ExpenseAppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, width: "100%", maxWidth: 412, alignSelf: "center" },
  mainContainerDark: { backgroundColor: "#0D1117" },
  mainContainerLight: { backgroundColor: "#FFFFFF" },
  screenWrapper: { flex: 1, width: "100%", position: "relative" },
  subScreenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },
  scrollArea: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  headerSection: { height: 76, marginTop: 0, justifyContent: "center" },
  balanceCardSection: { height: 160, marginTop: 0 },
  statsCardSection: { height: 66, marginTop: 14 },
  transactionsSection: { marginTop: 16 },
  customAppliedCard: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  customAppliedTextGroup: { flex: 1 },
  customAppliedTitle: { fontSize: 16, fontWeight: "700", color: "#012E4F" },
  customAppliedSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 2,
  },
  customChangeRangeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(52, 93, 122, 0.1)",
  },
  customChangeRangeText: { fontSize: 12, fontWeight: "600", color: "#345D7A" },
  bottomAdWrapper: {
    width: "100%",
    paddingHorizontal: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 0,
  },
  adCardContainer: {
    width: "100%",
    borderRadius: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
