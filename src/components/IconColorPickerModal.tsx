import React from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { CategoryIconView } from "./CategoryIconView";

interface IconColorPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedIcon: string;
  selectedColor: string;
  onSelectIcon: (icon: string) => void;
  onSelectColor: (color: string) => void;
  isLight: boolean;
  availableIcons: string[];
}

const COLORS = [
  "#6A66FF",
  "#66FFA3",
  "#FF9466",
  "#FF66E7",
  "#DB3C3C",
  "#F8C237",
  "#9747FF",
  "#66DAFF",
];

export const IconColorPickerModal: React.FC<IconColorPickerModalProps> = ({
  visible,
  onClose,
  selectedIcon,
  selectedColor,
  onSelectIcon,
  onSelectColor,
  isLight,
  availableIcons,
}) => {
  const insets = useSafeAreaInsets();
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");
  const textColor = isLight ? "#0F172A" : "#F8FAFC";
  const subtextColor = isLight ? "#64748B" : "#94A3B8";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.modalContent,
            {
              backgroundColor: isLight ? "#FFFFFF" : "#121824",
              borderColor: isLight ? "rgba(0,0,0,0.06)" : "#30363D",
              paddingBottom: Math.max(insets.bottom, 20) + 16,
            },
          ]}
        >
          {/* Notch */}
          <View
            style={[
              styles.notch,
              { backgroundColor: isLight ? "#E4E4E7" : "#3F3F46" },
            ]}
          />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ width: 28, height: 28 }} />
            <Text style={[styles.title, { color: textColor }]}>
              Choose Icon & Color
            </Text>
            <Pressable
              onPress={onClose}
              style={[
                styles.closeButton,
                { backgroundColor: isLight ? "#F1F5F9" : "#1E293B" },
              ]}
            >
              <X size={16} color={subtextColor} />
            </Pressable>
          </View>

          {/* Colors Card */}
          <View style={styles.colorsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 12,
                alignItems: "center",
                paddingHorizontal: 2,
              }}
            >
              {COLORS.map((color) => {
                const isSelected =
                  color.toLowerCase() === selectedColor.toLowerCase();
                return (
                  <Pressable
                    key={color}
                    onPress={() => onSelectColor(color)}
                    style={styles.colorWrapper}
                  >
                    {isSelected ? (
                      <View
                        style={[
                          styles.selectedColorOuter,
                          { borderColor: color },
                        ]}
                      >
                        <View
                          style={[
                            styles.selectedColorInner,
                            { backgroundColor: color },
                          ]}
                        />
                      </View>
                    ) : (
                      <View
                        style={[styles.colorOption, { backgroundColor: color }]}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Icons Card */}
          <View style={styles.iconsContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View style={styles.iconsGrid}>
                {availableIcons.map((icName) => {
                  const isSelected = icName === selectedIcon;
                  const accountIconBg = isLight ? "#F4F4F5" : "#1E293B";
                  return (
                    <Pressable
                      key={icName}
                      onPress={() => onSelectIcon(icName)}
                      style={[
                        styles.iconOption,
                        {
                          backgroundColor: isSelected
                            ? selectedColor + "22"
                            : accountIconBg,
                          borderWidth: isSelected ? 1.5 : 0,
                          borderColor: isSelected
                            ? selectedColor
                            : "transparent",
                          borderRadius: 26,
                        },
                      ]}
                    >
                      <CategoryIconView
                        iconName={icName}
                        color={isSelected ? selectedColor : "#71717A"}
                        size={22}
                        containerSize={52}
                        borderRadius={26}
                        customBg="transparent"
                        customColor={isSelected ? selectedColor : "#71717A"}
                        isLight={isLight}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Bottom Save Button */}
          <View style={styles.bottomButtonWrapper}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.saveButton,
                { opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    maxWidth: 412,
    maxHeight: Dimensions.get("window").height * 0.88,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 16,
    alignSelf: "center",
    overflow: "hidden",
    alignItems: "center",
  },
  notch: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
    opacity: 0.6,
    alignSelf: "center",
  },
  header: {
    width: "100%",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  colorsContainer: {
    width: "100%",
    height: 90,
    justifyContent: "center",
    marginBottom: 12,
  },
  colorWrapper: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedColorOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  selectedColorInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  iconsContainer: {
    width: "100%",
    maxHeight: 280,
    marginBottom: 16,
  },
  iconsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconOption: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bottomButtonWrapper: {
    width: "100%",
    paddingTop: 4,
  },
  saveButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#012E4F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: "100%",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default IconColorPickerModal;
