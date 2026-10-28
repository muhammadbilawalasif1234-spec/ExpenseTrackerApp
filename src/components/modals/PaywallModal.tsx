import { Check, Crown, ShieldAlert, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  closeTimerSeconds?: number;
  ctaColor?: string;
  isLight?: boolean;
  onSubscribe?: (planId: "monthly" | "yearly") => Promise<boolean> | void;
  onRestore?: () => Promise<boolean> | void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  onClose,
  closeTimerSeconds = 2,
  ctaColor = "#E39434",
  isLight = true,
  onSubscribe,
  onRestore,
}) => {
  const insets = useSafeAreaInsets();
  const [timeLeft, setTimeLeft] = useState(closeTimerSeconds);
  const [canClose, setCanClose] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "yearly",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setTimeLeft(closeTimerSeconds);
      setCanClose(false);
      setIsLoading(false);
      setErrorMessage(null);
      setSuccessMessage(null);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [visible, closeTimerSeconds]);

  if (!visible) return null;

  const bg = isLight ? "#FFFFFF" : "#0B1118";
  const textColor = isLight ? "#0F2C4C" : "#FFFFFF";
  const subtextColor = isLight ? "#64748B" : "#94A3B8";
  const cardBg = isLight ? "#F8FAFC" : "#131C2A";
  const cardBorder = isLight ? "#E2E8F0" : "#1E293B";

  const handleSubscribePress = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (onSubscribe) {
        const success = await onSubscribe(selectedPlan);
        if (success !== false) {
          onClose();
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        onClose();
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "Payment failed or was cancelled.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePress = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (onRestore) {
        const success = await onRestore();
        if (success !== false) {
          setSuccessMessage("Previous purchases restored successfully!");
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setSuccessMessage("Purchases restored successfully!");
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error: any) {
      setErrorMessage("No active subscriptions found to restore.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
    >
      <View
        style={[
          styles.container,
          { backgroundColor: bg, paddingTop: Math.max(insets.top, 24) },
        ]}
      >
        {/* Header Row */}
        <View style={styles.headerRow}>
          {canClose && !isLoading ? (
            <Pressable
              onPress={onClose}
              style={[
                styles.closeBtn,
                {
                  backgroundColor: isLight
                    ? "rgba(0,0,0,0.06)"
                    : "rgba(255,255,255,0.1)",
                },
              ]}
              hitSlop={12}
            >
              <X size={20} color={textColor} />
            </Pressable>
          ) : (
            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>
                {canClose ? "✓" : `${timeLeft}s`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View
            style={[styles.iconCircle, { backgroundColor: ctaColor + "20" }]}
          >
            <Crown size={40} color={ctaColor} />
          </View>
          <Text style={[styles.title, { color: textColor }]}>
            Unlock Spendly Pro
          </Text>
          <Text style={[styles.subtitle, { color: subtextColor }]}>
            Get unlimited tracking, advanced financial analytics, and zero ads.
          </Text>

          {errorMessage && (
            <View style={styles.errorBox}>
              <ShieldAlert size={16} color="#EF4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successBox}>
              <Check size={16} color="#10B981" strokeWidth={3} />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* Perks List */}
          <View style={styles.perksList}>
            <View style={styles.perkRow}>
              <View style={[styles.checkCircle, { backgroundColor: ctaColor }]}>
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={[styles.perkText, { color: textColor }]}>
                Unlimited Accounts & Wallets
              </Text>
            </View>
            <View style={styles.perkRow}>
              <View style={[styles.checkCircle, { backgroundColor: ctaColor }]}>
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={[styles.perkText, { color: textColor }]}>
                Detailed Financial Reports & Export
              </Text>
            </View>
            <View style={styles.perkRow}>
              <View style={[styles.checkCircle, { backgroundColor: ctaColor }]}>
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={[styles.perkText, { color: textColor }]}>
                100% Ad-Free Experience
              </Text>
            </View>
          </View>

          {/* Subscription Plans Selection Cards */}
          <View style={styles.plansContainer}>
            {/* Yearly Plan */}
            <Pressable
              style={[
                styles.planCard,
                {
                  backgroundColor: cardBg,
                  borderColor:
                    selectedPlan === "yearly" ? ctaColor : cardBorder,
                },
                selectedPlan === "yearly" && {
                  borderWidth: 2,
                  backgroundColor: ctaColor + "08",
                },
              ]}
              onPress={() => !isLoading && setSelectedPlan("yearly")}
            >
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>BEST VALUE • SAVE 50%</Text>
              </View>
              <View style={styles.planInfoRow}>
                <View>
                  <Text style={[styles.planTitle, { color: textColor }]}>
                    Annual Access
                  </Text>
                  <Text style={[styles.planSub, { color: subtextColor }]}>
                    $3.33 / month, billed annually
                  </Text>
                </View>
                <Text style={[styles.planPrice, { color: textColor }]}>
                  $39.99
                </Text>
              </View>
            </Pressable>

            {/* Monthly Plan */}
            <Pressable
              style={[
                styles.planCard,
                {
                  backgroundColor: cardBg,
                  borderColor:
                    selectedPlan === "monthly" ? ctaColor : cardBorder,
                },
                selectedPlan === "monthly" && {
                  borderWidth: 2,
                  backgroundColor: ctaColor + "08",
                },
              ]}
              onPress={() => !isLoading && setSelectedPlan("monthly")}
            >
              <View style={styles.planInfoRow}>
                <View>
                  <Text style={[styles.planTitle, { color: textColor }]}>
                    Monthly Access
                  </Text>
                  <Text style={[styles.planSub, { color: subtextColor }]}>
                    Cancel anytime
                  </Text>
                </View>
                <Text style={[styles.planPrice, { color: textColor }]}>
                  $6.99
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Footer Actions & Links */}
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 20) + 12 },
          ]}
        >
          <Pressable
            style={[
              styles.continueButton,
              { backgroundColor: ctaColor, opacity: isLoading ? 0.7 : 1 },
            ]}
            onPress={handleSubscribePress}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.continueButtonText}>
                  Processing with App Store...
                </Text>
              </View>
            ) : (
              <Text style={styles.continueButtonText}>
                {selectedPlan === "yearly"
                  ? "Start Free Trial & Subscribe"
                  : "Subscribe Now"}
              </Text>
            )}
          </Pressable>

          <View style={styles.footerLinksRow}>
            <Pressable onPress={handleRestorePress} disabled={isLoading}>
              <Text style={[styles.footerLinkText, { color: subtextColor }]}>
                Restore Purchases
              </Text>
            </Pressable>
            <Text style={[styles.footerDot, { color: subtextColor }]}>•</Text>
            <Pressable onPress={() => {}} disabled={isLoading}>
              <Text style={[styles.footerLinkText, { color: subtextColor }]}>
                Terms of Service
              </Text>
            </Pressable>
            <Text style={[styles.footerDot, { color: subtextColor }]}>•</Text>
            <Pressable onPress={() => {}} disabled={isLoading}>
              <Text style={[styles.footerLinkText, { color: subtextColor }]}>
                Privacy Policy
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  headerRow: {
    height: 48,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  timerBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  timerText: { fontSize: 12, fontWeight: "700", color: "#64748B" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
    gap: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    width: "100%",
    maxWidth: 340,
  },
  errorText: { color: "#DC2626", fontSize: 12, fontWeight: "600", flex: 1 },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    width: "100%",
    maxWidth: 340,
  },
  successText: { color: "#059669", fontSize: 12, fontWeight: "600", flex: 1 },
  perksList: { width: "100%", maxWidth: 320, gap: 8, marginTop: 4 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  perkText: { fontSize: 13, fontWeight: "600" },
  plansContainer: { width: "100%", maxWidth: 340, gap: 10, marginTop: 8 },
  planCard: {
    width: "100%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    position: "relative",
  },
  planBadge: {
    position: "absolute",
    top: -10,
    right: 14,
    backgroundColor: "#012E4F",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  planBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  planInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planTitle: { fontSize: 15, fontWeight: "700" },
  planSub: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  planPrice: { fontSize: 18, fontWeight: "800" },
  footer: { width: "100%", alignItems: "center", gap: 12 },
  continueButton: {
    width: "100%",
    maxWidth: 380,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  footerLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  footerLinkText: {
    fontSize: 11,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  footerDot: { fontSize: 11, fontWeight: "600" },
});

export default PaywallModal;
