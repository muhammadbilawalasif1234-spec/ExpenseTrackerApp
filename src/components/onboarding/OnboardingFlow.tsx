import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
  TestIds,
} from "react-native-google-mobile-ads";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path, Rect } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const REF_WIDTH = 413.44207763671875;

interface OnboardingFlowProps {
  visible: boolean;
  onFinish: () => void;
}

const PAGE_CONTENTS = [
  {
    title: "Track your expenses",
    subtitle: "Easily record and track your\nexpenses in one place",
  },
  {
    title: "Understand your spending",
    subtitle: "See where your money goes\nwith simple analysis",
  },
  {
    title: "Take Control of Your Money",
    subtitle:
      "Manage your daily expenses, track budgets,\nand achieve your financial goals effortlessly.",
  },
];

const TRANSACTIONS = [
  {
    title: "Dribbble",
    cat: "Subcription fee",
    amt: "-$15.00",
    bg: "#FEF3C7",
    stroke: "#D97706",
  },
  {
    title: "House",
    cat: "Saving",
    amt: "-$50.00",
    bg: "#E0E7FF",
    stroke: "#4F46E5",
  },
  {
    title: "Sony Camera",
    cat: "Shopping fee",
    amt: "-$200.00",
    bg: "#FCE7F3",
    stroke: "#DB2777",
  },
  {
    title: "Paypal",
    cat: "Salary",
    amt: "-$32.00",
    bg: "#DCFCE7",
    stroke: "#16A34A",
  },
  {
    title: "Car",
    cat: "Saving",
    amt: "-$40.00",
    bg: "#E0E7FF",
    stroke: "#4F46E5",
  },
];

// --- LARGE NATIVE AD CARD COMPONENT ---
const NativeAdCard: React.FC = memo(() => {
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);

  useEffect(() => {
    let ad: NativeAd | null = null;
    const load = async () => {
      try {
        ad = await NativeAd.createForAdRequest(TestIds.NATIVE, {
          requestNonPersonalizedAdsOnly: true,
        });
        if (ad) {
          setNativeAd(ad);
        }
      } catch (e: any) {
        console.log("Native Ad error", e?.message || e);
      }
    };
    load();
    return () => {
      try {
        ad?.destroy?.();
      } catch {}
    };
  }, []);

  if (!nativeAd) {
    return (
      <View
        style={[
          styles.adCard,
          { height: 280, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: "#94A3B8", fontSize: 13 }}>
          Loading Large Native Ad...
        </Text>
      </View>
    );
  }

  return (
    <NativeAdView nativeAd={nativeAd} style={styles.nativeAdViewContainer}>
      <View style={styles.nativeInnerContainer}>
        {/* HEADER: Icon, Headline & Advertiser */}
        <View style={styles.nativeHeaderRow}>
          {nativeAd.icon?.url ? (
            <Image
              source={{ uri: nativeAd.icon.url }}
              style={styles.nativeIcon}
            />
          ) : (
            <View style={[styles.nativeIcon, styles.iconFallback]}>
              <Text style={styles.iconFallbackText}>Ad</Text>
            </View>
          )}

          <View style={{ flex: 1, marginLeft: 10, justifyContent: "center" }}>
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text numberOfLines={1} style={styles.nativeHeadline}>
                {nativeAd.headline || "Sponsored App"}
              </Text>
            </NativeAsset>
            <NativeAsset assetType={NativeAssetType.ADVERTISER}>
              <Text numberOfLines={1} style={styles.nativeAdvertiser}>
                {nativeAd.advertiser || "Verified Advertiser"}
              </Text>
            </NativeAsset>
          </View>

          <View style={styles.adBadge}>
            <Text style={styles.adBadgeText}>Ad</Text>
          </View>
        </View>

        {/* BODY TEXT */}
        <NativeAsset assetType={NativeAssetType.BODY}>
          <Text numberOfLines={2} style={styles.nativeBody}>
            {nativeAd.body ||
              "Discover amazing features and take control of your daily routine effortlessly with our advanced tools."}
          </Text>
        </NativeAsset>

        {/* LARGE MEDIA VIEW */}
        <NativeMediaView style={styles.nativeMediaView} />

        {/* FOOTER: Call to Action */}
        <View style={styles.nativeFooterRow}>
          <NativeAsset assetType={NativeAssetType.STORE}>
            <Text numberOfLines={1} style={styles.storeText}>
              {nativeAd.store || "Google Play"}
            </Text>
          </NativeAsset>

          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <View style={styles.nativeCtaButton}>
              <Text style={styles.nativeCtaText}>
                {nativeAd.callToAction || "Install Now"}
              </Text>
            </View>
          </NativeAsset>
        </View>
      </View>
    </NativeAdView>
  );
});
NativeAdCard.displayName = "NativeAdCard";

// --- MAIN ONBOARDING SCREEN RENDERER WITH TOP IMAGE BACKGROUNDS ---
const OnboardingPageContent: React.FC<{
  currentIndex: number;
  onNext?: () => void;
  onSkip?: () => void;
}> = ({ currentIndex, onNext, onSkip }) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    setCanSkip(false);
    const timer = setTimeout(() => setCanSkip(true), 2000);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const scale = SCREEN_WIDTH / REF_WIDTH;
  const centerBaseX = SCREEN_WIDTH / 2;
  const pageData = PAGE_CONTENTS[currentIndex] || PAGE_CONTENTS[0];
  const showSkipButton = currentIndex < 2 && canSkip;

  return (
    <Pressable style={styles.rootContainer} onPress={onNext}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.canvasContainer}>
        {/* Top Header Background Image for Screen 1 */}
        {currentIndex === 0 && (
          <View
            style={[
              styles.absoluteLayer,
              { top: 0, left: 0, right: 0, height: 200 * scale },
            ]}
            pointerEvents="none"
          >
            <Image
              source={require("../../assets/Group 1.png")}
              style={styles.fullImage}
              resizeMode="stretch"
            />
          </View>
        )}

        {/* Top Header Background Image for Screen 2 (Height reduced to 140 * scale) */}
        {currentIndex === 1 && (
          <View
            style={[
              styles.absoluteLayer,
              { top: 0, left: 0, right: 0, height: 140 * scale },
            ]}
            pointerEvents="none"
          >
            <Image
              source={require("../../assets/Shape2.png")}
              style={styles.fullImage}
              resizeMode="stretch"
            />
          </View>
        )}

        {/* Top Header Background Image for Screen 3 */}
        {currentIndex === 2 && (
          <View
            style={[
              styles.absoluteLayer,
              { top: 0, left: 0, right: 0, height: 185 * scale },
            ]}
            pointerEvents="none"
          >
            <Image
              source={require("../../assets/Shape 3.png")}
              style={styles.fullImage}
              resizeMode="stretch"
            />
          </View>
        )}

        {/* Skip Button */}
        {showSkipButton && (
          <TouchableOpacity
            style={[
              styles.skipButtonContainer,
              { top: Math.max(insets.top + 6, 18) },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onSkip?.();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Header Branding */}
        {currentIndex !== 1 && (
          <View
            style={[
              styles.absoluteLayer,
              currentIndex === 2
                ? {
                    top: 35 * scale,
                    right: 21 * scale,
                    width: 235 * scale,
                    height: 95 * scale,
                    alignItems: "flex-end",
                    gap: 2 * scale,
                  }
                : {
                    top: 45 * scale,
                    left: 21 * scale,
                    width: 235 * scale,
                    height: 95 * scale,
                    gap: 2 * scale,
                  },
            ]}
            pointerEvents="none"
          >
            <View
              style={[
                currentIndex === 2
                  ? styles.walletIconBoxRight
                  : styles.walletIconBox,
                { width: 30 * scale, height: 26 * scale },
              ]}
            >
              <Svg
                width={30 * scale}
                height={26 * scale}
                viewBox="0 0 32 28"
                fill="none"
              >
                <Rect
                  x="1.5"
                  y="1.5"
                  width="29"
                  height="25"
                  rx="6"
                  stroke="#FFFFFF"
                  strokeWidth="2.4"
                  fill="none"
                />
                <Path
                  d="M 1.5 10.5 C 9 11.5, 19 11.5, 30.5 12"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  fill="none"
                />
                <Circle
                  cx="24"
                  cy="18.5"
                  r="2.6"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  fill="none"
                />
              </Svg>
            </View>
            <View
              style={[
                styles.titleWrapper,
                currentIndex === 2 && { alignItems: "flex-end", width: "100%" },
              ]}
            >
              <Text
                style={[
                  styles.moneyManagerTitle,
                  { fontSize: 21 * scale, lineHeight: 25 * scale },
                  currentIndex === 2 && { textAlign: "right" },
                ]}
              >
                Money Manager
              </Text>
              <View
                style={[
                  styles.titleUnderline,
                  {
                    width: 155 * scale,
                    height: 1.5 * scale,
                    marginTop: 2 * scale,
                    backgroundColor: "#FFFFFF",
                  },
                  currentIndex === 2 && { alignSelf: "flex-end" },
                ]}
              />
            </View>
            <Text
              style={[
                styles.moneyManagerSubtitle,
                {
                  fontSize: 11.5 * scale,
                  lineHeight: 15 * scale,
                  marginTop: 1 * scale,
                },
                currentIndex === 2 && { textAlign: "right" },
              ]}
            >
              Professional App for your{"\n"}money management
            </Text>
          </View>
        )}

        {/* Screen 1 Graphics */}
        {currentIndex === 0 && (
          <>
            <View
              style={[
                styles.absoluteLayer,
                {
                  top: 200 * scale,
                  left: centerBaseX - (120 * scale) / 2 - 10 * scale,
                  width: 120 * scale,
                  height: 110 * scale,
                },
              ]}
              pointerEvents="none"
            >
              <Image
                source={require("../../assets/Purchase online.png")}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </View>
            <View
              style={[
                styles.absoluteLayer,
                {
                  top: 240 * scale,
                  left: centerBaseX - (120 * scale) / 2 + 30 * scale,
                  width: 105 * scale,
                  height: 105 * scale,
                },
              ]}
              pointerEvents="none"
            >
              <Image
                source={require("../../assets/Basicman.png")}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </View>
          </>
        )}

        {/* Screen 2 Transactions Card (Shifted further down to top: 125 * scale) */}
        {currentIndex === 1 && (
          <View
            style={[
              styles.absoluteLayer,
              {
                top: 125 * scale,
                left: 24 * scale,
                width: 370 * scale,
                height: 235 * scale,
                borderRadius: 12 * scale,
                backgroundColor: "#EDEDED",
                padding: 6 * scale,
                justifyContent: "space-between",
              },
            ]}
            pointerEvents="none"
          >
            <View style={styles.screen2HeaderRow}>
              <Text style={[styles.screen2CardTitle, { fontSize: 12 * scale }]}>
                Transactions
              </Text>
              <Svg
                width={11 * scale}
                height={11 * scale}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1E293B"
                strokeWidth={2}
              >
                <Path d="M 4 21 V 14 M 4 10 V 3 M 12 21 V 12 M 12 8 V 3 M 20 21 V 16 M 20 12 V 3 M 1 14 H 7 M 9 8 H 15 M 17 16 H 23" />
              </Svg>
            </View>

            <View
              style={{
                flex: 1,
                justifyContent: "space-between",
                marginTop: 2 * scale,
              }}
            >
              {TRANSACTIONS.map((item, idx) => (
                <View
                  key={`tx-${idx}`}
                  style={[
                    styles.screen2RowItem,
                    {
                      borderRadius: 5 * scale,
                      height: 25 * scale,
                      paddingHorizontal: 6 * scale,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.screen2IconCircle,
                      {
                        width: 17 * scale,
                        height: 17 * scale,
                        borderRadius: 8.5 * scale,
                        backgroundColor: item.bg,
                      },
                    ]}
                  >
                    <Svg
                      width={8 * scale}
                      height={8 * scale}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={item.stroke}
                      strokeWidth={2}
                    >
                      <Rect x="3" y="4" width="18" height="12" rx="2" />
                    </Svg>
                  </View>
                  <View style={styles.screen2ItemInfo}>
                    <Text
                      style={[
                        styles.screen2ItemTitle,
                        { fontSize: 10 * scale },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.screen2ItemCategory,
                        { fontSize: 8 * scale },
                      ]}
                    >
                      {item.cat}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.screen2ItemExpense,
                      { fontSize: 10 * scale },
                    ]}
                  >
                    {item.amt}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Screen 3 Graphics */}
        {currentIndex === 2 && (
          <>
            <View
              style={[
                styles.absoluteLayer,
                {
                  top: 195 * scale,
                  left: 112 * scale,
                  width: 185 * scale,
                  height: 140 * scale,
                },
              ]}
              pointerEvents="none"
            >
              <Image
                source={require("../../assets/Vector.png")}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </View>
            <View
              style={[
                styles.absoluteLayer,
                {
                  top: 185 * scale,
                  left: 160 * scale,
                  width: 90 * scale,
                  height: 190 * scale,
                },
              ]}
              pointerEvents="none"
            >
              <Image
                source={require("../../assets/Basicman01.png")}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </View>
            <View
              style={[
                styles.absoluteLayer,
                {
                  top: 240 * scale,
                  left: 275 * scale,
                  width: 50 * scale,
                  height: 50 * scale,
                },
              ]}
              pointerEvents="none"
            >
              <Image
                source={require("../../assets/handcard.png")}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </View>
          </>
        )}

        {/* Dynamic Text Content (Screen 2 text adjusted to top: 375 * scale) */}
        <View
          style={[
            styles.absoluteLayer,
            currentIndex === 0 && {
              top: 380 * scale,
              left: 16 * scale,
              right: 16 * scale,
              alignItems: "center",
            },
            currentIndex === 1 && {
              top: 375 * scale,
              left: 16 * scale,
              right: 16 * scale,
              alignItems: "center",
            },
            currentIndex === 2 && {
              top: 390 * scale,
              left: 20 * scale,
              right: 20 * scale,
              alignItems: "center",
            },
          ]}
          pointerEvents="none"
        >
          <Text
            style={[
              styles.trackExpenseTitle,
              {
                fontSize: (currentIndex === 2 ? 20 : 19) * scale,
                lineHeight: (currentIndex === 2 ? 24 : 23) * scale,
                textAlign: currentIndex === 2 ? "center" : "auto",
              },
            ]}
          >
            {pageData.title}
          </Text>
          <Text
            style={[
              styles.trackExpenseSubtitle,
              {
                fontSize: 12.5 * scale,
                lineHeight: 17 * scale,
                marginTop: 3 * scale,
                textAlign: currentIndex === 2 ? "center" : "auto",
                color: "#475569",
              },
            ]}
          >
            {pageData.subtitle}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

// --- SWIPER LOGIC CONTROLLER ---
export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  visible,
  onFinish,
}) => {
  const insets = useSafeAreaInsets();
  const [currentPage, setCurrentPage] = useState(0);
  const onboardingRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setCurrentPage(0);
      onboardingRef.current?.scrollTo({ x: 0, animated: false });
    }
  }, [visible]);

  const handlePageIndexChange = useCallback((index: number) => {
    setCurrentPage(index);
  }, []);

  const handleNext = () => {
    if (currentPage < 2) {
      const nextIndex = currentPage + 1;
      onboardingRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      handlePageIndexChange(nextIndex);
    } else {
      onFinish();
    }
  };

  const navigateTo = (targetIndex: number) => {
    if (targetIndex >= 3) {
      onFinish();
      return;
    }
    onboardingRef.current?.scrollTo({
      x: targetIndex * SCREEN_WIDTH,
      animated: true,
    });
    handlePageIndexChange(targetIndex);
  };

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    if (page >= 0 && page < 3) {
      handlePageIndexChange(page);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={onFinish}
    >
      <View style={styles.container}>
        <ScrollView
          ref={onboardingRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {[0, 1, 2].map((pageIdx) => (
            <View key={`onboard-page-${pageIdx}`} style={styles.pageWrapper}>
              <View style={styles.screenContainer}>
                <OnboardingPageContent
                  currentIndex={pageIdx}
                  onNext={handleNext}
                  onSkip={onFinish}
                />
              </View>

              <View
                style={[
                  styles.bottomSectionContainer,
                  { paddingBottom: Math.max(insets.bottom + 8, 12) },
                ]}
              >
                {pageIdx === 2 ? (
                  <View
                    style={[
                      styles.getStartedButtonWrapper,
                      { paddingTop: 2, paddingBottom: 4 },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={onFinish}
                      style={styles.getStartedButton}
                    >
                      <Text style={styles.getStartedButtonText}>
                        Get Started
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.dotsRowContainer,
                      { paddingBottom: 4, paddingTop: 2 },
                    ]}
                  >
                    {[0, 1, 2].map((idx) => (
                      <TouchableOpacity
                        key={`dot-${idx}`}
                        onPress={() => navigateTo(idx)}
                        style={[
                          styles.dot,
                          currentPage === idx
                            ? styles.dotActive
                            : styles.dotInactive,
                        ]}
                      />
                    ))}
                  </View>
                )}

                <View style={styles.nativeAdEmbeddedContainer}>
                  <View style={styles.adCard}>
                    <NativeAdCard />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  pageWrapper: {
    width: SCREEN_WIDTH,
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
  },
  screenContainer: { flex: 1, maxHeight: SCREEN_HEIGHT > 750 ? "54%" : "50%" },
  bottomSectionContainer: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    alignItems: "center",
  },
  nativeAdEmbeddedContainer: {
    paddingHorizontal: 0,
    width: "100%",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  adCard: {
    width: "100%",
    borderRadius: 0,
    borderTopWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  nativeAdViewContainer: {
    width: "100%",
    height: 280,
    backgroundColor: "#FFFFFF",
  },
  nativeInnerContainer: {
    padding: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  nativeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  nativeIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  iconFallback: {
    backgroundColor: "#013459",
    justifyContent: "center",
    alignItems: "center",
  },
  iconFallbackText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 11,
  },
  adBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  adBadgeText: {
    fontSize: 9.5,
    color: "#D97706",
    fontWeight: "700",
  },
  nativeHeadline: {
    fontWeight: "700",
    fontSize: 13.5,
    color: "#0F172A",
  },
  nativeAdvertiser: {
    fontSize: 11,
    color: "#64748B",
  },
  nativeMediaView: {
    width: "100%",
    height: 130,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    marginVertical: 6,
  },
  nativeFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  nativeBody: {
    fontSize: 11.5,
    color: "#475569",
    lineHeight: 15,
  },
  storeText: {
    fontSize: 10.5,
    color: "#94A3B8",
  },
  nativeCtaButton: {
    backgroundColor: "#013459",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  nativeCtaText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  dotsRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: "#013459",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "#CBD5E1",
  },
  getStartedButtonWrapper: {
    width: "100%",
    alignItems: "center",
  },
  getStartedButton: {
    width: 237,
    height: 44,
    backgroundColor: "#013459",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#013459",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedButtonText: {
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: 15,
    textAlign: "center",
  },
  rootContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  canvasContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    width: "100%",
    height: "100%",
  },
  absoluteLayer: { position: "absolute" },
  fullImage: { width: "100%", height: "100%" },
  walletIconBox: { justifyContent: "center" },
  walletIconBoxRight: { justifyContent: "center", alignItems: "flex-end" },
  titleWrapper: { alignSelf: "flex-start" },
  moneyManagerTitle: {
    fontWeight: "400",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  titleUnderline: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  moneyManagerSubtitle: {
    fontWeight: "300",
    color: "rgba(255, 255, 255, 0.78)",
  },
  trackExpenseTitle: {
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  trackExpenseSubtitle: {
    fontWeight: "300",
    color: "#475569",
    textAlign: "center",
  },
  skipButtonContainer: {
    position: "absolute",
    right: 20,
    zIndex: 99,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  skipButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  screen2HeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  screen2CardTitle: { fontWeight: "700", color: "#0F172A" },
  screen2RowItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  screen2IconCircle: { alignItems: "center", justifyContent: "center" },
  screen2ItemInfo: { flex: 1, marginLeft: 6 },
  screen2ItemTitle: { fontWeight: "600", color: "#0F172A" },
  screen2ItemCategory: { fontWeight: "400", color: "#64748B" },
  screen2ItemExpense: { fontWeight: "600", color: "#EF4444" },
});

export default OnboardingFlow;
