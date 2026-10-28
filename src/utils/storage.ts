import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_BUDGETS,
  DEFAULT_CATEGORIES,
  DEFAULT_SAVINGS_GOALS,
  generateSampleTransactions,
} from "../constants/theme";
import {
  Account,
  Budget,
  Category,
  Currency,
  SavingsGoal,
  Transaction,
  UserProfile,
} from "../types";

const STORAGE_KEYS = {
  TRANSACTIONS: "exp_tracker_transactions",
  CATEGORIES: "exp_tracker_categories",
  ACCOUNTS: "exp_tracker_accounts",
  BUDGETS: "exp_tracker_budgets",
  SAVINGS_GOALS: "exp_tracker_goals",
  CURRENCY: "exp_tracker_currency",
  THEME_MODE: "exp_tracker_theme_mode",
  PROFILE: "exp_tracker_profile",
  LEDGER_NOTES: "exp_tracker_ledger_notes",
};

export const getStoredTransactions = async (): Promise<Transaction[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      const sample = generateSampleTransactions();
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(sample),
      );
      return sample;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const sample = generateSampleTransactions();
    await AsyncStorage.setItem(
      STORAGE_KEYS.TRANSACTIONS,
      JSON.stringify(sample),
    );
    return sample;
  } catch (err) {
    console.error("Failed to parse transactions from storage:", err);
    return generateSampleTransactions();
  }
};

export const saveStoredTransactions = async (
  transactions: Transaction[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.TRANSACTIONS,
      JSON.stringify(transactions),
    );
  } catch (err) {
    console.error("Failed to save transactions to storage:", err);
  }
};

export const getStoredCategories = async (): Promise<Category[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
};

export const saveStoredCategories = async (
  categories: Category[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.CATEGORIES,
      JSON.stringify(categories),
    );
  } catch (err) {
    console.error("Failed to save categories:", err);
  }
};

export const getStoredAccounts = async (): Promise<Account[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      return DEFAULT_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      let cleaned = parsed
        .filter((a: Account) => a.type !== "savings" && a.id !== "acc-savings")
        .map((a: Account) => {
          if (a.id === "acc-bank" || a.type === "bank") {
            return {
              ...a,
              id: "acc-debit",
              name: "Debit Card",
              type: "debit" as const,
              icon: "CreditCard",
              color: "#4ECDC4",
            };
          }
          if (a.id === "acc-cash") {
            return {
              ...a,
              name: "Cash",
              icon: "Coins",
            };
          }
          return a;
        });

      // Deduplicate by ID so no two accounts ever share the same ID
      const seenIds = new Set<string>();
      const dedupedCleaned: Account[] = [];
      for (const a of cleaned) {
        if (!a || !a.id) continue;
        if (!seenIds.has(a.id)) {
          seenIds.add(a.id);
          dedupedCleaned.push(a);
        } else {
          // If another account already has this ID, check if it's a distinct account
          if (
            a.name &&
            !dedupedCleaned.some(
              (existing) =>
                existing.name.toLowerCase() === a.name.toLowerCase(),
            )
          ) {
            const uniqueId = `${a.id}-${dedupedCleaned.length}`;
            seenIds.add(uniqueId);
            dedupedCleaned.push({ ...a, id: uniqueId });
          }
        }
      }
      cleaned = dedupedCleaned;

      const existingIds = new Set(cleaned.map((a: Account) => a.id));
      const missing = DEFAULT_ACCOUNTS.filter((d) => !existingIds.has(d.id));
      if (missing.length > 0) {
        cleaned = [...cleaned, ...missing];
      }
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACCOUNTS,
        JSON.stringify(cleaned),
      );
      return cleaned;
    }
    return DEFAULT_ACCOUNTS;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
};

export const saveStoredAccounts = async (
  accounts: Account[],
): Promise<void> => {
  try {
    const seenIds = new Set<string>();
    const deduped: Account[] = [];
    for (const a of accounts) {
      if (!a || !a.id) continue;
      if (!seenIds.has(a.id)) {
        seenIds.add(a.id);
        deduped.push(a);
      } else if (
        a.name &&
        !deduped.some(
          (existing) => existing.name.toLowerCase() === a.name.toLowerCase(),
        )
      ) {
        const uniqueId = `${a.id}-${deduped.length}`;
        seenIds.add(uniqueId);
        deduped.push({ ...a, id: uniqueId });
      }
    }
    await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(deduped));
  } catch (err) {
    console.error("Failed to save accounts:", err);
  }
};

export const getStoredBudgets = async (): Promise<Budget[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
};

export const saveStoredBudgets = async (budgets: Budget[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (err) {
    console.error("Failed to save budgets:", err);
  }
};

export const getStoredSavingsGoals = async (): Promise<SavingsGoal[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
};

export const saveStoredSavingsGoals = async (
  goals: SavingsGoal[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.SAVINGS_GOALS,
      JSON.stringify(goals),
    );
  } catch (err) {
    console.error("Failed to save savings goals:", err);
  }
};

export const getStoredCurrency = async (): Promise<Currency> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CURRENCY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.code === "PKR" || parsed.symbol?.includes("Rs")) {
        parsed.symbol = "PKR ";
      }
      return parsed;
    }
  } catch {}
  return {
    code: "PKR",
    symbol: "PKR ",
    name: "Pakistani Rupee",
    position: "prefix",
  };
};

export const saveStoredCurrency = async (currency: Currency): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(currency));
  } catch (err) {
    console.error("Failed to save currency:", err);
  }
};

export const getStoredThemeMode = async (): Promise<
  "dark" | "light" | "default"
> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
    if (raw === "dark" || raw === "light" || raw === "default") return raw;
  } catch {}
  return "light";
};

export const saveStoredThemeMode = async (
  mode: "dark" | "light" | "default",
): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  } catch (err) {
    console.error("Failed to save theme mode:", err);
  }
};

export const getStoredProfile = async (): Promise<UserProfile> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        firstName: parsed.firstName || "",
        lastName: parsed.lastName || "",
        avatarUrl: parsed.avatarUrl || null,
        showAds: parsed.showAds ?? true,
      };
    }
  } catch {}
  return { firstName: "", lastName: "", avatarUrl: null, showAds: true };
};

export const saveStoredProfile = async (
  profile: UserProfile,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error("Failed to save profile:", err);
  }
};

export const getStoredLedgerNotes = async (): Promise<any[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.LEDGER_NOTES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((n: any) => n && n.id !== "note-default-1");
    }
    return [];
  } catch {
    return [];
  }
};

export const saveStoredLedgerNotes = async (notes: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.LEDGER_NOTES,
      JSON.stringify(notes),
    );
  } catch (err) {
    console.error("Failed to save ledger notes:", err);
  }
};

export const clearAllAppData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
    await AsyncStorage.removeItem("@spendly_has_onboarded");
    await saveStoredTransactions([]);
    await saveStoredAccounts(DEFAULT_ACCOUNTS);
    await saveStoredBudgets([]);
    await saveStoredSavingsGoals([]);
    await saveStoredProfile({ firstName: "", lastName: "", avatarUrl: null });
    await AsyncStorage.removeItem("exp_tracker_ledger_notes");
  } catch (err) {
    console.error("Failed to clear app data:", err);
  }
};

export const resetToDemoData = clearAllAppData;
