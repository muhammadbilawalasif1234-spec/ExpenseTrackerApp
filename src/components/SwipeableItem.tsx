import React, { useRef, useState } from "react";
import {
  View,
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { Trash2 } from "lucide-react-native";

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete?: () => void;
  isLight?: boolean;
  height?: number;
  width?: number | string;
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({
  children,
  onDelete,
  isLight = true,
  height,
  width,
}) => {
  const pan = useRef(new Animated.Value(0)).current;
  const [isOpen, setIsOpen] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Trigger horizontal swipe responder only if horizontal movement clearly exceeds vertical
        return (
          Math.abs(gestureState.dx) > 10 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (!onDelete) return;
        if (gestureState.dx < 0) {
          // Dragging left (revealing delete)
          const newX = Math.max(gestureState.dx, -85);
          pan.setValue(newX);
        } else if (isOpen && gestureState.dx > 0) {
          // Dragging right while open (closing)
          const newX = Math.min(-80 + gestureState.dx, 0);
          pan.setValue(newX);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!onDelete) return;
        if (gestureState.dx < -30 || (isOpen && gestureState.dx < 20)) {
          // Snap open
          Animated.spring(pan, {
            toValue: -80,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
          setIsOpen(true);
        } else {
          // Snap closed
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
          setIsOpen(false);
        }
      },
    }),
  ).current;

  const closeSwipe = () => {
    Animated.spring(pan, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
    setIsOpen(false);
  };

  if (!onDelete) {
    return (
      <View
        style={[
          styles.outerContainer,
          width ? { width: width as any } : null,
          height ? { height } : null,
        ]}
      >
        {children}
      </View>
    );
  }

  // Fade and scale delete icon in as item is swiped left
  const actionOpacity = pan.interpolate({
    inputRange: [-80, -30, 0],
    outputRange: [1, 0.6, 0],
    extrapolate: "clamp",
  });

  const actionScale = pan.interpolate({
    inputRange: [-80, -30, 0],
    outputRange: [1, 0.85, 0.6],
    extrapolate: "clamp",
  });

  return (
    <View
      style={[
        styles.outerContainer,
        width ? { width: width as any } : null,
        height ? { height } : null,
      ]}
    >
      {/* Hidden Delete action BEHIND card matching image ref */}
      <Animated.View
        style={[
          styles.deleteBackground,
          height ? { height } : null,
          {
            opacity: actionOpacity,
            transform: [{ scale: actionScale }],
          },
        ]}
      >
        <Pressable
          style={styles.deleteButton}
          onPress={() => {
            closeSwipe();
            onDelete();
          }}
        >
          <Trash2 size={18} color="#FFFFFF" strokeWidth={2} />
        </Pressable>
      </Animated.View>

      {/* Front Data Card (solid background layer) */}
      <Animated.View
        style={[
          styles.frontCard,
          height ? { height } : null,
          {
            transform: [{ translateX: pan }],
            backgroundColor: isLight ? "#FFFFFF" : "#0D1117",
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable
          onPress={() => {
            if (isOpen) {
              closeSwipe();
            }
          }}
          style={height ? { height, justifyContent: "center" } : undefined}
        >
          {children}
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 12,
    marginVertical: 1,
    backgroundColor: "transparent",
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
  },
  deleteBackground: {
    position: "absolute",
    top: 2,
    bottom: 2,
    right: 2,
    width: 42,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  deleteButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  frontCard: {
    width: "100%",
    zIndex: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
});
