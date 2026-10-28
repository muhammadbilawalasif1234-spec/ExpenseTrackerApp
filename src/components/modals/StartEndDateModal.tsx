import React, { useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  ScrollView,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Calendar as CalendarIcon, Check } from "lucide-react-native";

interface StartEndDateModalProps {
  visible: boolean;
  onClose: () => void;
  startDate: Date;
  endDate: Date;
  onSave: (startDate: Date, endDate: Date) => void;
  isLight?: boolean;
}

export const StartEndDateModal: React.FC<StartEndDateModalProps> = ({
  visible,
  onClose,
  startDate,
  endDate,
  onSave,
  isLight = true,
}) => {
  const insets = useSafeAreaInsets();
  const [tempStart, setTempStart] = useState<Date>(startDate);
  const [tempEnd, setTempEnd] = useState<Date>(endDate);
  const [startInputText, setStartInputText] = useState("");
  const [endInputText, setEndInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(
    null,
  );
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Listen to keyboard height to ensure keypad never covers date typing inputs in APK release builds
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const formatDateToSlash = (date: Date): string => {
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const y = date.getFullYear();
    return `${m}/${d}/${y}`;
  };

  // Synchronize when opened
  useEffect(() => {
    if (visible) {
      setTempStart(startDate);
      setTempEnd(endDate);
      setStartInputText(formatDateToSlash(startDate));
      setEndInputText(formatDateToSlash(endDate));
      setIsTyping(false);
      setActivePicker(null);
    } else {
      setKeyboardHeight(0);
    }
  }, [visible, startDate, endDate]);

  const handleStartTextChange = (text: string) => {
    // strip non-numeric and auto slash
    let cleaned = text.replace(/[^0-9]/g, "");
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    }
    if (cleaned.length > 4) {
      formatted =
        cleaned.slice(0, 2) +
        "/" +
        cleaned.slice(2, 4) +
        "/" +
        cleaned.slice(4, 8);
    }
    setStartInputText(formatted);
    setIsTyping(true);
  };

  const handleEndTextChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, "");
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    }
    if (cleaned.length > 4) {
      formatted =
        cleaned.slice(0, 2) +
        "/" +
        cleaned.slice(2, 4) +
        "/" +
        cleaned.slice(4, 8);
    }
    setEndInputText(formatted);
    setIsTyping(true);
  };

  const parseDateFromSlash = (str: string): Date | null => {
    const parts = str.split("/");
    if (parts.length !== 3) return null;
    const m = parseInt(parts[0], 10) - 1;
    const d = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
    if (m < 0 || m > 11 || d < 1 || d > 31 || y < 1900 || y > 2100) return null;
    const parsed = new Date(y, m, d);
    if (isNaN(parsed.getTime())) return null;
    return parsed;
  };

  const handleApply = () => {
    Keyboard.dismiss();
    const parsedStart = parseDateFromSlash(startInputText);
    const parsedEnd = parseDateFromSlash(endInputText);

    if (parsedStart && parsedEnd) {
      const minD = parsedStart < parsedEnd ? parsedStart : parsedEnd;
      const maxD = parsedStart < parsedEnd ? parsedEnd : parsedStart;
      onSave(minD, maxD);
      onClose();
    } else {
      // Fallback
      onSave(tempStart, tempEnd);
      onClose();
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const { height: SCREEN_HEIGHT } = Dimensions.get("window");
  const isKeyboardOpen = keyboardHeight > 0;
  const maxCardHeight =
    SCREEN_HEIGHT - (Platform.OS === "android" ? keyboardHeight : 0) - 30;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, width: "100%" }}
      >
        <Pressable
          style={[
            styles.backdrop,
            {
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              paddingBottom: Platform.OS === "android" ? keyboardHeight : 0,
            },
          ]}
          onPress={handleClose}
        >
          <Pressable
            style={[
              styles.card,
              {
                backgroundColor: isLight ? "#FFFFFF" : "#000000",
                borderColor: isLight ? "rgba(0,0,0,0.06)" : "#27272A",
                borderBottomLeftRadius: isKeyboardOpen ? 28 : 0,
                borderBottomRightRadius: isKeyboardOpen ? 28 : 0,
                maxHeight: maxCardHeight,
                paddingBottom:
                  Math.max(insets.bottom, 20) + (isKeyboardOpen ? 12 : 28),
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                alignItems: "center",
                paddingBottom: 16,
              }}
              style={{ width: "100%" }}
            >
              {/* Close button */}
              <Pressable
                style={[
                  styles.closeBtn,
                  { backgroundColor: isLight ? "#F1F5F9" : "#1F2937" },
                ]}
                onPress={handleClose}
                hitSlop={8}
              >
                <X size={18} color={isLight ? "#64748B" : "#94A3B8"} />
              </Pressable>

              {/* Title properties */}
              <View style={styles.titleContainer}>
                <Text
                  style={[
                    styles.subTitle,
                    { color: isLight ? "#64748B" : "#94A3B8" },
                  ]}
                >
                  Select a period
                </Text>
                <Text
                  style={[
                    styles.mainTitle,
                    { color: isLight ? "#012E4F" : "#FFFFFF" },
                  ]}
                >
                  Start date – End date
                </Text>
              </View>

              {/* Date Bars Container with TextInputs for direct date typing */}
              <View style={styles.barsContainer}>
                {/* Start date text input bar properties */}
                <View
                  style={[
                    styles.dateBar,
                    {
                      backgroundColor: isLight ? "#FFFFFF" : "#0D1117",
                      borderColor: isLight ? "#94A3B8" : "#3F3F46",
                    },
                    activePicker === "start" && styles.dateBarActive,
                  ]}
                >
                  <View
                    style={[
                      styles.barLabelBox,
                      { borderRightColor: isLight ? "#94A3B8" : "#3F3F46" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.barLabelText,
                        { color: isLight ? "#475569" : "#CBD5E1" },
                      ]}
                    >
                      Start Date
                    </Text>
                  </View>
                  <View style={styles.barValueBox}>
                    <TextInput
                      style={[
                        styles.barValueText,
                        {
                          width: "100%",
                          height: "100%",
                          textAlign: "center",
                          color: isLight ? "#012E4F" : "#FFFFFF",
                        },
                      ]}
                      value={startInputText}
                      onChangeText={handleStartTextChange}
                      onFocus={() => setActivePicker("start")}
                      onBlur={() => setActivePicker(null)}
                      placeholder="MM/DD/YYYY"
                      placeholderTextColor={isLight ? "#94A3B8" : "#64748B"}
                      keyboardType="numeric"
                      maxLength={10}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* End Date text input bar properties */}
                <View
                  style={[
                    styles.dateBar,
                    {
                      backgroundColor: isLight ? "#FFFFFF" : "#0D1117",
                      borderColor: isLight ? "#94A3B8" : "#3F3F46",
                    },
                    activePicker === "end" && styles.dateBarActive,
                  ]}
                >
                  <View
                    style={[
                      styles.barLabelBox,
                      { borderRightColor: isLight ? "#94A3B8" : "#3F3F46" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.barLabelText,
                        { color: isLight ? "#475569" : "#CBD5E1" },
                      ]}
                    >
                      End Date
                    </Text>
                  </View>
                  <View style={styles.barValueBox}>
                    <TextInput
                      style={[
                        styles.barValueText,
                        {
                          width: "100%",
                          height: "100%",
                          textAlign: "center",
                          color: isLight ? "#012E4F" : "#FFFFFF",
                        },
                      ]}
                      value={endInputText}
                      onChangeText={handleEndTextChange}
                      onFocus={() => setActivePicker("end")}
                      onBlur={() => setActivePicker(null)}
                      placeholder="MM/DD/YYYY"
                      placeholderTextColor={isLight ? "#94A3B8" : "#64748B"}
                      keyboardType="numeric"
                      maxLength={10}
                      returnKeyType="done"
                      onSubmitEditing={handleApply}
                    />
                  </View>
                </View>
              </View>

              {/* Action Done Button */}
              <View style={styles.actionContainer}>
                <Pressable style={styles.doneBtn} onPress={handleApply}>
                  <Text style={styles.doneBtnText}>Done</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 0,
  },
  card: {
    width: "100%",
    minHeight: 280,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    overflow: "hidden",
    justifyContent: "space-between",
    paddingBottom: 28,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 16,
    zIndex: 10,
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  titleContainer: {
    width: "100%",
    paddingTop: 20,
    paddingBottom: 6,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  subTitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "400",
    marginBottom: 1,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#012E4F",
    letterSpacing: -0.3,
  },
  barsContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  dateBar: {
    width: 260,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#94A3B8",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    overflow: "hidden",
    alignItems: "center",
  },
  dateBarActive: {
    borderColor: "#345D7A",
    borderWidth: 1.5,
  },
  barLabelBox: {
    width: 100,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#94A3B8",
  },
  barLabelText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
  },
  barValueBox: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  barValueText: {
    fontSize: 15,
    fontWeight: "400",
    color: "#012E4F",
  },
  pickerDropdown: {
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  pickerHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  pickerHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#345D7A",
  },
  pickerDoneSmall: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  monthScroll: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 2,
  },
  monthPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  monthPillActive: {
    backgroundColor: "#345D7A",
    borderColor: "#345D7A",
  },
  monthPillText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#334155",
  },
  monthPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  dayScroll: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 2,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleActive: {
    backgroundColor: "#345D7A",
    borderColor: "#345D7A",
  },
  dayCircleText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#334155",
  },
  dayCircleTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  actionContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginTop: 10,
  },
  doneBtn: {
    width: 260,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#345D7A",
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default StartEndDateModal;
