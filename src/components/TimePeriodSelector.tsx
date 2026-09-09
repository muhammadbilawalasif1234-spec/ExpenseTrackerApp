import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { TimeTab } from '../types';

interface TimePeriodSelectorProps {
  timeTab: TimeTab;
  onSelectTab: (tab: TimeTab) => void;
  periodLabel: string;
  onPrev: () => void;
  onNext: () => void;
}

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  timeTab,
  onSelectTab,
  periodLabel,
  onPrev,
  onNext,
}) => {
  const tabs: TimeTab[] = ['Daily', 'Monthly', 'Yearly'];

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        {tabs.map((tab) => {
          const isActive = timeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onSelectTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Date Navigator */}
      <View style={styles.navigatorWrapper}>
        <TouchableOpacity
          onPress={onPrev}
          style={styles.arrowButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={COLORS.grayLight} />
        </TouchableOpacity>

        <Text style={styles.dateLabel}>{periodLabel}</Text>

        <TouchableOpacity
          onPress={onNext}
          style={styles.arrowButton}
          activeOpacity={0.7}
        >
          <ChevronRight size={20} color={COLORS.grayLight} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '700',
  },
  navigatorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});
