import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

export type HomeCoachStepId =
  "expense" | "income" | "addButton" | "profile" | "accounts";

export interface CoachTargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface HomeCoachMarksProps {
  visible: boolean;
  isLight?: boolean;
  targets: Partial<Record<HomeCoachStepId, React.RefObject<View | null>>>;
  onFinish: () => void;
}

const STEPS: {
  id: HomeCoachStepId;
  eyebrow: string;
  title: string;
  body: string;
  shape: "circle" | "round";
  pad: number;
}[] = [
  {
    id: "expense",
    eyebrow: "Step 1 of 5",
    title: "Add an expense",
    body: "Tap the expense + on this card to log spending. Choose a category, amount, and account, then save.",
    shape: "round",
    pad: 8,
  },
  {
    id: "income",
    eyebrow: "Step 2 of 5",
    title: "Add income",
    body: "Tap the income + to record salary, gifts, or other money in. It is saved to the wallet you select.",
    shape: "round",
    pad: 8,
  },
  {
    id: "addButton",
    eyebrow: "Step 3 of 5",
    title: "Draggable add button",
    body: "Hold and drag this button anywhere on Home. Tap it to add a new record without hunting through menus.",
    shape: "circle",
    pad: 6,
  },
  {
    id: "profile",
    eyebrow: "Step 4 of 5",
    title: "See your profile",
    body: "Tap your photo and name to open Profile. You can also use the Profile tab in the bar below.",
    shape: "round",
    pad: 8,
  },
  {
    id: "accounts",
    eyebrow: "Step 5 of 5",
    title: "Add an account",
    body: "Open Accounts, then tap the + at the top right to add cash, bank, or card wallets and track each balance.",
    shape: "round",
    pad: 10,
  },
];

const OVERLAY_FILL = "rgba(1, 46, 79, 0.78)";
const ACCENT = "#012E4F";
const TOOLTIP_MAX_W = 360;

function roundedRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  return [
    `M${x + radius},${y}`,
    `H${x + w - radius}`,
    `A${radius},${radius} 0 0 1 ${x + w},${y + radius}`,
    `V${y + h - radius}`,
    `A${radius},${radius} 0 0 1 ${x + w - radius},${y + h}`,
    `H${x + radius}`,
    `A${radius},${radius} 0 0 1 ${x},${y + h - radius}`,
    `V${y + radius}`,
    `A${radius},${radius} 0 0 1 ${x + radius},${y}`,
    "Z",
  ].join(" ");
}

function measureTarget(
  ref: React.RefObject<View | null> | undefined,
): Promise<CoachTargetRect | null> {
  return new Promise((resolve) => {
    const node = ref?.current;
    if (!node || typeof node.measureInWindow !== "function") {
      resolve(null);
      return;
    }
    node.measureInWindow((x, y, width, height) => {
      if (!width || !height) {
        resolve(null);
        return;
      }
      resolve({ x, y, width, height });
    });
  });
}

export const HomeCoachMarks: React.FC<HomeCoachMarksProps> = ({
  visible,
  isLight = true,
  targets,
  onFinish,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const [stepIndex, setStepIndex] = useState(0);
  const [hole, setHole] = useState<CoachTargetRect | null>(null);
  const pulse = useRef(new Animated.Value(0)).current;

  const step = STEPS[stepIndex];
  const appWidth = Math.min(screenW, 412);
  const appLeft = (screenW - appWidth) / 2;

  const measureCurrent = useCallback(async () => {
    if (!step) return;
    const rect = await measureTarget(targets[step.id]);
    if (rect) {
      setHole(rect);
      return;
    }
    setHole(null);
  }, [step, targets]);

  useEffect(() => {
    if (!visible) {
      setStepIndex(0);
      setHole(null);
      return;
    }
    const timer = setTimeout(() => {
      measureCurrent();
    }, 60);
    return () => clearTimeout(timer);
  }, [visible, stepIndex, measureCurrent, screenW, screenH]);

  useEffect(() => {
    if (!visible) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, pulse, stepIndex]);

  const cutout = useMemo(() => {
    if (!hole || !step) {
      return {
        x: appLeft + 24,
        y: screenH * 0.28,
        w: appWidth - 48,
        h: 72,
        r: 16,
      };
    }
    const pad = step.pad;
    const x = Math.max(8, hole.x - pad);
    const y = Math.max(8, hole.y - pad);
    const w = Math.min(screenW - x - 8, hole.width + pad * 2);
    const h = Math.min(screenH - y - 8, hole.height + pad * 2);
    const r =
      step.shape === "circle" ? Math.max(w, h) / 2 : Math.min(18, h / 2);
    return { x, y, w, h, r };
  }, [hole, step, appLeft, appWidth, screenH, screenW]);

  const overlayPath = useMemo(() => {
    const outer = `M0,0 H${screenW} V${screenH} H0 Z`;
    const inner = roundedRectPath(
      cutout.x,
      cutout.y,
      cutout.w,
      cutout.h,
      cutout.r,
    );
    return `${outer} ${inner}`;
  }, [cutout, screenH, screenW]);

  const tooltipLayout = useMemo(() => {
    const width = Math.min(TOOLTIP_MAX_W, appWidth - 32);
    const estimatedHeight = 196;
    const gap = 18;
    const spaceBelow = screenH - (cutout.y + cutout.h) - insets.bottom - 16;
    const spaceAbove = cutout.y - insets.top - 16;
    const placeBelow =
      spaceBelow >= estimatedHeight + gap || spaceBelow >= spaceAbove;

    let top = placeBelow
      ? cutout.y + cutout.h + gap
      : cutout.y - estimatedHeight - gap;

    const minTop = insets.top + 12;
    const maxTop = screenH - insets.bottom - estimatedHeight - 12;
    if (top < minTop) top = minTop;
    if (top > maxTop) top = Math.max(minTop, maxTop);

    const holeCenterX = cutout.x + cutout.w / 2;
    let left = holeCenterX - width / 2;
    const minLeft = appLeft + 16;
    const maxLeft = appLeft + appWidth - 16 - width;
    left = Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft));

    const arrowLeft = Math.min(
      Math.max(holeCenterX - left - 8, 22),
      width - 38,
    );
    return { top, left, width, placeBelow, arrowLeft };
  }, [appLeft, appWidth, cutout, insets.bottom, insets.top, screenH]);

  const finish = () => {
    onFinish();
  };

  const goNext = () => {
    if (stepIndex >= STEPS.length - 1) {
      finish();
      return;
    }
    setStepIndex((current) => current + 1);
  };

  if (!visible || !step) return null;

  const cardBg = isLight ? "#FFFFFF" : "#0F1A26";
  const titleColor = isLight ? ACCENT : "#F8FAFC";
  const bodyColor = isLight ? "#64748B" : "#94A3B8";
  const eyebrowColor = isLight ? "#5D7D95" : "#7EB3D0";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={finish}
    >
      <View style={styles.root} pointerEvents="box-none">
        <Svg
          width={screenW}
          height={screenH}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Path d={overlayPath} fill={OVERLAY_FILL} fillRule="evenodd" />
        </Svg>

        <View
          pointerEvents="none"
          style={[
            styles.holeRing,
            {
              left: cutout.x - 2,
              top: cutout.y - 2,
              width: cutout.w + 4,
              height: cutout.h + 4,
              borderRadius: cutout.r + 2,
            },
          ]}
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.pulseRing,
            {
              left: cutout.x - 10,
              top: cutout.y - 10,
              width: cutout.w + 20,
              height: cutout.h + 20,
              borderRadius: cutout.r + 10,
              opacity: pulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.55, 0.05],
              }),
              transform: [
                {
                  scale: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.08],
                  }),
                },
              ],
            },
          ]}
        />

        <Pressable
          style={[
            styles.skipHit,
            { top: Math.max(insets.top, 12) + 4, right: appLeft + 16 },
          ]}
          onPress={finish}
          accessibilityRole="button"
          accessibilityLabel="Skip tour"
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>

        <View
          style={[
            styles.tooltip,
            {
              top: tooltipLayout.top,
              left: tooltipLayout.left,
              width: tooltipLayout.width,
              backgroundColor: cardBg,
            },
          ]}
        >
          {!tooltipLayout.placeBelow && (
            <View
              style={[styles.arrowDownWrap, { left: tooltipLayout.arrowLeft }]}
            >
              <View style={[styles.arrowDown, { borderTopColor: cardBg }]} />
            </View>
          )}
          {tooltipLayout.placeBelow && (
            <View
              style={[styles.arrowUpWrap, { left: tooltipLayout.arrowLeft }]}
            >
              <View style={[styles.arrowUp, { borderBottomColor: cardBg }]} />
            </View>
          )}

          <Text style={[styles.eyebrow, { color: eyebrowColor }]}>
            {step.eyebrow}
          </Text>
          <Text style={[styles.title, { color: titleColor }]}>
            {step.title}
          </Text>
          <Text style={[styles.body, { color: bodyColor }]}>{step.body}</Text>

          <View style={styles.footer}>
            <View style={styles.dots}>
              {STEPS.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.dot,
                    index === stepIndex ? styles.dotActive : styles.dotIdle,
                  ]}
                />
              ))}
            </View>
            <Pressable
              style={styles.nextBtn}
              onPress={goNext}
              accessibilityRole="button"
              accessibilityLabel={
                stepIndex === STEPS.length - 1 ? "Got it" : "Next"
              }
            >
              <Text style={styles.nextText}>
                {stepIndex === STEPS.length - 1 ? "Got it" : "Next"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  holeRing: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(209, 223, 234, 0.95)",
  },
  pulseRing: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(93, 125, 149, 0.85)",
  },
  skipHit: {
    position: "absolute",
    zIndex: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  tooltip: {
    position: "absolute",
    zIndex: 5,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    shadowColor: "#012E4F",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 12,
  },
  arrowUpWrap: {
    position: "absolute",
    top: -8,
  },
  arrowUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  arrowDownWrap: {
    position: "absolute",
    bottom: -8,
  },
  arrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  body: {
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: "500",
  },
  footer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  dotIdle: {
    width: 7,
    backgroundColor: "#D1DFEA",
  },
  dotActive: {
    width: 18,
    backgroundColor: ACCENT,
  },
  nextBtn: {
    backgroundColor: ACCENT,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 88,
    alignItems: "center",
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
});

export default HomeCoachMarks;
