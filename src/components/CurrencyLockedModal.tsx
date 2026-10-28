import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Info } from "lucide-react-native";
import { Currency } from "../types";

interface CurrencyLockedModalProps {
  visible: boolean;
  currency: Currency;
  onClose: () => void;
  isLight?: boolean;
}

export const CurrencyLockedModal: React.FC<CurrencyLockedModalProps> = ({
  visible,
  currency,
  onClose,
  isLight = true,
}) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const bg = isLight ? "#FFFFFF" : "#121824";
  const borderColor = isLight ? "#E2E8F0" : "#30363D";
  const textColor = isLight ? "#0F172A" : "#F8FAFC";
  const subtextColor = isLight ? "#64748B" : "#94A3B8";
  const primaryColor = isLight ? "#012E4F" : "#38BDF8";
  const primaryBtnText = "#FFFFFF";

  const getCurrencyEmoji = (code: string) => {
    switch (code) {
      case "PKR":
        return "🇵🇰";
      case "USD":
        return "🇺🇸";
      case "EUR":
        return "🇪🇺";
      case "GBP":
        return "🇬🇧";
      case "AED":
        return "🇦🇪";
      case "SAR":
        return "🇸🇦";
      case "INR":
        return "🇮🇳";
      case "CAD":
        return "🇨🇦";
      case "AUD":
        return "🇦🇺";
      case "JPY":
        return "🇯🇵";
      case "CNY":
        return "🇨🇳";
      case "SGD":
        return "🇸🇬";
      case "QAR":
        return "🇶🇦";
      case "KWD":
        return "🇰🇼";
      default:
        return "🌐";
    }
  };

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
              backgroundColor: bg,
              borderColor: borderColor,
            },
          ]}
        >
          {/* Title */}
          <Text
            style={[styles.title, { color: isLight ? "#0F2C4C" : "#FFFFFF" }]}
          >
            Currency Locked
          </Text>

          {/* Large Circular Emblem */}
          <View
            style={[
              styles.emblemContainer,
              {
                borderColor: isLight ? "#E2E8F0" : "#30363D",
                backgroundColor: isLight ? "#F8FAFC" : "#1E293B",
              },
            ]}
          >
            <Text style={styles.emblemEmoji}>
              {getCurrencyEmoji(currency.code)}
            </Text>
          </View>

          {/* Currency Code & Symbol (e.g. PKR • Rs) */}
          <Text style={[styles.currencyCodeText, { color: subtextColor }]}>
            {currency.code} • {currency.symbol.trim()}
          </Text>

          {/* Currency Full Name */}
          <Text
            style={[
              styles.currencyNameText,
              { color: isLight ? "#0F2C4C" : "#FFFFFF" },
            ]}
          >
            {currency.name}
          </Text>

          {/* Warning Message Box */}
          <View
            style={[
              styles.warningBox,
              {
                backgroundColor: isLight
                  ? "#FDF8F8"
                  : "rgba(239, 68, 68, 0.08)",
                borderColor: isLight ? "#FEE2E2" : "rgba(239, 68, 68, 0.2)",
              },
            ]}
          >
            <Info size={18} color="#C55858" style={{ marginTop: 2 }} />
            <Text style={styles.warningText}>
              Base currency cannot be changed after setup. Changing your
              currency will make past transactions, account balances, budget
              calculations, and financial reports inaccurate.
            </Text>
          </View>

          {/* Understood Button */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.understoodBtn,
              {
                backgroundColor: isLight ? "#012E4F" : "#38BDF8",
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text style={[styles.understoodBtnText, { color: primaryBtnText }]}>
              Understood
            </Text>
          </Pressable>

          {/* Reset Instructions */}
          <View style={styles.resetContainer}>
            <Text style={[styles.resetTextNormal, { color: subtextColor }]}>
              Need a different currency?{"\n"}
              You can reset the app data anytime via{"\n"}
              <Text style={styles.resetTextBold}>
                Settings {">"} Clear All App Data
              </Text>
              .
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "Poppins" : "sans-serif",
  },
  emblemContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emblemEmoji: {
    fontSize: 38,
    textAlign: "center",
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: "center",
      },
    }),
  },
  currencyCodeText: {
    fontSize: 13.5,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  currencyNameText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.2,
    marginBottom: 20,
  },
  warningBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    color: "#B94B4B",
  },
  understoodBtn: {
    width: "100%",
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 20,
  },
  understoodBtnText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  resetContainer: {
    alignItems: "center",
    paddingHorizontal: 4,
  },
  resetTextNormal: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: "center",
    fontWeight: "400",
  },
  resetTextBold: {
    fontWeight: "700",
    color: "#0F2C4C",
  },
});

export default CurrencyLockedModal;
