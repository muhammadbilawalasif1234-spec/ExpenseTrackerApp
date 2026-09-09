import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CreditCard, Landmark, PiggyBank, Plus, Wallet } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { Account, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AccountsListProps {
  accounts: Account[];
  selectedAccountId: string | null;
  onSelectAccount: (id: string | null) => void;
  onAddAccount: () => void;
  currency: Currency;
}

export const AccountsList: React.FC<AccountsListProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onAddAccount,
  currency,
}) => {
  const getIcon = (type: Account['type'], color: string) => {
    switch (type) {
      case 'bank':
        return <Landmark size={18} color={color} />;
      case 'credit':
        return <CreditCard size={18} color={color} />;
      case 'savings':
        return <PiggyBank size={18} color={color} />;
      default:
        return <Wallet size={18} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          Accounts & Wallets
        </Text>
        <TouchableOpacity onPress={onAddAccount} style={styles.addButton} activeOpacity={0.8}>
          <Plus size={14} color={COLORS.primary} />
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          onPress={() => onSelectAccount(null)}
          style={[
            styles.accountCard,
            selectedAccountId === null && styles.accountCardActive,
          ]}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#334155' }]}>
            <Wallet size={18} color={COLORS.white} />
          </View>
          <Text style={styles.accountName} numberOfLines={1}>
            All Accounts
          </Text>
          <Text style={styles.accountBalance} numberOfLines={1}>
            Overview
          </Text>
        </TouchableOpacity>

        {accounts.map((acc) => {
          const isSelected = selectedAccountId === acc.id;
          return (
            <TouchableOpacity
              key={acc.id}
              onPress={() => onSelectAccount(isSelected ? null : acc.id)}
              style={[
                styles.accountCard,
                isSelected && styles.accountCardActive,
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${acc.color}20` },
                ]}
              >
                {getIcon(acc.type, acc.color)}
              </View>
              <Text style={styles.accountName} numberOfLines={1} ellipsizeMode="tail">
                {acc.name}
              </Text>
              <Text
                style={[
                  styles.accountBalance,
                  acc.balance < 0 && { color: COLORS.expense },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {formatCurrency(acc.balance, currency)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 200, 83, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
  },
  addText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  accountCard: {
    width: 135,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
  },
  accountCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#1E2C22',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  accountName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.grayLight,
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
  },
});
