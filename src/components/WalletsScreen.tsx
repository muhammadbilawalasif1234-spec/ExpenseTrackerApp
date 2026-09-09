import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CreditCard,
  Landmark,
  PiggyBank,
  Plus,
  Trash2,
  Wallet,
  X,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { Account, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';

interface WalletsScreenProps {
  accounts: Account[];
  currency: Currency;
  onAddAccount: (account: Omit<Account, 'id' | 'balance'>) => void;
  onDeleteAccount: (id: string) => void;
}

export const WalletsScreen: React.FC<WalletsScreenProps> = ({
  accounts,
  currency,
  onAddAccount,
  onDeleteAccount,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('cash');
  const [initialBalance, setInitialBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const totalNetWorth = accounts.reduce((sum, a) => sum + a.balance, 0);

  const getAccountIcon = (accType: Account['type'], color: string) => {
    switch (accType) {
      case 'bank':
        return <Landmark size={20} color={color} />;
      case 'credit':
        return <CreditCard size={20} color={color} />;
      case 'savings':
        return <PiggyBank size={20} color={color} />;
      default:
        return <Wallet size={20} color={color} />;
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const bal = parseFloat(initialBalance) || 0;

    let color = '#00C896';
    if (type === 'bank') color = '#4ECDC4';
    if (type === 'credit') color = '#A29BFE';
    if (type === 'savings') color = '#FFD93D';

    onAddAccount({
      name: name.trim(),
      type,
      initialBalance: bal,
      icon: type === 'bank' ? 'Landmark' : type === 'credit' ? 'CreditCard' : type === 'savings' ? 'PiggyBank' : 'Wallet',
      color,
      accountNumber: accountNumber.trim() || undefined,
    });

    setName('');
    setInitialBalance('');
    setAccountNumber('');
    setIsModalOpen(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Total Balance Card */}
      <View style={styles.netWorthCard}>
        <Text style={styles.netWorthLabel} numberOfLines={1}>
          COMBINED NET WORTH
        </Text>
        <Text
          style={styles.netWorthAmount}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          {formatCurrency(totalNetWorth, currency)}
        </Text>
        <Text style={styles.accountsCount} numberOfLines={1}>
          Across {accounts.length} linked accounts
        </Text>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle} numberOfLines={1} ellipsizeMode="tail">
          Wallets & Accounts
        </Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.8}
        >
          <Plus size={14} color={COLORS.primary} />
          <Text style={styles.addBtnText}>Add Wallet</Text>
        </TouchableOpacity>
      </View>

      {/* Account Cards */}
      <View style={styles.accountsList}>
        {accounts.map((acc) => (
          <View key={acc.id} style={styles.accountCard}>
            <View style={styles.leftCol}>
              <View style={[styles.iconBox, { backgroundColor: `${acc.color}20` }]}>
                {getAccountIcon(acc.type, acc.color)}
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName} numberOfLines={1} ellipsizeMode="tail">
                  {acc.name}
                </Text>
                <Text style={styles.accountMeta} numberOfLines={1}>
                  {acc.type.toUpperCase()} {acc.accountNumber ? `• ${acc.accountNumber}` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.rightCol}>
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
              {accounts.length > 1 && (
                <TouchableOpacity
                  onPress={() => onDeleteAccount(acc.id)}
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color={COLORS.grayDark} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Add Account Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide" onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Account</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={20} color={COLORS.grayLight} />
              </TouchableOpacity>
            </View>

            {/* Type selector */}
            <Text style={styles.inputLabel}>Account Type</Text>
            <View style={styles.typesRow}>
              {(['cash', 'bank', 'credit', 'savings'] as Account['type'][]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, type === t && styles.typeChipActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Account Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Standard Chartered Bank, My Cash"
              placeholderTextColor={COLORS.grayDark}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inputLabel}>Starting Balance ({currency.symbol})</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0.00"
              placeholderTextColor={COLORS.grayDark}
              keyboardType="decimal-pad"
              value={initialBalance}
              onChangeText={setInitialBalance}
            />

            <Text style={styles.inputLabel}>Account Number / Last 4 digits (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="•••• 1234"
              placeholderTextColor={COLORS.grayDark}
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Plus size={18} color="#000000" />
              <Text style={styles.saveBtnText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  netWorthCard: {
    backgroundColor: '#00896B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  netWorthLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 1,
    marginBottom: 6,
  },
  netWorthAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  accountsCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 83, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
    flexShrink: 0,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  accountsList: {
    gap: 12,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  accountInfo: {
    flex: 1,
    minWidth: 0,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  accountMeta: {
    fontSize: 11,
    color: COLORS.grayDark,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 6,
    minWidth: 80,
    flexShrink: 0,
  },
  accountBalance: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  deleteBtn: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 8,
    marginTop: 10,
  },
  typesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  typeChip: {
    flex: 1,
    backgroundColor: '#262626',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.grayLight,
  },
  typeChipTextActive: {
    color: COLORS.primary,
  },
  textInput: {
    backgroundColor: '#141414',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.white,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginTop: 20,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
});
