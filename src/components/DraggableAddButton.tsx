import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

interface DraggableAddButtonProps {
  onPress: () => void;
  size?: number;
  iconColor?: string;
  hasBottomBanner?: boolean;
  bottomNavTop?: number;
  topOffset?: number;
  onPositionChange?: (pos: { x: number; y: number; size: number }) => void;
}

export const DraggableAddButton: React.FC<DraggableAddButtonProps> = ({
  onPress,
  size = 60,
  iconColor = "#FFFFFF",
  hasBottomBanner = false,
  bottomNavTop,
  topOffset,
  onPositionChange,
}) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Constrain horizontally within the cards area
  const containerWidth = Math.min(SCREEN_WIDTH, 412);
  const minX = 16;
  const maxX = Math.max(minX, containerWidth - size - 16);

  // Stats frame ends at ~348px (top padding 34 + header 74 + balance 160 + stats 80)
  // minY ensures the button never touches or enters the stats frame or balance card above
  const minY = topOffset ?? Math.max(insets.top, 34) + 74 + 160 + 80;

  // Bottom navbar top edge
  const estimatedBottomBarHeight = hasBottomBanner
    ? 118
    : 81 + Math.max(insets.bottom, 0);
  const navTop = bottomNavTop ?? SCREEN_HEIGHT - estimatedBottomBarHeight;
  const rawMaxY = navTop - size - 6;
  const maxY = Math.max(minY, rawMaxY);

  // Initial placement inside saved data cards area near bottom right
  const defaultX = maxX;
  const defaultY = Math.max(minY, Math.min(maxY, maxY - 16));

  const pan = useRef(
    new Animated.ValueXY({ x: defaultX, y: defaultY }),
  ).current;
  const currentPos = useRef({ x: defaultX, y: defaultY });
  const [isDragging, setIsDragging] = useState(false);

  // Update position if screen dimensions or bounds change
  React.useEffect(() => {
    const clampedX = Math.min(Math.max(currentPos.current.x, minX), maxX);
    const clampedY = Math.min(Math.max(currentPos.current.y, minY), maxY);
    if (
      clampedX !== currentPos.current.x ||
      clampedY !== currentPos.current.y
    ) {
      currentPos.current = { x: clampedX, y: clampedY };
      pan.setValue({ x: clampedX, y: clampedY });
    }
    onPositionChange?.({
      x: currentPos.current.x,
      y: currentPos.current.y,
      size,
    });
  }, [minX, maxX, minY, maxY, size, onPositionChange]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
        },
        onPanResponderGrant: () => {
          setIsDragging(true);
          pan.setOffset({
            x: currentPos.current.x,
            y: currentPos.current.y,
          });
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: (_, gestureState) => {
          const nextX = currentPos.current.x + gestureState.dx;
          const nextY = currentPos.current.y + gestureState.dy;

          const clampedDx =
            nextX < minX
              ? minX - currentPos.current.x
              : nextX > maxX
                ? maxX - currentPos.current.x
                : gestureState.dx;

          const clampedDy =
            nextY < minY
              ? minY - currentPos.current.y
              : nextY > maxY
                ? maxY - currentPos.current.y
                : gestureState.dy;

          pan.setValue({ x: clampedDx, y: clampedDy });
        },
        onPanResponderRelease: (_, gestureState) => {
          setIsDragging(false);
          pan.flattenOffset();

          const finalX = Math.min(
            Math.max(currentPos.current.x + gestureState.dx, minX),
            maxX,
          );
          const finalY = Math.min(
            Math.max(currentPos.current.y + gestureState.dy, minY),
            maxY,
          );

          currentPos.current = { x: finalX, y: finalY };
          pan.setValue({ x: finalX, y: finalY });
          onPositionChange?.({ x: finalX, y: finalY, size });

          // If it was a quick tap (< 6px drag movement), trigger onPress
          if (Math.abs(gestureState.dx) < 6 && Math.abs(gestureState.dy) < 6) {
            onPress();
          }
        },
        onPanResponderTerminate: () => {
          setIsDragging(false);
          pan.flattenOffset();
          pan.setValue({ x: currentPos.current.x, y: currentPos.current.y });
          onPositionChange?.({
            x: currentPos.current.x,
            y: currentPos.current.y,
            size,
          });
        },
      }),
    [maxX, maxY, minX, minY, onPress, onPositionChange, pan, size],
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.fabContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: isDragging ? 1.08 : 1.0 },
          ],
          shadowOpacity: isDragging ? 0.4 : 0.25,
          elevation: isDragging ? 12 : 8,
        },
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Add Record"
    >
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
      >
        <Defs>
          <LinearGradient
            id="addBtnLinearGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor="#012E4F" stopOpacity="1" />
            <Stop offset="100%" stopColor="#2E6B8A" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={size}
          height={size}
          rx={size / 2}
          ry={size / 2}
          fill="url(#addBtnLinearGrad)"
        />
      </Svg>

      <View style={styles.iconContainer} pointerEvents="none">
        <Plus size={28} color={iconColor} strokeWidth={2.8} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DraggableAddButton;
