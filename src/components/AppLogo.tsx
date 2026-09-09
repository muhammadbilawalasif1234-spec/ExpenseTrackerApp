import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowUpRight, Sparkles, TrendingUp, Wallet } from 'lucide-react-native';

interface AppLogoProps {
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 40 }) => {
  const scale = size / 40;
  const borderRadius = Math.round(12 * scale);
  const iconSize = Math.max(14, Math.round(18 * scale));
  const arrowSize = Math.max(10, Math.round(12 * scale));

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: borderRadius,
        },
      ]}
    >
      {/* Glow backdrop */}
      <View style={styles.glow} />

      {/* Main Gold Background */}
      <View
        style={[
          styles.innerBox,
          {
            width: size,
            height: size,
            borderRadius: borderRadius,
          },
        ]}
      >
        {/* Wallet Container */}
        <View
          style={[
            styles.walletContainer,
            {
              width: size * 0.62,
              height: size * 0.52,
              borderRadius: Math.max(4, Math.round(6 * scale)),
            },
          ]}
        >
          {/* Wallet clasp */}
          <View
            style={[
              styles.clasp,
              {
                width: Math.max(6, Math.round(8 * scale)),
                height: Math.max(6, Math.round(8 * scale)),
                borderRadius: Math.max(3, Math.round(4 * scale)),
                right: -Math.max(2, Math.round(3 * scale)),
              },
            ]}
          >
            <View style={styles.claspDot} />
          </View>
        </View>

        {/* Upward Growth Arrow rising from bottom-left to top-right */}
        <View
          style={[
            styles.arrowBadge,
            {
              top: Math.round(3 * scale),
              right: Math.round(3 * scale),
            },
          ]}
        >
          <TrendingUp size={arrowSize} color="#FFFFFF" strokeWidth={3} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.35)',
    transform: [{ scale: 1.15 }],
  },
  innerBox: {
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  walletContainer: {
    backgroundColor: '#FFFFFF',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
    justifyContent: 'center',
  },
  clasp: {
    position: 'absolute',
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  claspDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
  },
  arrowBadge: {
    position: 'absolute',
    zIndex: 10,
  },
});
