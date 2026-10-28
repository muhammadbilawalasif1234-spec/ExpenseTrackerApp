import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import {
  Calendar,
  Check,
  CheckCircle2,
  PiggyBank,
  Plus,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react-native";
import { COLORS } from "../constants/theme";
import { Currency, SavingsGoal } from "../types";
import { formatCurrency } from "../utils/formatters";
import { SwipeableItem } from "./SwipeableItem";

interface SavingsGoalsSectionProps {
  goals: SavingsGoal[];
  currency: Currency;
  onAddGoal?: (goal: Omit<SavingsGoal, "id">) => void;
  onUpdateGoal?: (id: string, update: Partial<SavingsGoal>) => void;
  onDeleteGoal?: (id: string) => void;
  isLight?: boolean;
}

interface CircularProgressProps {
  percentage: number;
  color: string;
  isCompleted: boolean;
  size?: number;
  strokeWidth?: number;
  isLight?: boolean;
}

export const CircularGoalProgress: React.FC<CircularProgressProps> = ({
  percentage,
  color,
  isCompleted,
  size = 46,
  strokeWidth = 3.5,
  isLight = false,
}) => {
  const center = size / 2;
  const radius = center - strokeWidth - 1;
  const circumference = 2 * Math.PI * radius;
  const validPercent = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (validPercent / 100) * circumference;
  const activeColor = isCompleted ? "#10B981" : color || "#F59E0B";

  return (
    <View style={[styles.circularWrapper, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        {/* Background Track Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.12)"}
          strokeWidth={strokeWidth}
        />
        {/* Animated Progress Arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>

      {/* Centered Percentage or Checkmark */}
      <View style={styles.circularContent}>
        {isCompleted ? (
          <Check size={14} color="#10B981" strokeWidth={3} />
        ) : (
          <Text
            style={[
              styles.circularPercentText,
              isLight && styles.circularPercentTextLight,
            ]}
            numberOfLines={1}
          >
            {validPercent}
            <Text
              style={[styles.percentSmall, isLight && styles.percentSmallLight]}
            >
              %
            </Text>
          </Text>
        )}
      </View>
    </View>
  );
};

export const SavingsGoalsSection: React.FC<SavingsGoalsSectionProps> = ({
  goals,
  currency,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  isLight = false,
}) => {
  const insets = useSafeAreaInsets();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGoalForContribution, setSelectedGoalForContribution] =
    useState<SavingsGoal | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");

  // Add Goal Form State
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalCurrent, setNewGoalCurrent] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("");

  const handleSaveNewGoal = () => {
    const target = parseFloat(newGoalTarget);
    const current = parseFloat(newGoalCurrent) || 0;
    if (!newGoalName.trim() || isNaN(target) || target <= 0) return;

    if (onAddGoal) {
      onAddGoal({
        name: newGoalName.trim(),
        targetAmount: target,
        currentAmount: current,
        targetDate: newGoalDate.trim() || undefined,
        color: "#F59E0B",
        categoryIcon: "PiggyBank",
      });
    }

    setNewGoalName("");
    setNewGoalTarget("");
    setNewGoalCurrent("");
    setNewGoalDate("");
    setIsAddModalOpen(false);
  };

  const handleContribute = () => {
    if (!selectedGoalForContribution || !onUpdateGoal) return;
    const added = parseFloat(contributionAmount);
    if (isNaN(added) || added <= 0) return;

    const newAmount = selectedGoalForContribution.currentAmount + added;
    onUpdateGoal(selectedGoalForContribution.id, { currentAmount: newAmount });

    setContributionAmount("");
    setSelectedGoalForContribution(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.headerIconWrapper}>
            <PiggyBank size={16} color="#F59E0B" />
          </View>
          <View style={styles.headerTextGroup}>
            <Text
              style={[styles.sectionTitle, isLight && styles.sectionTitleLight]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Savings Goals & Vaults
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                isLight && styles.sectionSubtitleLight,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Track targets with live progress rings
            </Text>
          </View>
        </View>

        {onAddGoal && (
          <Pressable
            style={styles.addGoalBtn}
            onPress={() => setIsAddModalOpen(true)}
          >
            <Plus size={14} color="#000000" strokeWidth={2.5} />
            <Text style={styles.addGoalBtnText}>New Goal</Text>
          </Pressable>
        )}
      </View>

      {/* Goals List */}
      {goals.length === 0 ? (
        <View style={[styles.emptyCard, isLight && styles.emptyCardLight]}>
          <Target size={24} color="#64748B" />
          <Text style={[styles.emptyTitle, isLight && styles.emptyTitleLight]}>
            No Savings Goals Yet
          </Text>
          <Text
            style={[styles.emptySubtitle, isLight && styles.emptySubtitleLight]}
          >
            Set your target funds to start growing dedicated savings!
          </Text>
        </View>
      ) : (
        <View style={styles.goalsList}>
          {goals.map((g) => {
            const percent =
              g.targetAmount > 0
                ? Math.min(
                    100,
                    Math.round((g.currentAmount / g.targetAmount) * 100),
                  )
                : 0;
            const isCompleted = g.currentAmount >= g.targetAmount;
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);

            return (
              <SwipeableItem
                key={g.id}
                onDelete={onDeleteGoal ? () => onDeleteGoal(g.id) : undefined}
                isLight={isLight}
              >
                <View
                  style={[styles.goalCard, isLight && styles.goalCardLight]}
                >
                  {/* Top Row: Name, Date & Circular Progress Chart */}
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardTitleInfo}>
                      <View style={styles.goalNameRow}>
                        <Text
                          style={[
                            styles.goalName,
                            isLight && styles.goalNameLight,
                          ]}
                          numberOfLines={1}
                        >
                          {g.name}
                        </Text>
                        {isCompleted && (
                          <View style={styles.achievedBadge}>
                            <Sparkles size={9} color="#10B981" />
                            <Text style={styles.achievedText}>Done</Text>
                          </View>
                        )}
                      </View>

                      {g.targetDate ? (
                        <View style={styles.dateRow}>
                          <Calendar size={11} color="#94A3B8" />
                          <Text
                            style={[
                              styles.dateText,
                              isLight && styles.dateTextLight,
                            ]}
                            numberOfLines={1}
                          >
                            Target: {g.targetDate}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Circular Progress Ring next to goal */}
                    <CircularGoalProgress
                      percentage={percent}
                      color={g.color || "#F59E0B"}
                      isCompleted={isCompleted}
                      size={46}
                      strokeWidth={4}
                      isLight={isLight}
                    />
                  </View>

                  {/* Amount details */}
                  <View
                    style={[styles.amountBox, isLight && styles.amountBoxLight]}
                  >
                    <View style={styles.amountCol}>
                      <Text
                        style={[
                          styles.amountLabel,
                          isLight && styles.amountLabelLight,
                        ]}
                      >
                        SAVED
                      </Text>
                      <Text
                        style={styles.savedAmountText}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.75}
                      >
                        {formatCurrency(g.currentAmount, currency)}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.amountDivider,
                        isLight && styles.amountDividerLight,
                      ]}
                    />

                    <View style={styles.amountCol}>
                      <Text
                        style={[
                          styles.amountLabel,
                          isLight && styles.amountLabelLight,
                        ]}
                      >
                        TARGET
                      </Text>
                      <Text
                        style={[
                          styles.targetAmountText,
                          isLight && styles.targetAmountTextLight,
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.75}
                      >
                        {formatCurrency(g.targetAmount, currency)}
                      </Text>
                    </View>
                  </View>

                  {/* Linear Progress bar */}
                  <View
                    style={[
                      styles.linearTrack,
                      isLight && styles.linearTrackLight,
                    ]}
                  >
                    <View
                      style={[
                        styles.linearFill,
                        {
                          width: `${percent}%`,
                          backgroundColor: isCompleted
                            ? "#10B981"
                            : g.color || "#F59E0B",
                        },
                      ]}
                    />
                  </View>

                  {/* Actions bottom row */}
                  <View style={styles.cardActionsRow}>
                    <Text
                      style={[
                        styles.remainingText,
                        isLight && styles.remainingTextLight,
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                    >
                      {isCompleted
                        ? "Goal fully achieved!"
                        : `${formatCurrency(remaining, currency)} to go`}
                    </Text>

                    <View style={styles.btnRow}>
                      {onUpdateGoal && !isCompleted && (
                        <Pressable
                          style={styles.contributeBtn}
                          onPress={() => setSelectedGoalForContribution(g)}
                        >
                          <Plus size={12} color="#F59E0B" />
                          <Text style={styles.contributeBtnText}>
                            Add Funds
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              </SwipeableItem>
            );
          })}
        </View>
      )}

      {/* Modal: Contribute / Add Funds to Goal */}
      <Modal
        visible={!!selectedGoalForContribution}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedGoalForContribution(null)}
      >
        <View
          style={[
            styles.modalOverlay,
            {
              paddingBottom: Math.max(
                insets.bottom + 16,
                Platform.OS === "android" ? 38 : 28,
              ),
            },
          ]}
        >
          <View
            style={[styles.modalDialog, isLight && styles.modalDialogLight]}
          >
            <View
              style={[styles.modalHeader, isLight && styles.modalHeaderLight]}
            >
              <Text
                style={[styles.modalTitle, isLight && styles.modalTitleLight]}
              >
                Add to {selectedGoalForContribution?.name}
              </Text>
              <Pressable onPress={() => setSelectedGoalForContribution(null)}>
                <X size={18} color="#94A3B8" />
              </Pressable>
            </View>

            <Text
              style={[
                styles.modalInputLabel,
                isLight && styles.modalInputLabelLight,
              ]}
            >
              Contribution Amount ({currency.symbol})
            </Text>
            <TextInput
              style={[styles.textInput, isLight && styles.textInputLight]}
              placeholder="e.g. 5000"
              placeholderTextColor="#64748B"
              keyboardType="decimal-pad"
              value={contributionAmount}
              onChangeText={setContributionAmount}
              autoFocus
            />

            <Pressable style={styles.saveActionBtn} onPress={handleContribute}>
              <Check size={16} color="#000000" strokeWidth={2.5} />
              <Text style={styles.saveActionBtnText}>Confirm Contribution</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal: Add New Savings Goal */}
      <Modal
        visible={isAddModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            {
              paddingBottom: Math.max(
                insets.bottom + 16,
                Platform.OS === "android" ? 38 : 28,
              ),
            },
          ]}
        >
          <View
            style={[styles.modalDialog, isLight && styles.modalDialogLight]}
          >
            <View
              style={[styles.modalHeader, isLight && styles.modalHeaderLight]}
            >
              <Text
                style={[styles.modalTitle, isLight && styles.modalTitleLight]}
              >
                Create Savings Goal
              </Text>
              <Pressable onPress={() => setIsAddModalOpen(false)}>
                <X size={18} color="#94A3B8" />
              </Pressable>
            </View>

            <Text
              style={[
                styles.modalInputLabel,
                isLight && styles.modalInputLabelLight,
              ]}
            >
              Goal Name
            </Text>
            <TextInput
              style={[styles.textInput, isLight && styles.textInputLight]}
              placeholder="e.g. Emergency Fund, Laptop, Vacation"
              placeholderTextColor="#64748B"
              value={newGoalName}
              onChangeText={setNewGoalName}
            />

            <Text
              style={[
                styles.modalInputLabel,
                isLight && styles.modalInputLabelLight,
              ]}
            >
              Target Amount ({currency.symbol})
            </Text>
            <TextInput
              style={[styles.textInput, isLight && styles.textInputLight]}
              placeholder="e.g. 100000"
              placeholderTextColor="#64748B"
              keyboardType="decimal-pad"
              value={newGoalTarget}
              onChangeText={setNewGoalTarget}
            />

            <Text
              style={[
                styles.modalInputLabel,
                isLight && styles.modalInputLabelLight,
              ]}
            >
              Initial Amount Saved ({currency.symbol}) (Optional)
            </Text>
            <TextInput
              style={[styles.textInput, isLight && styles.textInputLight]}
              placeholder="0"
              placeholderTextColor="#64748B"
              keyboardType="decimal-pad"
              value={newGoalCurrent}
              onChangeText={setNewGoalCurrent}
            />

            <Text
              style={[
                styles.modalInputLabel,
                isLight && styles.modalInputLabelLight,
              ]}
            >
              Target Date (Optional)
            </Text>
            <TextInput
              style={[styles.textInput, isLight && styles.textInputLight]}
              placeholder="e.g. Dec 2026"
              placeholderTextColor="#64748B"
              value={newGoalDate}
              onChangeText={setNewGoalDate}
            />

            <Pressable style={styles.saveActionBtn} onPress={handleSaveNewGoal}>
              <Check size={16} color="#000000" strokeWidth={2.5} />
              <Text style={styles.saveActionBtnText}>Create Goal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  headerTextGroup: {
    flex: 1,
    minWidth: 0,
  },
  headerIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  sectionTitleLight: {
    color: "#0F172A",
  },
  sectionSubtitle: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 1,
  },
  sectionSubtitleLight: {
    color: "#64748B",
  },
  addGoalBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#F59E0B",
    flexShrink: 0,
  },
  addGoalBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000000",
  },
  goalsList: {
    gap: 12,
  },
  emptyCard: {
    backgroundColor: "#161B22",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#30363D",
    gap: 6,
  },
  emptyCardLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#CBD5E1",
  },
  emptyTitleLight: {
    color: "#0F172A",
  },
  emptySubtitle: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
  },
  emptySubtitleLight: {
    color: "#64748B",
  },
  goalCard: {
    backgroundColor: "#161B22",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#30363D",
    gap: 10,
  },
  goalCardLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTitleInfo: {
    flex: 1,
    minWidth: 0,
  },
  goalNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  goalName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    flexShrink: 1,
  },
  goalNameLight: {
    color: "#0F172A",
  },
  achievedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  achievedText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#10B981",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  dateText: {
    fontSize: 10,
    color: "#94A3B8",
  },
  dateTextLight: {
    color: "#64748B",
  },
  circularWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  circularContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  circularPercentText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  circularPercentTextLight: {
    color: "#0F172A",
  },
  percentSmall: {
    fontSize: 8,
    fontWeight: "600",
    color: "#94A3B8",
  },
  percentSmallLight: {
    color: "#64748B",
  },
  amountBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1117",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#21262D",
  },
  amountBoxLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  amountCol: {
    flex: 1,
    minWidth: 0,
  },
  amountLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  amountLabelLight: {
    color: "#64748B",
  },
  savedAmountText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#10B981",
  },
  targetAmountText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#CBD5E1",
  },
  targetAmountTextLight: {
    color: "#0F172A",
  },
  amountDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "#21262D",
    marginHorizontal: 8,
  },
  amountDividerLight: {
    backgroundColor: "#E2E8F0",
  },
  linearTrack: {
    height: 6,
    backgroundColor: "#0D1117",
    borderRadius: 3,
    overflow: "hidden",
  },
  linearTrackLight: {
    backgroundColor: "#E2E8F0",
  },
  linearFill: {
    height: "100%",
    borderRadius: 3,
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  remainingText: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "500",
    flex: 1,
    minWidth: 0,
  },
  remainingTextLight: {
    color: "#64748B",
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contributeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  contributeBtnText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#F59E0B",
  },
  deleteGoalBtn: {
    padding: 5,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 16,
  },
  modalDialog: {
    width: "92%",
    maxWidth: 412,
    backgroundColor: "#161B22",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: "#30363D",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 16,
    overflow: "hidden",
    gap: 12,
  },
  modalDialogLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#21262D",
  },
  modalHeaderLight: {
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  modalTitleLight: {
    color: "#0F172A",
  },
  modalInputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#CBD5E1",
    marginTop: 4,
  },
  modalInputLabelLight: {
    color: "#334155",
  },
  textInput: {
    backgroundColor: "#0D1117",
    borderWidth: 1,
    borderColor: "#30363D",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 13,
  },
  textInputLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    color: "#0F172A",
  },
  saveActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F59E0B",
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 6,
  },
  saveActionBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000000",
  },
});
