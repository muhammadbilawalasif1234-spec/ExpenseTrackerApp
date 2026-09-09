import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart3, Home, ListFilter, Plus, Target, Wallet } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { ActiveScreen } from '../types';

interface BottomNavigationProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  onAddPress: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeScreen,
  onSelectScreen,
  onAddPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Home / Dashboard */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onSelectScreen('dashboard')}
        activeOpacity={0.7}
      >
        <Home
          size={20}
          color={activeScreen === 'dashboard' ? COLORS.primary : COLORS.grayDark}
        />
        <Text
          style={[
            styles.navText,
            activeScreen === 'dashboard' && styles.activeNavText,
          ]}
        >
          Overview
        </Text>
      </TouchableOpacity>

      {/* Transactions */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onSelectScreen('transactions')}
        activeOpacity={0.7}
      >
        <ListFilter
          size={20}
          color={activeScreen === 'transactions' ? COLORS.primary : COLORS.grayDark}
        />
        <Text
          style={[
            styles.navText,
            activeScreen === 'transactions' && styles.activeNavText,
          ]}
        >
          Activity
        </Text>
      </TouchableOpacity>

      {/* Center Floating Action Button */}
      <TouchableOpacity
        style={styles.centerFab}
        onPress={onAddPress}
        activeOpacity={0.85}
      >
        <Plus size={26} color="#000000" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Analytics / Reports */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onSelectScreen('reports')}
        activeOpacity={0.7}
      >
        <BarChart3
          size={20}
          color={activeScreen === 'reports' ? COLORS.primary : COLORS.grayDark}
        />
        <Text
          style={[
            styles.navText,
            activeScreen === 'reports' && styles.activeNavText,
          ]}
        >
          Analytics
        </Text>
      </TouchableOpacity>

      {/* Accounts */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onSelectScreen('accounts')}
        activeOpacity={0.7}
      >
        <Wallet
          size={20}
          color={activeScreen === 'accounts' ? COLORS.primary : COLORS.grayDark}
        />
        <Text
          style={[
            styles.navText,
            activeScreen === 'accounts' && styles.activeNavText,
          ]}
        >
          Wallets
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#161616',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 8,
    position: 'relative',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: 60,
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.grayDark,
  },
  activeNavText: {
    color: COLORS.primary,
  },
  centerFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    top: -16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
