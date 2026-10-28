import React from "react";
import {
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
import { CURRENCIES } from "../constants/theme";
import { Currency } from "../types";

interface CurrencyPickerModalProps {
  visible: boolean;
  currency: Currency;
  onSelect: (currency: Currency) => void;
  onClose: () => void;
  isLight?: boolean;
  title?: string;
}

export const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = ({
  visible,
  currency,
  onSelect,
  onClose,
  isLight = true,
  title = "Select Currency",
}) => {
  const insets = useSafeAreaInsets();
  const dark = !isLight;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close currency selector"
        />
        <View
          style={[
            styles.sheet,
            dark ? styles.sheetDark : styles.sheetLight,
            {
              paddingBottom: Math.max(
                insets.bottom + 16,
                Platform.OS === "android" ? 36 : 24,
              ),
            },
          ]}
        >
          <View style={[styles.dragHandle, dark && styles.dragHandleDark]} />
          <View style={styles.header}>
            <Text style={[styles.title, dark && styles.textDark]}>{title}</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={20} color={dark ? "#A1A1AA" : "#71717A"} />
            </Pressable>
          </View>
          <View style={[styles.separator, dark && styles.separatorDark]} />

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {CURRENCIES.map((c) => {
              const isSelected = currency?.code === c.code;
              const symbolDisplay =
                c.code === "PKR" ? "₨" : c.symbol.trim() || c.code;

              return (
                <Pressable
                  key={c.code}
                  onPress={() => {
                    onSelect(c);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.dataRow,
                    {
                      borderBottomColor: dark ? "#27272A" : "#E4E4E7",
                      backgroundColor: pressed
                        ? dark
                          ? "#27272A"
                          : "#F8FAFC"
                        : "transparent",
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${c.name}, ${c.code}`}
                >
                  <Text
                    style={[styles.dataTitle, dark && styles.textDark]}
                    numberOfLines={1}
                  >
                    {c.code} – {symbolDisplay}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    width: "100%",
    maxWidth: 412,
    maxHeight: "96%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    overflow: "hidden",
    alignSelf: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetLight: {
    backgroundColor: "#FFFFFF",
  },
  sheetDark: {
    backgroundColor: "#18181B",
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E4E4E7",
    marginBottom: 12,
    opacity: 0.8,
    alignSelf: "center",
  },
  dragHandleDark: {
    backgroundColor: "#3F3F46",
  },
  header: {
    width: "100%",
    minHeight: 38,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 14,
    position: "relative",
  },
  title: {
    color: "#0F172A",
    fontFamily: "Poppins",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  textDark: {
    color: "#FFFFFF",
  },
  closeButton: {
    position: "absolute",
    right: 24,
    top: "50%",
    transform: [{ translateY: -14 }],
    padding: 4,
    borderRadius: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#E4E4E7",
    marginBottom: 0,
  },
  separatorDark: {
    backgroundColor: "#27272A",
  },
  list: {
    width: "100%",
    flexGrow: 0,
  },
  listContent: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  dataRow: {
    width: 412,
    maxWidth: "100%",
    height: 70,
    paddingTop: 25,
    paddingBottom: 25,
    paddingLeft: 24,
    paddingRight: 24,
    borderBottomWidth: 0,
    justifyContent: "center",
    alignSelf: "center",
  },
  dataTitle: {
    width: 319,
    height: 24,
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    color: "#0F172A",
  },
});

export default CurrencyPickerModal;
