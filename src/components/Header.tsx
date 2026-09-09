import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, Search, SlidersHorizontal, Sparkles } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface HeaderProps {
  userName?: string;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  onSearchPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'Muhammad Bilawal',
  onNotificationsPress,
  onProfilePress,
  onSearchPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Profile & Logo Avatar button */}
      <TouchableOpacity
        style={styles.leftRow}
        onPress={onProfilePress}
        activeOpacity={0.75}
      >
        <View style={styles.avatarWrapper}>
          <Image
            source={require('../assets/i.png')}
            style={styles.avatarImage}
            resizeMode="cover"
          />
          <View style={styles.onlineDot} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
              {userName}
            </Text>
            <View style={styles.proBadge}>
              <Text style={styles.proText}>PRO</Text>
            </View>
          </View>
          <Text style={styles.greeting} numberOfLines={1}>
            Expense Tracker
          </Text>
        </View>
      </TouchableOpacity>

      {/* Top Bar Action Icons: Search, Notifications, Settings */}
      <View style={styles.rightButtons}>
        {/* Search button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSearchPress}
          activeOpacity={0.75}
          accessibilityLabel="Search"
        >
          <Search size={16} color="#CBD5E1" />
        </TouchableOpacity>

        {/* Notifications Bell button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationsPress}
          activeOpacity={0.75}
          accessibilityLabel="Notifications"
        >
          <Bell size={16} color="#CBD5E1" />
          <View style={styles.badge} />
        </TouchableOpacity>

        {/* Settings / Bio button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onProfilePress}
          activeOpacity={0.75}
          accessibilityLabel="Settings"
        >
          <SlidersHorizontal size={16} color="#CBD5E1" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0D1117',
    borderBottomWidth: 1,
    borderBottomColor: '#21262D',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  avatarWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E2430',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#0D1117',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  userName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  proBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  proText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#F59E0B',
  },
  greeting: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
    fontWeight: '500',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#161B22',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#30363D',
    flexShrink: 0,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
});
