import React from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Check,
  Coins,
  Download,
  Mail,
  Play,
  RotateCcw,
  Shield,
  SlidersHorizontal,
  Sparkles,
  User,
  X,
} from 'lucide-react-native';
import { COLORS, CURRENCIES } from '../constants/theme';
import { Currency } from '../types';
import { formatCurrency } from '../utils/formatters';
import { AppLogo } from './AppLogo';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  onReplaySplash: () => void;
  totalBalance: number;
  userName?: string;
  userEmail?: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  currency,
  setCurrency,
  onReplaySplash,
  totalBalance,
  userName = 'Muhammad Bilawal',
  userEmail = 'muhammadbilawalasif1234@gmail.com',
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <AppLogo size={34} />
              <View>
                <Text style={styles.headerTitle}>Expense Tracker</Text>
                <Text style={styles.headerSubtitle}>Profile & System Settings</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={16} color={COLORS.grayLight} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* User Profile Card */}
            <View style={styles.userCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>MB</Text>
              </View>
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {userName}
                  </Text>
                  <View style={styles.proTag}>
                    <Text style={styles.proTagText}>PRO</Text>
                  </View>
                </View>
                <View style={styles.emailRow}>
                  <Mail size={11} color="#94A3B8" />
                  <Text style={styles.emailText} numberOfLines={1}>
                    {userEmail}
                  </Text>
                </View>
                <Text style={styles.statusText}>Active Member • Offline Vault Sync</Text>
              </View>
            </View>

            {/* Currency Selector */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <Coins size={14} color="#F59E0B" />
                  <Text style={styles.sectionTitle}>Base Currency</Text>
                </View>
                <Text style={styles.currentCurrencyText}>
                  {currency.code} ({currency.symbol.trim()})
                </Text>
              </View>

              <View style={styles.currencyGrid}>
                {CURRENCIES.map((c) => {
                  const isSelected = c.code === currency.code;
                  return (
                    <TouchableOpacity
                      key={c.code}
                      onPress={() => setCurrency(c)}
                      style={[
                        styles.currencyButton,
                        isSelected && styles.currencyButtonActive,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.currencyBtnCode,
                          isSelected && styles.currencyBtnCodeActive,
                        ]}
                      >
                        {c.code}
                      </Text>
                      <Text
                        style={[
                          styles.currencyBtnSymbol,
                          isSelected && styles.currencyBtnSymbolActive,
                        ]}
                      >
                        {c.symbol.trim()}
                      </Text>
                      {isSelected && (
                        <Check size={11} color="#000000" strokeWidth={3} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* App Actions & Tools */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionCategoryTitle}>App Actions & Tools</Text>

              {/* Replay Splash Screen */}
              <TouchableOpacity
                style={styles.actionRowBtn}
                onPress={() => {
                  onClose();
                  onReplaySplash();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.actionLeft}>
                  <View style={[styles.actionIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <Play size={15} color="#F59E0B" />
                  </View>
                  <View style={styles.actionTexts}>
                    <Text style={styles.actionTitle}>Replay Splash Screen</Text>
                    <Text style={styles.actionSubtitle}>View logo, app bio & loading board</Text>
                  </View>
                </View>
                <Text style={styles.actionLinkText}>Play</Text>
              </TouchableOpacity>

              {/* Reset Demo Data */}
              <TouchableOpacity
                style={styles.actionRowBtn}
                onPress={() => {
                  Alert.alert(
                    'Reset Data',
                    'Would you like to reset your transactions and budget entries back to demo state?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Reset',
                        style: 'destructive',
                        onPress: () => {
                          onClose();
                        },
                      },
                    ]
                  );
                }}
                activeOpacity={0.7}
              >
                <View style={styles.actionLeft}>
                  <View style={[styles.actionIconBox, { backgroundColor: 'rgba(251, 113, 133, 0.15)' }]}>
                    <RotateCcw size={15} color="#FB7185" />
                  </View>
                  <View style={styles.actionTexts}>
                    <Text style={styles.actionTitle}>Reset Demo Data</Text>
                    <Text style={styles.actionSubtitle}>Restore original demo ledger</Text>
                  </View>
                </View>
                <Text style={[styles.actionLinkText, { color: '#FB7185' }]}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Bio & Version Card */}
            <View style={styles.bioCard}>
              <Text style={styles.bioTitle}>Expense Tracker • Smart Wealth</Text>
              <Text style={styles.bioDesc}>
                Take complete control of your financial journey with real-time analytics, multi-wallet sync, and budget goals.
              </Text>
              <Text style={styles.bioFooter}>100% Encrypted Local Storage • Version 2.5.0</Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: '#161B22',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#30363D',
    padding: 18,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#21262D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    maxHeight: 460,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#1E2430',
    borderWidth: 1,
    borderColor: '#30363D',
    marginBottom: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  proTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  proTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  emailText: {
    fontSize: 11,
    color: '#94A3B8',
    flexShrink: 1,
  },
  statusText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 3,
  },
  sectionBox: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#12161E',
    borderWidth: 1,
    borderColor: '#252C36',
    marginBottom: 12,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  currentCurrencyText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#1C222D',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  currencyButtonActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  currencyBtnCode: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  currencyBtnCodeActive: {
    color: '#000000',
  },
  currencyBtnSymbol: {
    fontSize: 10,
    color: '#94A3B8',
  },
  currencyBtnSymbolActive: {
    color: '#000000',
  },
  actionsSection: {
    gap: 8,
    marginBottom: 12,
  },
  sectionCategoryTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#1C222D',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  actionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTexts: {
    flex: 1,
    minWidth: 0,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  actionLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  bioCard: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#12161E',
    borderWidth: 1,
    borderColor: '#252C36',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  bioTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  bioDesc: {
    fontSize: 10,
    lineHeight: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  bioFooter: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
});
