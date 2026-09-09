export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'savings' | 'investment';
  balance: number;
  initialBalance: number;
  icon: string;
  color: string;
  accountNumber?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  accountId: string;
  toAccountId?: string;
  date: string;
  note?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'monthly' | 'weekly' | 'yearly';
  alertThreshold?: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  categoryIcon: string;
  color: string;
}

export type TimeTab = 'Daily' | 'Monthly' | 'Yearly';

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  position: 'prefix' | 'suffix';
};

export interface FilterOptions {
  searchQuery: string;
  type: 'all' | TransactionType;
  category: string;
  accountId: string;
  startDate: string;
  endDate: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export type ActiveScreen = 'dashboard' | 'transactions' | 'reports' | 'budgets' | 'accounts';
