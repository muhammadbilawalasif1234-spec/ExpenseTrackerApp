import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { Currency } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface NotificationItem {
  id: string;
  type: 'alert' | 'success' | 'info' | 'tip';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  currency: Currency;
  totalBalance: number;
  periodExpense: number;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  currency,
  totalBalance,
  periodExpense,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'tip',
      title: 'Smart Spending Alert',
      message: `Your current monthly spending is ${formatCurrency(periodExpense, currency)}. You are well within your target budget limits!`,
      time: '10m ago',
      read: false,
    },
    {
      id: '2',
      type: 'success',
      title: 'Savings Progress',
      message: 'You have maintained a positive cash flow this month. Great discipline!',
      time: '2h ago',
      read: false,
    },
    {
      id: '3',
      type: 'alert',
      title: 'Budget Limit Notice',
      message: 'Dining & Food expense has reached 65% of allocated monthly budget.',
      time: 'Yesterday',
      read: false,
    },
    {
      id: '4',
      type: 'info',
      title: 'Vault Sync Complete',
      message: `All transactions are encrypted and stored safely on device. Total net worth: ${formatCurrency(totalBalance, currency)}.`,
      time: '2 days ago',
      read: true,
    },
  ]);

  if (!visible) return null;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle size={15} color="#F59E0B" />;
      case 'success':
        return <CheckCircle2 size={15} color={COLORS.primary} />;
      case 'tip':
        return <Sparkles size={15} color="#A855F7" />;
      default:
        return <Info size={15} color="#3B82F6" />;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.bellIconBox}>
                <Bell size={16} color="#F59E0B" />
              </View>
              <View>
                <View style={styles.titleRow}>
                  <Text style={styles.titleText}>Notifications</Text>
                  {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{unreadCount} new</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.subtitleText}>Financial alerts & updates</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={16} color={COLORS.grayLight} />
            </TouchableOpacity>
          </View>

          {/* Action Row */}
          {notifications.length > 0 && (
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={markAllAsRead} activeOpacity={0.7}>
                <Text style={styles.actionLink}>Mark all as read</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={clearAll}
                style={styles.clearBtn}
                activeOpacity={0.7}
              >
                <Trash2 size={12} color="#FB7185" />
                <Text style={styles.clearText}>Clear all</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* List */}
          <ScrollView style={styles.listArea} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.emptyBox}>
                <Bell size={32} color={COLORS.grayDark} />
                <Text style={styles.emptyTitle}>All caught up!</Text>
                <Text style={styles.emptyDesc}>No new alerts or pending notices.</Text>
              </View>
            ) : (
              notifications.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.notifCard,
                    item.read ? styles.notifCardRead : styles.notifCardUnread,
                  ]}
                >
                  <View style={styles.notifIconBox}>{getIcon(item.type)}</View>

                  <View style={styles.notifContent}>
                    <View style={styles.notifHeader}>
                      <Text style={styles.notifTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.notifTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.notifMsg}>{item.message}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => deleteNotification(item.id)}
                    style={styles.dismissBtn}
                    activeOpacity={0.7}
                  >
                    <X size={12} color={COLORS.grayDark} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.closeFooterText}>Close</Text>
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
    maxHeight: '85%',
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
    flex: 1,
  },
  bellIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unreadBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
  },
  unreadText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000000',
  },
  subtitleText: {
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  actionLink: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FB7185',
  },
  listArea: {
    maxHeight: 360,
  },
  emptyBox: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  notifCardUnread: {
    backgroundColor: '#1E2430',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  notifCardRead: {
    backgroundColor: '#12161E',
    borderColor: '#252C36',
    opacity: 0.8,
  },
  notifIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#21262D',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  notifContent: {
    flex: 1,
    minWidth: 0,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 6,
  },
  notifTime: {
    fontSize: 10,
    color: '#64748B',
  },
  notifMsg: {
    fontSize: 11,
    lineHeight: 16,
    color: '#CBD5E1',
    marginTop: 2,
  },
  dismissBtn: {
    padding: 4,
    marginTop: 2,
  },
  closeFooterBtn: {
    backgroundColor: '#21262D',
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  closeFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
});
