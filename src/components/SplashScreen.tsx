import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SpendlyLogo } from "./SpendlyLogo";

interface SplashScreenProps {
  visible: boolean;
  onComplete: () => void;
  appName?: string;
  bio?: string;
  isLight?: boolean;
}

const LOADING_STEPS = [
  { progress: 25, label: "Initializing financial engine..." },
  { progress: 55, label: "Syncing balances & multi-wallets..." },
  { progress: 80, label: "Calculating smart spending insights..." },
  { progress: 100, label: "Ready!" },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({
  visible,
  onComplete,
  bio = "Track • Budget • Save",
}) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState("Starting Spendly...");

  const taglineWords = (bio || "Track • Budget • Save")
    .split("•")
    .map((w) => w.trim())
    .filter(Boolean);

  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get("screen");
  const bottomDistance = Math.max(
    insets.bottom + 32,
    Platform.OS === "android" ? 56 : 40,
  );

  const containerFadeAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0.15)).current;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      hasStartedRef.current = false;
      return;
    }

    // Always ensure initial values are 100% visible on mount or when visible becomes true
    containerFadeAnim.setValue(1);
    fadeAnim.setValue(1);

    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    // Reset progress state
    progressAnim.setValue(0.15);
    setProgress(15);
    setStatusText("Starting Spendly...");

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < LOADING_STEPS.length) {
        const step = LOADING_STEPS[stepIdx];
        setProgress(step.progress);
        setStatusText(step.label);

        Animated.timing(progressAnim, {
          toValue: step.progress / 100,
          duration: 350,
          useNativeDriver: false,
        }).start();

        stepIdx++;
      } else {
        clearInterval(interval);
        // Smooth fade-out on completion
        Animated.parallel([
          Animated.timing(containerFadeAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onCompleteRef.current();
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [visible, containerFadeAnim, fadeAnim, progressAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.splashRoot,
        {
          opacity: containerFadeAnim,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
        },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <Pressable
        style={[
          styles.splashContainer,
          { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
        ]}
        onPress={() => onCompleteRef.current()}
      >
        {/* ================= 1. BACKGROUND GRADIENT ================= */}
        <Svg
          pointerEvents="none"
          style={StyleSheet.absoluteFillObject}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          viewBox={`0 0 ${SCREEN_WIDTH} ${SCREEN_HEIGHT}`}
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient id="figmaSplashGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0.60" stopColor="#FFFFFF" />
              <Stop offset="0.72" stopColor="#C0CCD6" />
              <Stop offset="0.80" stopColor="#809AAC" />
              <Stop offset="0.88" stopColor="#416783" />
              <Stop offset="1.00" stopColor="#0F3D5E" />
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            fill="url(#figmaSplashGrad)"
          />
        </Svg>

        {/* ================= 2. DEAD-CENTERED MAIN LOGO & TAGLINE ================= */}
        <View style={styles.centerContainer} pointerEvents="none">
          <Animated.View
            style={[
              styles.logoTaglineGroup,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            {/* Official Spendly Logo (Width: 180, Height: 118) */}
            <View style={styles.logoBox}>
              <SpendlyLogo width={180} height={118} />
            </View>

            {/* Subtitle Tagline Underneath (Track • Budget • Save) */}
            <View style={styles.taglineWrapper}>
              {taglineWords.map((word, idx) => (
                <React.Fragment key={`${word}-${idx}`}>
                  <Text style={styles.taglineWord}>{word}</Text>
                  {idx < taglineWords.length - 1 && (
                    <View style={styles.taglineDot} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </Animated.View>
        </View>

        {/* ================= 3. ANCHORED BOTTOM LOADING BAR ================= */}
        <View
          style={[styles.bottomLoader, { bottom: bottomDistance }]}
          pointerEvents="none"
        >
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.loaderStatusText}>{statusText}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  splashRoot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    backgroundColor: "#0F3D5E",
  },
  splashContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "#0F3D5E",
  },
  centerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  logoTaglineGroup: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoBox: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  taglineWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "nowrap",
    gap: 8,
  },
  taglineWord: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F3D5E",
    letterSpacing: 2,
    includeFontPadding: false,
  },
  taglineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(15, 61, 94, 0.4)",
  },
  bottomLoader: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    zIndex: 30,
    paddingHorizontal: 20,
  },
  progressTrack: {
    width: 230,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 3,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.45)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  loaderStatusText: {
    fontSize: 12.5,
    color: "#FFFFFF",
    letterSpacing: 0.5,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  absoluteFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default SplashScreen;
