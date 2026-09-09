import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_BUDGETS,
  DEFAULT_CATEGORIES,
  DEFAULT_SAVINGS_GOALS,
  generateSampleTransactions,
} from '../constants/theme';
import { Account, Budget, Category, Currency, SavingsGoal, Transaction } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'exp_tracker_transactions',
  CATEGORIES: 'exp_tracker_categories',
  ACCOUNTS: 'exp_tracker_accounts',
  BUDGETS: 'exp_tracker_budgets',
  SAVINGS_GOALS: 'exp_tracker_goals',
  CURRENCY: 'exp_tracker_currency',
};

export const getStoredTransactions = async (): Promise<Transaction[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      const initial = generateSampleTransactions();
      await saveStoredTransactions(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse transactions from storage:', err);
    return generateSampleTransactions();
  }
};

export const saveStoredTransactions = async (transactions: Transaction[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions to storage:', err);
  }
};

export const getStoredCategories = async (): Promise<Category[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      await saveStoredCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CATEGORIES;
  }
};

export const saveStoredCategories = async (categories: Category[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories:', err);
  }
};

export const getStoredAccounts = async (): Promise<Account[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      await saveStoredAccounts(DEFAULT_ACCOUNTS);
      return DEFAULT_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ACCOUNTS;
  }
};

export const saveStoredAccounts = async (accounts: Account[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save accounts:', err);
  }
};

export const getStoredBudgets = async (): Promise<Budget[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (!raw) {
      await saveStoredBudgets(DEFAULT_BUDGETS);
      return DEFAULT_BUDGETS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_BUDGETS;
  }
};

export const saveStoredBudgets = async (budgets: Budget[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (err) {
    console.error('Failed to save budgets:', err);
  }
};

export const getStoredSavingsGoals = async (): Promise<SavingsGoal[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
    if (!raw) {
      await saveStoredSavingsGoals(DEFAULT_SAVINGS_GOALS);
      return DEFAULT_SAVINGS_GOALS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SAVINGS_GOALS;
  }
};

export const saveStoredSavingsGoals = async (goals: SavingsGoal[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
  } catch (err) {
    console.error('Failed to save savings goals:', err);
  }
};

export const getStoredCurrency = async (): Promise<Currency> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CURRENCY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { code: 'PKR', symbol: 'Rs. ', name: 'Pakistani Rupee', position: 'prefix' };
};

export const saveStoredCurrency = async (currency: Currency): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(currency));
  } catch (err) {
    console.error('Failed to save currency:', err);
  }
};
