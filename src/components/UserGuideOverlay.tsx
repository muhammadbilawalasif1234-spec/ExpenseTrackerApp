import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  Easing,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  TrendingDown,
  TrendingUp,
  Move,
  Wallet,
  BookOpen,
  BarChart3,
  User,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  X,
  Sparkles,
  Plus,
} from "lucide-react-native";

import type { TabRect } from "./BottomNavigation";

export interface UserGuideOverlayProps {
  visible: boolean;
  onClose: () => void;
  isLight?: boolean;
  hasBottomBanner?: boolean;
  bottomNavTop?: number;
  bottomNavLayout?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  tabLayouts?: { [key: string]: TabRect };
  draggableButtonPos?: { x: number; y: number; size: number } | null;
  balanceCardLayout?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  statsCardLayout?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  headerLayout?: { x: number; y: number; width: number; height: number } | null;
  headerContainerHeight?: number;
  headerPaddingTop?: number;
}

export interface GuideStep {
  id:
    | "expense"
    | "income"
    | "draggable"
    | "accounts"
    | "records"
    | "stats"
    | "profile";
  badge: string;
  pillTitle: string;
  title: string;
  description: string;
  actionHint: string;
  arrowText: string;
  accentColor: string;
  accentBg: string;
  IconComponent: any;
  gestureType: "tap" | "drag";
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: "expense",
    badge: "EXPENSE",
    pillTitle: "1. Expense",
    title: "How to Add Expense",
    description:
      "Tap the Expense button on your card to quickly log daily purchases, food, bills, shopping, and fuel with custom categories.",
    actionHint: "Tap Expense button to log spending",
    arrowText: "Expense Button",
    accentColor: "#EF4444",
    accentBg: "rgba(239, 68, 68, 0.15)",
    IconComponent: TrendingDown,
    gestureType: "tap",
  },
  {
    id: "income",
    badge: "INCOME",
    pillTitle: "2. Income",
    title: "How to Add Income",
    description:
      "Tap the Income button anytime to record salary, freelancing earnings, business revenue, or incoming cash deposits.",
    actionHint: "Tap Income button to log earnings",
    arrowText: "Income Button",
    accentColor: "#10B981",
    accentBg: "rgba(16, 185, 129, 0.15)",
    IconComponent: TrendingUp,
    gestureType: "tap",
  },
  {
    id: "draggable",
    badge: "DRAGGABLE (+)",
    pillTitle: "3. Drag (+)",
    title: "Draggable Quick-Add Button",
    description:
      "Hold and drag this floating (+) button anywhere comfortable on your screen! Tap it anytime for instant 1-tap quick add.",
    actionHint: "Hold & drag anywhere, or tap to add",
    arrowText: "Floating (+) Button",
    accentColor: "#0284C7",
    accentBg: "rgba(2, 132, 199, 0.15)",
    IconComponent: Move,
    gestureType: "drag",
  },
  {
    id: "accounts",
    badge: "ACCOUNTS",
    pillTitle: "4. Accounts",
    title: "Total Balance & Accounts",
    description:
      "Tap on the Total Balance card to inspect individual accounts (Cash, Bank, Savings, Cards), switch accounts, or add new wallets.",
    actionHint: "Tap Total Balance to view accounts",
    arrowText: "Balance & Accounts",
    accentColor: "#8B5CF6",
    accentBg: "rgba(139, 92, 246, 0.15)",
    IconComponent: Wallet,
    gestureType: "tap",
  },
  {
    id: "records",
    badge: "RECORDS",
    pillTitle: "5. Records",
    title: "Records & Transactions",
    description:
      "Tap the Records tab in the bottom bar anytime to browse, search, and review all your transaction logs, edit entries, or inspect receipts.",
    actionHint: "Tap Records in bottom navigation",
    arrowText: "Records / Ledger Tab",
    accentColor: "#012E4F",
    accentBg: "rgba(1, 46, 79, 0.15)",
    IconComponent: BookOpen,
    gestureType: "tap",
  },
  {
    id: "stats",
    badge: "ANALYTICS",
    pillTitle: "6. Stats",
    title: "Spending Analytics & Charts",
    description:
      "Tap the Stats tab to view visual category breakdowns, monthly income vs expense bar charts, and cash flow insights.",
    actionHint: "Tap Stats in bottom navigation",
    arrowText: "Analytics / Stats Tab",
    accentColor: "#F59E0B",
    accentBg: "rgba(245, 158, 11, 0.15)",
    IconComponent: BarChart3,
    gestureType: "tap",
  },
  {
    id: "profile",
    badge: "PROFILE",
    pillTitle: "7. Profile",
    title: "Profile, Currency & Theme",
    description:
      "Tap your profile icon at top-left to configure multi-currency, switch Light/Dark mode, or manage app settings and data.",
    actionHint: "Tap profile icon in header",
    arrowText: "Profile & Settings",
    accentColor: "#6366F1",
    accentBg: "rgba(99, 102, 241, 0.15)",
    IconComponent: User,
    gestureType: "tap",
  },
];

export const UserGuideOverlay: React.FC<UserGuideOverlayProps> = ({
  visible,
  onClose,
  isLight = true,
  hasBottomBanner = false,
  bottomNavTop,
  bottomNavLayout,
  tabLayouts,
  draggableButtonPos,
  balanceCardLayout,
  statsCardLayout,
  headerLayout,
  headerContainerHeight,
  headerPaddingTop,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pillsScrollViewRef = useRef<ScrollView>(null);

  // Animation values
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const dragAnim = useRef(new Animated.Value(0)).current;
  const cardFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
    }
  }, [visible]);

  // Scroll active pill into view when step changes
  useEffect(() => {
    if (visible && pillsScrollViewRef.current) {
      pillsScrollViewRef.current.scrollTo({
        x: Math.max(0, currentStep * 84 - 30),
        animated: true,
      });
    }
  }, [currentStep, visible]);

  // Continuous loop animations
  useEffect(() => {
    if (!visible) return;

    // Pulse ripple loop
    const rippleLoop = Animated.loop(
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );

    // Arrow bounce loop
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 450,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 450,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // Draggable gesture glide loop
    const dragLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dragAnim, {
          toValue: -28,
          duration: 900,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(dragAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    );

    rippleLoop.start();
    bounceLoop.start();
    dragLoop.start();

    return () => {
      rippleLoop.stop();
      bounceLoop.stop();
      dragLoop.stop();
    };
  }, [visible]);

  const handleStepChange = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= GUIDE_STEPS.length) return;
    Animated.sequence([
      Animated.timing(cardFadeAnim, {
        toValue: 0.15,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(cardFadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setCurrentStep(newIndex);
  };

  if (!visible) return null;

  const step = GUIDE_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === GUIDE_STEPS.length - 1;

  // Responsive container width (UserGuideOverlay is inside mainContainer with maxWidth: 412)
  const containerWidth = Math.min(SCREEN_WIDTH, 412);
  const offsetX = Math.max(0, (SCREEN_WIDTH - containerWidth) / 2);
  const actualHeaderTop = headerPaddingTop ?? Math.max(insets.top + 14, 48);
  const topOffset = actualHeaderTop;
  const actualHeaderHeight =
    headerContainerHeight && headerContainerHeight > 40
      ? headerContainerHeight
      : 88;
  const homeContentTop = actualHeaderTop + actualHeaderHeight;
  const contentWidth = containerWidth - 32;
  const bottomInset = Math.max(insets.bottom, 0);

  // Bottom Navigation and Ad Banner safe metrics
  const bottomNavHeight = hasBottomBanner ? 60 : 81 + bottomInset;
  const bannerHeight = hasBottomBanner ? 50 : 0;
  const effectiveNavTop =
    bottomNavLayout?.y && bottomNavLayout.y > 100
      ? bottomNavLayout.y
      : bottomNavTop && bottomNavTop > 100
        ? bottomNavTop
        : SCREEN_HEIGHT - bottomNavHeight - bannerHeight;

  // Exact cardY for stats section / IncomeExpenseCard
  // statsCardLayout.y inside ScrollView is 174 (160 balance card + 14 margin)
  const statsRelativeY =
    statsCardLayout?.y ?? (balanceCardLayout?.height ?? 160) + 14;
  const exactIncomeExpenseCardY = homeContentTop + statsRelativeY;
  const incomeExpenseCardX = statsCardLayout?.x ?? 16;
  const incomeExpenseCardWidth = statsCardLayout?.width ?? contentWidth;
  const incomeExpenseCardHeight = statsCardLayout?.height ?? 66;
  const halfCardWidth = incomeExpenseCardWidth / 2;

  let targetRect = {
    x: incomeExpenseCardX,
    y: exactIncomeExpenseCardY,
    width: halfCardWidth,
    height: incomeExpenseCardHeight,
    borderRadius: 10,
  };

  if (step.id === "expense") {
    targetRect = {
      x: incomeExpenseCardX + halfCardWidth,
      y: exactIncomeExpenseCardY,
      width: incomeExpenseCardWidth - halfCardWidth,
      height: incomeExpenseCardHeight,
      borderRadius: 10,
    };
  } else if (step.id === "income") {
    targetRect = {
      x: incomeExpenseCardX,
      y: exactIncomeExpenseCardY,
      width: halfCardWidth,
      height: incomeExpenseCardHeight,
      borderRadius: 10,
    };
  } else if (step.id === "draggable") {
    // 3. Draggable (+) Floating Button
    const btnSize = draggableButtonPos?.size ?? 60;
    const minX = offsetX + 16;
    const maxX = Math.max(minX, offsetX + containerWidth - btnSize - 16);
    const minY = homeContentTop + 160 + 80;
    const rawMaxY = effectiveNavTop - btnSize - 8;
    const maxY = Math.max(minY, rawMaxY);
    const defaultX = maxX;
    const defaultY = Math.max(minY, Math.min(maxY, maxY - 16));

    if (
      draggableButtonPos &&
      draggableButtonPos.x >= 0 &&
      draggableButtonPos.y >= 0
    ) {
      targetRect = {
        x: Math.min(Math.max(draggableButtonPos.x, minX), maxX),
        y: Math.min(Math.max(draggableButtonPos.y, minY), maxY),
        width: draggableButtonPos.size,
        height: draggableButtonPos.size,
        borderRadius: draggableButtonPos.size / 2,
      };
    } else {
      targetRect = {
        x: defaultX,
        y: defaultY,
        width: btnSize,
        height: btnSize,
        borderRadius: btnSize / 2,
      };
    }
  } else if (step.id === "accounts") {
    targetRect = {
      x: balanceCardLayout?.x ?? 16,
      y: homeContentTop + (balanceCardLayout?.y ?? 0),
      width: balanceCardLayout?.width ?? contentWidth,
      height: balanceCardLayout?.height ?? 160,
      borderRadius: 20,
    };
  } else if (step.id === "records") {
    // 5. Bottom navigation tab 1 (Ledger / Records)
    const navWidth = bottomNavLayout?.width ?? containerWidth;
    const tabWidth = (navWidth - 28 - 8) / 5;
    const fallbackX = offsetX + 14 + 1 * (tabWidth + 2);

    targetRect = {
      x:
        tabLayouts?.records?.x !== undefined
          ? offsetX + tabLayouts.records.x
          : fallbackX,
      y: effectiveNavTop + 6,
      width: tabLayouts?.records?.width ?? tabWidth,
      height: tabLayouts?.records?.height ?? 50,
      borderRadius: 14,
    };
  } else if (step.id === "stats") {
    // 6. Bottom navigation tab 3 (Stats)
    const navWidth = bottomNavLayout?.width ?? containerWidth;
    const tabWidth = (navWidth - 28 - 8) / 5;
    const fallbackX = offsetX + 14 + 3 * (tabWidth + 2);

    targetRect = {
      x:
        tabLayouts?.stats?.x !== undefined
          ? offsetX + tabLayouts.stats.x
          : fallbackX,
      y: effectiveNavTop + 6,
      width: tabLayouts?.stats?.width ?? tabWidth,
      height: tabLayouts?.stats?.height ?? 50,
      borderRadius: 14,
    };
  } else if (step.id === "profile") {
    // 7. User profile avatar in header
    targetRect = {
      x: offsetX + 16,
      y: actualHeaderTop,
      width: 50,
      height: 50,
      borderRadius: 25,
    };
  }

  // Safe placement:
  // If target is in lower half of screen, card is safely docked at TOP.
  // If target is in upper half of screen, card is safely docked at BOTTOM.
  const isTargetInLowerHalf = targetRect.y > SCREEN_HEIGHT * 0.44;

  const cardPositionStyle = isTargetInLowerHalf
    ? {
        top: Math.max(topOffset + 8, 24),
      }
    : {
        bottom: Math.max(bottomInset + (hasBottomBanner ? 64 : 16), 20),
      };

  const cardWidth = Math.min(SCREEN_WIDTH - 24, containerWidth - 24);
  const cardLeft = Math.max(12, (containerWidth - cardWidth) / 2);

  // Exact target center coordinates
  const targetCenterX = targetRect.x + targetRect.width / 2;

  // 1. Direct pointing arrow needle centered on targetCenterX
  const needleSize = 28;
  const needleLeft = Math.max(
    8,
    Math.min(containerWidth - needleSize - 8, targetCenterX - needleSize / 2),
  );
  const needleTop = isTargetInLowerHalf
    ? targetRect.y - 32
    : targetRect.y + targetRect.height + 4;

  // 2. Prominent target badge callout centered on targetCenterX
  const badgeWidth = Math.min(180, containerWidth - 32);
  const badgeLeft = Math.max(
    12,
    Math.min(containerWidth - badgeWidth - 12, targetCenterX - badgeWidth / 2),
  );
  const badgeTop = isTargetInLowerHalf
    ? Math.max(topOffset + 95, targetRect.y - 68)
    : targetRect.y + targetRect.height + 36;

  // 3. Draggable gesture banner placement
  const isDraggableOnRight = targetCenterX > containerWidth / 2;
  const dragBannerLeft = isDraggableOnRight
    ? Math.max(12, targetRect.x - 148)
    : Math.min(containerWidth - 156, targetRect.x + targetRect.width + 10);
  const dragBannerTop = Math.max(
    topOffset + 80,
    targetRect.y + (targetRect.height - 36) / 2,
  );

  // Ripple interpolation
  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.45],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.75, 0.35, 0],
  });

  // Theme colors
  const bgCard = isLight ? "#FFFFFF" : "#161B22";
  const textPrimary = isLight ? "#0F172A" : "#F8FAFC";
  const textSecondary = isLight ? "#64748B" : "#94A3B8";
  const cardBorder = isLight ? "#E2E8F0" : "#30363D";
  const pillInactiveBg = isLight ? "#F1F5F9" : "#21262D";
  const pillInactiveText = isLight ? "#475569" : "#94A3B8";

  const { IconComponent } = step;
  const hasSpotlight =
    step.id !== "draggable" && step.id !== "records" && step.id !== "stats";

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {hasSpotlight ? (
        <>
          {/* 4 Dimmed Backdrop Panels around target */}
          {/* Top Panel */}
          <Pressable
            style={[
              styles.backdropPanel,
              { top: 0, left: 0, right: 0, height: Math.max(0, targetRect.y) },
            ]}
            onPress={() =>
              !isLast ? handleStepChange(currentStep + 1) : onClose()
            }
          />
          {/* Bottom Panel */}
          <Pressable
            style={[
              styles.backdropPanel,
              {
                top: targetRect.y + targetRect.height,
                left: 0,
                right: 0,
                bottom: 0,
              },
            ]}
            onPress={() =>
              !isLast ? handleStepChange(currentStep + 1) : onClose()
            }
          />
          {/* Left Panel */}
          <Pressable
            style={[
              styles.backdropPanel,
              {
                top: targetRect.y,
                left: 0,
                width: Math.max(0, targetRect.x),
                height: targetRect.height,
              },
            ]}
            onPress={() =>
              !isLast ? handleStepChange(currentStep + 1) : onClose()
            }
          />
          {/* Right Panel */}
          <Pressable
            style={[
              styles.backdropPanel,
              {
                top: targetRect.y,
                left: targetRect.x + targetRect.width,
                right: 0,
                height: targetRect.height,
              },
            ]}
            onPress={() =>
              !isLast ? handleStepChange(currentStep + 1) : onClose()
            }
          />

          {/* Spotlight Illuminated Frame with Sonar Ripple */}
          <Pressable
            style={[
              styles.spotlightFrame,
              {
                top: targetRect.y,
                left: targetRect.x,
                width: targetRect.width,
                height: targetRect.height,
                borderRadius: targetRect.borderRadius,
                borderColor: step.accentColor,
              },
            ]}
            onPress={() => {
              if (isLast) {
                onClose();
              } else {
                handleStepChange(currentStep + 1);
              }
            }}
          >
            <Animated.View
              style={[
                styles.spotlightRipple,
                {
                  borderRadius: targetRect.borderRadius + 6,
                  borderColor: step.accentColor,
                  transform: [{ scale: rippleScale }],
                  opacity: rippleOpacity,
                },
              ]}
            />
          </Pressable>
        </>
      ) : (
        /* Full-screen backdrop without selection box or circle */
        <Pressable
          style={[
            styles.backdropPanel,
            { top: 0, left: 0, right: 0, bottom: 0 },
          ]}
          onPress={() =>
            !isLast ? handleStepChange(currentStep + 1) : onClose()
          }
        />
      )}

      {/* Direct Item Highlights for steps that do NOT use rigid rectangular selection cutouts */}
      {/* 1. Highlighted Draggable (+) Button */}
      {step.id === "draggable" && (
        <Pressable
          style={[
            styles.highlightedDraggableButton,
            {
              left: targetRect.x,
              top: targetRect.y,
              width: targetRect.width,
              height: targetRect.height,
              borderRadius: targetRect.borderRadius,
            },
          ]}
          onPress={() =>
            !isLast ? handleStepChange(currentStep + 1) : onClose()
          }
        >
          {/* Animated sonar ripple */}
          <Animated.View
            style={[
              styles.highlightedItemRipple,
              {
                borderRadius: targetRect.borderRadius + 8,
                borderColor: "#38BDF8",
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              },
            ]}
          />
          {/* Real styled floating button replica */}
          <View style={styles.draggableFloatingBtnBody}>
            <Plus size={30} color="#FFFFFF" strokeWidth={3} />
          </View>
        </Pressable>
      )}

      {/* 2. Highlighted Bottom Nav Ledger / Records Icon */}
      {step.id === "records" && (
        <Pressable
          style={[
            styles.highlightedNavIconPill,
            {
              left: Math.max(8, targetCenterX - 36),
              top: targetRect.y - 2,
              width: 72,
              height: 52,
            },
          ]}
          onPress={() =>
            !isLast ? handleStepChange(currentStep + 1) : onClose()
          }
        >
          {/* Pulsing glow ripple */}
          <Animated.View
            style={[
              styles.highlightedItemRipple,
              {
                borderRadius: 16,
                borderColor: "#38BDF8",
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              },
            ]}
          />
          <View
            style={[
              styles.highlightedNavIconInner,
              { backgroundColor: isLight ? "#FFFFFF" : "#1E293B" },
            ]}
          >
            <BookOpen size={20} color="#0284C7" strokeWidth={2.4} />
            <Text
              style={[
                styles.highlightedNavIconLabel,
                { color: isLight ? "#012E4F" : "#38BDF8" },
              ]}
            >
              Ledger
            </Text>
          </View>
        </Pressable>
      )}

      {/* 3. Highlighted Bottom Nav Stats / Analytics Icon */}
      {step.id === "stats" && (
        <Pressable
          style={[
            styles.highlightedNavIconPill,
            {
              left: Math.max(8, targetCenterX - 36),
              top: targetRect.y - 2,
              width: 72,
              height: 52,
            },
          ]}
          onPress={() =>
            !isLast ? handleStepChange(currentStep + 1) : onClose()
          }
        >
          {/* Pulsing glow ripple */}
          <Animated.View
            style={[
              styles.highlightedItemRipple,
              {
                borderRadius: 16,
                borderColor: "#F59E0B",
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              },
            ]}
          />
          <View
            style={[
              styles.highlightedNavIconInner,
              { backgroundColor: isLight ? "#FFFFFF" : "#1E293B" },
            ]}
          >
            <BarChart3 size={20} color="#F59E0B" strokeWidth={2.4} />
            <Text
              style={[
                styles.highlightedNavIconLabel,
                { color: isLight ? "#D97706" : "#FBBF24" },
              ]}
            >
              Stats
            </Text>
          </View>
        </Pressable>
      )}

      {/* 1. Pointing Directional Arrow Needle centered directly at targetCenterX */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pointingArrowNeedleWrap,
          {
            left: needleLeft,
            top: needleTop,
            transform: [{ translateY: bounceAnim }],
          },
        ]}
      >
        <View style={styles.pointingArrowNeedle}>
          {isTargetInLowerHalf ? (
            <ArrowDown size={28} color={step.accentColor} strokeWidth={3} />
          ) : (
            <ArrowUp size={28} color={step.accentColor} strokeWidth={3} />
          )}
        </View>
      </Animated.View>

      {/* 2. Target Name Badge positioned above/below the arrow needle */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.targetBadgeWrap,
          {
            left: badgeLeft,
            top: badgeTop,
            width: badgeWidth,
            transform: [{ translateY: bounceAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.targetBadgePill,
            { backgroundColor: step.accentColor },
          ]}
        >
          <IconComponent size={13} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.targetBadgeText} numberOfLines={1}>
            {step.arrowText}
          </Text>
        </View>
      </Animated.View>

      {/* 3. Drag Gesture Banner for Draggable (+) Step */}
      {step.id === "draggable" && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.dragMotionBanner,
            {
              left: dragBannerLeft,
              top: dragBannerTop,
              transform: [{ translateX: dragAnim }],
            },
          ]}
        >
          <View style={[styles.dragMotionPill, { backgroundColor: "#0284C7" }]}>
            <Move size={14} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.dragMotionText}>Drag anywhere!</Text>
          </View>
        </Animated.View>
      )}

      {/* Adaptive Screen-Safe Guide Card */}
      <Animated.View
        style={[
          styles.coachmarkCard,
          cardPositionStyle,
          {
            left: cardLeft,
            width: cardWidth,
            backgroundColor: bgCard,
            borderColor: cardBorder,
            opacity: cardFadeAnim,
          },
        ]}
      >
        {/* Header: Title & Close Button */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View
              style={[
                styles.badgeContainer,
                { backgroundColor: step.accentBg },
              ]}
            >
              <IconComponent
                size={13}
                color={step.accentColor}
                strokeWidth={2.5}
              />
              <Text style={[styles.badgeText, { color: step.accentColor }]}>
                {step.badge}
              </Text>
            </View>
            <View style={styles.stepCounterBox}>
              <Text style={[styles.stepCounterText, { color: textSecondary }]}>
                {currentStep + 1} of {GUIDE_STEPS.length}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={[styles.closeIconBtn, { backgroundColor: pillInactiveBg }]}
          >
            <X size={15} color={textSecondary} strokeWidth={2.4} />
          </Pressable>
        </View>

        {/* Horizontal Steps Navigator Pills */}
        <View style={styles.pillsContainer}>
          <ScrollView
            ref={pillsScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsScrollContent}
          >
            {GUIDE_STEPS.map((s, index) => {
              const isActive = index === currentStep;
              return (
                <Pressable
                  key={s.id}
                  style={[
                    styles.stepPill,
                    {
                      backgroundColor: isActive
                        ? s.accentColor
                        : pillInactiveBg,
                    },
                  ]}
                  onPress={() => handleStepChange(index)}
                >
                  <Text
                    style={[
                      styles.stepPillText,
                      {
                        color: isActive ? "#FFFFFF" : pillInactiveText,
                        fontWeight: isActive ? "700" : "500",
                      },
                    ]}
                  >
                    {s.pillTitle}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Content Body */}
        <View style={styles.bodyContent}>
          <Text style={[styles.stepTitle, { color: textPrimary }]}>
            {step.title}
          </Text>
          <Text style={[styles.stepDescription, { color: textSecondary }]}>
            {step.description}
          </Text>

          {/* Interactive Action Hint Banner */}
          <View
            style={[
              styles.actionHintBanner,
              { backgroundColor: step.accentBg },
            ]}
          >
            <Sparkles size={14} color={step.accentColor} />
            <Text style={[styles.actionHintText, { color: step.accentColor }]}>
              {step.actionHint}
            </Text>
          </View>
        </View>

        {/* Footer Navigation Bar */}
        <View style={styles.cardFooter}>
          {/* Back Button */}
          <Pressable
            style={[
              styles.navButton,
              styles.navButtonBack,
              {
                borderColor: cardBorder,
                backgroundColor: pillInactiveBg,
                opacity: isFirst ? 0.35 : 1,
              },
            ]}
            onPress={() => handleStepChange(currentStep - 1)}
            disabled={isFirst}
          >
            <ArrowLeft size={15} color={textPrimary} />
            <Text style={[styles.navButtonText, { color: textPrimary }]}>
              Back
            </Text>
          </Pressable>

          {/* Step Dots Indicator */}
          <View style={styles.stepDotsRow}>
            {GUIDE_STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      i === currentStep ? step.accentColor : cardBorder,
                    width: i === currentStep ? 16 : 6,
                  },
                ]}
              />
            ))}
          </View>

          {/* Next / Finish Button */}
          <Pressable
            style={[
              styles.navButton,
              styles.navButtonNext,
              { backgroundColor: step.accentColor },
            ]}
            onPress={() => {
              if (isLast) {
                onClose();
              } else {
                handleStepChange(currentStep + 1);
              }
            }}
          >
            <Text style={styles.navButtonNextText}>
              {isLast ? "Got It!" : "Next"}
            </Text>
            {!isLast ? (
              <ArrowRight size={15} color="#FFFFFF" />
            ) : (
              <CheckCircle size={15} color="#FFFFFF" />
            )}
          </Pressable>
        </View>

        {/* Skip Tour text */}
        <Pressable onPress={onClose} style={styles.skipContainer} hitSlop={10}>
          <Text style={[styles.skipTourText, { color: textSecondary }]}>
            Skip Guide
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
  },
  backdropPanel: {
    position: "absolute",
    backgroundColor: "rgba(5, 10, 20, 0.72)",
  },
  spotlightFrame: {
    position: "absolute",
    borderWidth: 2.5,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  spotlightRipple: {
    position: "absolute",
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderWidth: 2,
  },
  pointingArrowNeedleWrap: {
    position: "absolute",
    width: 28,
    height: 28,
    zIndex: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  pointingArrowNeedle: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
    elevation: 8,
  },
  targetBadgeWrap: {
    position: "absolute",
    zIndex: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  targetBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 7,
  },
  targetBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  dragMotionBanner: {
    position: "absolute",
    zIndex: 13,
  },
  dragMotionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  dragMotionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  coachmarkCard: {
    position: "absolute",
    zIndex: 20,
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  stepCounterBox: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stepCounterText: {
    fontSize: 11,
    fontWeight: "600",
  },
  closeIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pillsContainer: {
    marginBottom: 12,
  },
  pillsScrollContent: {
    gap: 6,
    paddingVertical: 2,
  },
  stepPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  stepPillText: {
    fontSize: 11,
  },
  bodyContent: {
    marginBottom: 14,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  actionHintBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  actionHintText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(148, 163, 184, 0.25)",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  navButtonBack: {
    borderWidth: 1,
  },
  navButtonNext: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  navButtonNextText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepDotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stepDot: {
    height: 6,
    borderRadius: 3,
  },
  skipContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  skipTourText: {
    fontSize: 11,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  highlightedDraggableButton: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 15,
  },
  draggableFloatingBtnBody: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    backgroundColor: "#0284C7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#38BDF8",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  highlightedNavIconPill: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 15,
  },
  highlightedNavIconInner: {
    width: 68,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#38BDF8",
    gap: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  highlightedNavIconLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  highlightedItemRipple: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderWidth: 2.5,
  },
});

export default UserGuideOverlay;
