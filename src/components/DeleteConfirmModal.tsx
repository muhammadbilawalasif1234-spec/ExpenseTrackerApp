import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Trash2, X } from "lucide-react-native";

interface DeleteConfirmModalProps {
  visible?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemDetails?: {
    category?: string;
    amount?: string;
    note?: string;
  };
  isLight?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Record?",
  message = "Are you sure you want to delete this record? This action cannot be undone.",
  itemDetails,
  isLight = true,
}) => {
  const insets = useSafeAreaInsets();
  const isShown = visible ?? isOpen ?? false;
  if (!isShown) return null;

  const bgModal = isLight ? "#FFFFFF" : "#1E293B";
  const textColor = isLight ? "#000000" : "#FFFFFF";
  const subtextColor = isLight ? "#64748B" : "#94A3B8";
  const borderColor = isLight ? "rgba(0, 0, 0, 0.06)" : "#30363D";
  const cardBoxBg = isLight ? "#FAFAFA" : "#111827";

  return (
    <Modal
      visible={isShown}
      transparent={true}
      statusBarTranslucent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 0,
        }}
        onPress={onClose}
      >
        {/* Bottom Sheet Container matching Add Record sub-screens */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 480,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderWidth: 1,
            borderColor: borderColor,
            backgroundColor: bgModal,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 20,
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: Math.max(
              insets.bottom + 16,
              Platform.OS === "android" ? 38 : 28,
            ),
            alignItems: "center",
          }}
        >
          {/* Top Drag Handle / Notch */}
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              marginBottom: 4,
              opacity: 0.6,
              backgroundColor: isLight ? "#E4E4E7" : "#3F3F46",
              alignSelf: "center",
            }}
          />

          {/* Header Title Row matching Add Record screen standard */}
          <View
            style={{
              width: "100%",
              height: 54,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 4,
            }}
          >
            <View style={{ width: 28, height: 28 }} />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: textColor,
                textAlign: "center",
                fontFamily: Platform.OS === "ios" ? "Poppins" : "sans-serif",
              }}
            >
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              style={{ padding: 4, borderRadius: 15 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={isLight ? "#71717A" : "#A1A1AA"} />
            </Pressable>
          </View>

          {/* Separator Line */}
          <View
            style={{
              width: "100%",
              height: 1,
              backgroundColor: isLight ? "#E4E4E7" : "#30363D",
              marginBottom: 16,
            }}
          />

          {/* Red Trash Icon Badge */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: isLight ? "#FEE2E2" : "rgba(239, 68, 68, 0.15)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Trash2 size={26} color="#EF4444" strokeWidth={2.2} />
          </View>

          {/* Warning Message */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "400",
              color: subtextColor,
              textAlign: "center",
              lineHeight: 20,
              marginBottom: 16,
              paddingHorizontal: 8,
            }}
          >
            {message}
          </Text>

          {/* Item details card if provided */}
          {itemDetails && (itemDetails.category || itemDetails.amount) && (
            <View
              style={{
                width: "100%",
                backgroundColor: cardBoxBg,
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: borderColor,
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              {itemDetails.category && (
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: textColor,
                  }}
                >
                  {itemDetails.category}
                </Text>
              )}
              {itemDetails.amount && (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#EF4444",
                    marginTop: 2,
                  }}
                >
                  {itemDetails.amount}
                </Text>
              )}
              {itemDetails.note ? (
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: subtextColor,
                    marginTop: 6,
                    textAlign: "center",
                  }}
                  numberOfLines={2}
                >
                  Note: {itemDetails.note}
                </Text>
              ) : null}
            </View>
          )}

          {/* Bottom Action Buttons matching Add Record screen modal buttons */}
          <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 14,
                backgroundColor: isLight ? "#F4F4F5" : "#111827",
                borderWidth: isLight ? 1 : 0,
                borderColor: "#E2E8F0",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: subtextColor }}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                onConfirm();
                onClose();
              }}
              style={{
                flex: 1.5,
                height: 48,
                borderRadius: 14,
                backgroundColor: "#EF4444",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#EF4444",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Trash2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}
              >
                Delete
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default DeleteConfirmModal;
