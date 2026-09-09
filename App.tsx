import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { AccountsList } from './src/components/AccountsList';
import { ActivityScreen } from './src/components/ActivityScreen';
import { AddTransactionModal } from './src/components/AddTransactionModal';
import { AnalyticsScreen } from './src/components/AnalyticsScreen';
import { BalanceCard } from './src/components/BalanceCard';
import { BottomNavigation } from './src/components/BottomNavigation';
import { BudgetsScreen } from './src/components/BudgetsScreen';
import { CategorySpendingCard } from './src/components/CategorySpendingCard';
import { Header } from './src/components/Header';
import { NotificationsModal } from './src/components/Models/NotificationsModel';
import { MonthlyOverviewChart } from './src/components/MonthlyOverviewChart';
import { ProfileModal } from './src/components/ProfileModel';
import { SavingsGoalsSection } from './src/components/SavingsGoalsSection';
import { SearchModal } from './src/components/SearchModel';
import { SplashScreen } from './src/components/SplashScreen';
import { TimePeriodSelector } from './src/components/TimePeriodSelector';
import { TransactionsSection } from './src/components/TransactionsSection';
import { WalletsScreen } from './src/components/WalletsScreen';
import { COLORS } from './src/constants/theme';
import { useExpenseData } from './src/hooks/useExpenseData';

function ExpenseAppContent() {
  const insets = useSafeAreaInsets();
  const [showSplash, setShowSplash] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const {
    isLoading,
    totalBalance,
    periodStats,
    currency,
    setCurrency,
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    timeTab,
    setTimeTab,
    categorySpendingData,
    cashFlowTrendData,
    filteredTransactions,
    transactions,
    budgets,
    savingsGoals,
    addTransaction,
    deleteTransaction,
    addOrUpdateBudget,
    deleteBudget,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addAccount,
    deleteAccount,
    isAddModalOpen,
    setIsAddModalOpen,
    activeScreen,
    setActiveScreen,
    categories,
    navigatePeriod,
    getPeriodDisplayLabel,
  } = useExpenseData();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Loading Expense Tracker...</Text>
      </View>
    );
  }

  // Calculate expenses by category for Budgets
  const periodExpensesByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const key = t.category.toLowerCase();
      periodExpensesByCategory[key] = (periodExpensesByCategory[key] || 0) + t.amount;
    });

  return (
    <View
      style={[
        styles.mainContainer,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />

      {/* Top Header with working icon handlers */}
      <Header
        userName="Muhammad Bilawal"
        onNotificationsPress={() => setIsNotificationsOpen(true)}
        onProfilePress={() => setIsProfileOpen(true)}
        onSearchPress={() => setIsSearchOpen(true)}
      />

      {/* 1. OVERVIEW / DASHBOARD SCREEN */}
      {activeScreen === 'dashboard' && (
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Balance Overview Card */}
          <BalanceCard
            totalBalance={totalBalance}
            periodIncome={periodStats.income}
            periodExpense={periodStats.expense}
            currency={currency}
            periodLabel={timeTab}
            onAddPress={() => setIsAddModalOpen(true)}
            onTransferPress={() => setIsAddModalOpen(true)}
          />

          {/* Accounts Horizontal Scroll */}
          <AccountsList
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            onSelectAccount={setSelectedAccountId}
            onAddAccount={() => setActiveScreen('accounts')}
            currency={currency}
          />

          {/* Daily / Monthly / Yearly Period Switcher */}
          <TimePeriodSelector
            timeTab={timeTab}
            onSelectTab={setTimeTab}
            periodLabel={getPeriodDisplayLabel()}
            onPrev={() => navigatePeriod('prev')}
            onNext={() => navigatePeriod('next')}
          />

          {/* Category Spending Breakdown with Donut Chart */}
          <CategorySpendingCard
            items={categorySpendingData.items}
            totalExpense={categorySpendingData.totalExpense}
            currency={currency}
            periodLabel={getPeriodDisplayLabel()}
          />

          {/* Monthly Overview Income vs Expense Bar Chart */}
          <MonthlyOverviewChart
            data={cashFlowTrendData}
            currency={currency}
          />

          {/* Savings Goals Section with Circular Progress Charts */}
          <SavingsGoalsSection
            goals={savingsGoals}
            currency={currency}
            onAddGoal={addSavingsGoal}
            onUpdateGoal={updateSavingsGoal}
            onDeleteGoal={deleteSavingsGoal}
          />

          {/* Transactions List */}
          <TransactionsSection
            transactions={filteredTransactions}
            currency={currency}
            onAddTransaction={() => setIsAddModalOpen(true)}
            onViewAll={() => setActiveScreen('transactions')}
          />
        </ScrollView>
      )}

      {/* 2. ACTIVITY / TRANSACTIONS SCREEN */}
      {activeScreen === 'transactions' && (
        <ActivityScreen
          transactions={transactions}
          categories={categories}
          accounts={accounts}
          currency={currency}
          onAddTransaction={() => setIsAddModalOpen(true)}
          onDeleteTransaction={deleteTransaction}
        />
      )}

      {/* 3. ANALYTICS / REPORTS SCREEN */}
      {activeScreen === 'reports' && (
        <AnalyticsScreen
          transactions={transactions}
          categoryItems={categorySpendingData.items}
          totalExpense={categorySpendingData.totalExpense}
          currency={currency}
          timeTab={timeTab}
          periodStats={periodStats}
          cashFlowTrendData={cashFlowTrendData}
          onPeriodChange={setTimeTab}
        />
      )}

      {/* 4. WALLETS / ACCOUNTS SCREEN */}
      {activeScreen === 'accounts' && (
        <WalletsScreen
          accounts={accounts}
          currency={currency}
          onAddAccount={addAccount}
          onDeleteAccount={deleteAccount}
        />
      )}

      {/* 5. BUDGETS & GOALS SCREEN */}
      {activeScreen === 'budgets' && (
        <BudgetsScreen
          budgets={budgets}
          categories={categories}
          currency={currency}
          periodExpensesByCategory={periodExpensesByCategory}
          savingsGoals={savingsGoals}
          onAddOrUpdateBudget={addOrUpdateBudget}
          onDeleteBudget={deleteBudget}
          onAddSavingsGoal={addSavingsGoal}
          onUpdateSavingsGoal={updateSavingsGoal}
          onDeleteSavingsGoal={deleteSavingsGoal}
        />
      )}

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        onAddPress={() => setIsAddModalOpen(true)}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addTransaction}
        categories={categories}
        accounts={accounts}
        currency={currency}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        visible={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        currency={currency}
        totalBalance={totalBalance}
        periodExpense={periodStats.expense}
      />

      {/* Profile & Settings Modal */}
      <ProfileModal
        visible={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currency={currency}
        setCurrency={setCurrency}
        onReplaySplash={() => setShowSplash(true)}
        totalBalance={totalBalance}
        userName="Muhammad Bilawal"
        userEmail="muhammadbilawalasif1234@gmail.com"
      />

      {/* Search Modal */}
      <SearchModal
        visible={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        transactions={transactions}
        currency={currency}
      />

      {/* Expo Go Animated Splash Screen */}
      <SplashScreen
        visible={showSplash}
        onComplete={() => setShowSplash(false)}
        appName="Expense Tracker"
        bio="Smart Wealth & Expense Management • Take complete control of your financial journey with real-time analytics, multi-wallet sync, and budget goals."
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D1117',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
