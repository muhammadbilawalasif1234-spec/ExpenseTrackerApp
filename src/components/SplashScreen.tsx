import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface SplashScreenProps {
  visible: boolean;
  onComplete: () => void;
  appName?: string;
  bio?: string;
}

const LOADING_STEPS = [
  { progress: 20, label: 'Initializing financial engine...' },
  { progress: 48, label: 'Loading multi-wallet balances...' },
  { progress: 75, label: 'Calculating smart spending insights...' },
  { progress: 92, label: 'Securing offline encrypted vault...' },
  { progress: 100, label: 'Expense Tracker ready!' },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({
  visible,
  onComplete,
  appName = 'Expense Tracker',
  bio = 'Smart Wealth & Expense Management â€¢ Take complete control of your financial journey with real-time analytics, multi-wallet sync, and budget goals.',
}) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Starting Expense Tracker...');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setProgress(15);
    setStatusText('Starting Expense Tracker...');
    setIsReady(false);

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < LOADING_STEPS.length) {
        const step = LOADING_STEPS[stepIndex];
        setProgress(step.progress);
        setStatusText(step.label);
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsReady(true);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={styles.container}>
        {/* Decorative Ambient Background Glows */}
        <View style={styles.ambientGlowTop} />
        <View style={styles.ambientGlowBottom} />

        <View style={styles.content}>
          {/* App Logo with Golden Border & Shadow */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoCard}>
              <Image
                source={require('../assets/i.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Badge & Title */}
          <View style={styles.headerSection}>
            <View style={styles.badgeRow}>
              <Sparkles size={12} color="#F59E0B" />
              <Text style={styles.badgeText}>PREMIUM EDITION</Text>
            </View>

            <Text style={styles.titleText}>{appName}</Text>

            <Text style={styles.bioText} numberOfLines={3}>
              {bio}
            </Text>
          </View>

          {/* Highlights Row */}
          <View style={styles.featuresRow}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(0, 200, 83, 0.15)' }]}>
                <TrendingUp size={15} color={COLORS.primary} />
              </View>
              <View style={styles.featureTextCol}>
                <Text style={styles.featureTitle} numberOfLines={1}>
                  Analytics
                </Text>
                <Text style={styles.featureSubtitle} numberOfLines={1}>
                  Smart Insights
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Wallet size={15} color="#F59E0B" />
              </View>
              <View style={styles.featureTextCol}>
                <Text style={styles.featureTitle} numberOfLines={1}>
                  Multi-Wallet
                </Text>
                <Text style={styles.featureSubtitle} numberOfLines={1}>
                  Cash & Bank
                </Text>
              </View>
            </View>
          </View>

          {/* Loading Board Card */}
          <View style={styles.loadingBoard}>
            <View style={styles.loadingHeader}>
              <View style={styles.loadingLabelGroup}>
                <Zap size={14} color="#F59E0B" />
                <Text style={styles.loadingStatusText} numberOfLines={1}>
                  {statusText}
                </Text>
              </View>
              <Text style={styles.progressPercent}>{progress}%</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>

            <View style={styles.vaultFooter}>
              <View style={styles.vaultLeft}>
                <ShieldCheck size={12} color={COLORS.primary} />
                <Text style={styles.vaultText}>100% Private Offline Vault</Text>
              </View>
              <Text style={styles.versionText}>v2.5.0</Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.actionBtn, isReady ? styles.actionBtnReady : styles.actionBtnLoading]}
            onPress={onComplete}
            activeOpacity={0.85}
          >
            <Text style={[styles.actionBtnText, isReady && styles.actionBtnTextReady]}>
              {isReady ? 'Open Dashboard' : 'Skip & Continue'}
            </Text>
            <ArrowRight size={16} color={isReady ? '#000000' : '#E2E8F0'} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  ambientGlowTop: {
    position: 'absolute',
    top: 60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: 40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
  },
  content: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: 18,
  },
  logoWrapper: {
    padding: 6,
    borderRadius: 28,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  logoCard: {
    width: 90,
    height: 90,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#1E2430',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  headerSection: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  bioText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  featureCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#161B22',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextCol: {
    flex: 1,
    minWidth: 0,
  },
  featureTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featureSubtitle: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1,
  },
  loadingBoard: {
    width: '100%',
    backgroundColor: '#161B22',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#30363D',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  loadingStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1',
    flexShrink: 1,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: '#0D1117',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(48, 54, 61, 0.6)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  vaultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  vaultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vaultText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 10,
    color: '#64748B',
  },
  actionBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 16,
    marginTop: 4,
  },
  actionBtnReady: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  actionBtnLoading: {
    backgroundColor: '#21262D',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  actionBtnTextReady: {
    color: '#000000',
    fontWeight: '800',
  },
});
