import { Check, Plus, Tag, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, DEFAULT_CATEGORIES } from "../../constants/theme";
import { Budget, Category, Currency, Subcategory } from "../../types";
import { getCategoryColor } from "../../utils/categoryColors";
import { formatCurrency } from "../../utils/formatters";
import { CategoryChooserGrid } from "../CategoryChooserGrid";
import { CategoryIconView } from "../CategoryIconView";
import { CategoryScreens } from "../CategoryScreens";
import { SwipeableItem } from "../SwipeableItem";

interface BudgetsScreenProps {
  budgets: Budget[];
  categories?: Category[];
  currency: Currency;
  periodExpensesByCategory: Record<string, number>;
  onAddOrUpdateBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
  isLight?: boolean;
  onAddCategory?: (cat: Omit<Category, "id">) => Category;
  onUpdateCategory?: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory?: (id: string) => void;
  onAddSubcategory?: (categoryId: string, sub: Omit<Subcategory, "id">) => void;
  onDeleteSubcategory?: (categoryId: string, subId: string) => void;
  onNavigateLedgerTotal?: () => void;
}

export const BudgetsScreen: React.FC<BudgetsScreenProps> = ({
  budgets,
  categories = DEFAULT_CATEGORIES,
  currency,
  periodExpensesByCategory,
  onAddOrUpdateBudget,
  onDeleteBudget,
  isLight = false,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddSubcategory,
  onDeleteSubcategory,
  onNavigateLedgerTotal,
}) => {
  const insets = useSafeAreaInsets();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewingCategories, setIsViewingCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [limitAmount, setLimitAmount] = useState<string>("");

  const containerBg = isLight ? "#FFFFFF" : "#0D1117";
  const textColor = isLight ? "#012E4F" : "#FFFFFF";
  const subTextColor = isLight ? "#64748B" : "#94A3B8";
  const borderCol = isLight ? "#E2E8F0" : "#30363D";

  const activeCategories =
    categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const expenseCategories = useMemo(() => {
    const expenses = activeCategories.filter(
      (category) => category && category.type === "expense",
    );

    return [...expenses].sort((a, b) => {
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      const isOtherA = nameA.includes("other") || nameA.includes("general");
      const isOtherB = nameB.includes("other") || nameB.includes("general");

      if (isOtherA && !isOtherB) return 1;
      if (!isOtherA && isOtherB) return -1;
      return 0;
    });
  }, [activeCategories]);

  useEffect(() => {
    if (
      !expenseCategories.some(
        (category) =>
          category.name.toLowerCase() === selectedCategory.toLowerCase(),
      )
    ) {
      setSelectedCategory(expenseCategories[0]?.name || "");
    }
  }, [expenseCategories, selectedCategory]);

  const handleSave = () => {
    const num = parseFloat(limitAmount);
    if (isNaN(num) || num <= 0) return;

    onAddOrUpdateBudget({
      id: `b-${Date.now()}`,
      category: selectedCategory,
      limit: num,
      period: "monthly",
      alertThreshold: 80,
    });

    setLimitAmount("");
    setIsModalOpen(false);

    if (onNavigateLedgerTotal) {
      onNavigateLedgerTotal();
    }
  };

  if (isViewingCategories) {
    return (
      <CategoryScreens
        categories={activeCategories}
        isLight={isLight}
        onBackToProfile={() => setIsViewingCategories(false)}
        onAddCategory={
          onAddCategory || ((cat) => ({ ...cat, id: `cat-${Date.now()}` }))
        }
        onUpdateCategory={onUpdateCategory || (() => {})}
        onDeleteCategory={onDeleteCategory || (() => {})}
        onAddSubcategory={onAddSubcategory || (() => {})}
        onDeleteSubcategory={onDeleteSubcategory || (() => {})}
      />
    );
  }

  return (
    <View style={[styles.screenContainer, { backgroundColor: containerBg }]}>
      {/* Top Header */}
      <View
        style={[
          styles.headerRow,
          {
            borderBottomColor: borderCol,
            backgroundColor: containerBg,
          },
        ]}
      >
        <View style={{ height: 38, justifyContent: "center", paddingTop: 8 }}>
          <Text style={[styles.headerTitle, { color: textColor }]}>Budget</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={[
              styles.circleActionButton,
              { backgroundColor: isLight ? "#EAEFF5" : "#21262D" },
            ]}
            onPress={() => setIsViewingCategories(true)}
            accessibilityLabel="Manage Categories"
          >
            <Tag
              size={17}
              color={isLight ? "#012E4F" : "#FFFFFF"}
              strokeWidth={2}
            />
          </Pressable>

          <Pressable
            style={[styles.circleActionButton, { backgroundColor: "#5D7D95" }]}
            onPress={() => setIsModalOpen(true)}
            accessibilityLabel="Add Budget"
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Empty State / Custom Banner */}
        {budgets.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <Text style={[styles.emptyHeaderTitle, { color: textColor }]}>
              No budgets yet click below to add
            </Text>
            <Text style={[styles.emptyHeaderSubtitle, { color: subTextColor }]}>
              Set a limit for a category or one overall
            </Text>

            <View style={styles.emptyIllustrationWrapper}>
              <Pressable
                style={styles.budgetCircleAssetContainer}
                onPress={() => setIsModalOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Open Add Budget Modal"
              >
                <Image
                  source={require("../../assets/budgticon.png")}
                  style={styles.budgtIconImage}
                  resizeMode="contain"
                />
              </Pressable>
              <Pressable
                style={styles.floatingAddButton}
                onPress={() => setIsModalOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Open Add Budget Modal"
              >
                <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            </View>
          </View>
        )}

        {/* Category Limits List */}
        {budgets.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: textColor }]}
                numberOfLines={1}
              >
                Category Spending Limits
              </Text>
              <Pressable
                style={[
                  styles.addBtn,
                  {
                    backgroundColor: isLight
                      ? "rgba(16, 185, 129, 0.12)"
                      : "rgba(1, 46, 79, 0.12)",
                  },
                ]}
                onPress={() => setIsModalOpen(true)}
              >
                <Plus size={14} color={isLight ? "#059669" : COLORS.primary} />
                <Text
                  style={[
                    styles.addBtnText,
                    { color: isLight ? "#059669" : COLORS.primary },
                  ]}
                >
                  Set Limit
                </Text>
              </Pressable>
            </View>

            <View style={styles.budgetList}>
              {budgets.map((b) => {
                const spent =
                  periodExpensesByCategory[b.category.toLowerCase()] || 0;
                const percent =
                  b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
                const isOver = spent > b.limit;

                const matchedCategory = activeCategories.find(
                  (c) =>
                    c &&
                    c.name &&
                    c.name.toLowerCase() === b.category.toLowerCase(),
                );
                const catColor =
                  matchedCategory?.color || getCategoryColor(b.category);

                return (
                  <SwipeableItem
                    key={b.id}
                    onDelete={() => onDeleteBudget(b.id)}
                    isLight={isLight}
                  >
                    <View
                      style={[
                        styles.budgetItem,
                        isLight && styles.budgetItemLight,
                      ]}
                    >
                      <View style={styles.itemTopRow}>
                        <View style={styles.categoryInfo}>
                          <CategoryIconView
                            iconName={matchedCategory?.icon || b.category}
                            color={catColor}
                            size={14}
                            containerSize={28}
                            customBg={catColor + "22"}
                            customColor={catColor}
                            isLight={isLight}
                          />
                          <Text
                            style={[
                              styles.categoryName,
                              isLight && styles.categoryNameLight,
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {b.category}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.itemAmountRow}>
                        <Text
                          style={[
                            styles.spentAmount,
                            isLight && styles.spentAmountLight,
                          ]}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.75}
                        >
                          {formatCurrency(spent, currency)}{" "}
                          <Text
                            style={[
                              styles.limitAmount,
                              isLight && styles.limitAmountLight,
                            ]}
                          >
                            / {formatCurrency(b.limit, currency)}
                          </Text>
                        </Text>
                        <Text
                          style={[
                            styles.percentBadge,
                            isLight && styles.percentBadgeLight,
                            isOver && {
                              color: isLight ? "#E11D48" : COLORS.expense,
                            },
                            !isOver &&
                              percent > 80 && {
                                color: isLight ? "#F59E0B" : COLORS.warning,
                              },
                          ]}
                          numberOfLines={1}
                        >
                          {percent}%
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.itemProgressBg,
                          isLight && styles.itemProgressBgLight,
                        ]}
                      >
                        <View
                          style={[
                            styles.itemProgressFill,
                            {
                              width: `${Math.min(100, percent)}%`,
                              backgroundColor: isOver
                                ? isLight
                                  ? "#E11D48"
                                  : COLORS.expense
                                : percent > 80
                                  ? isLight
                                    ? "#F59E0B"
                                    : COLORS.warning
                                  : isLight
                                    ? "#059669"
                                    : COLORS.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </SwipeableItem>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* Set Budget Modal with Calendar Style Background Overlay */}
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsModalOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.modalContent,
              isLight ? styles.modalContentLight : styles.modalContentDark,
              { paddingBottom: Math.max(insets.bottom, 20) + 16 },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalTitle, isLight && styles.modalTitleLight]}
              >
                Set Category Budget
              </Text>
              <Pressable
                onPress={() => setIsModalOpen(false)}
                style={styles.closeIconBtn}
              >
                <X size={20} color={isLight ? "#64748B" : COLORS.grayLight} />
              </Pressable>
            </View>

            <Text
              style={[styles.inputLabel, isLight && styles.inputLabelLight]}
            >
              Select Category
            </Text>
            <ScrollView
              style={styles.categoryChooserScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.categoryChooserContent}
            >
              <CategoryChooserGrid
                categories={expenseCategories}
                selectedCategory={selectedCategory}
                isLight={isLight}
                onSelect={(category) => setSelectedCategory(category.name)}
              />
            </ScrollView>

            <Text
              style={[styles.inputLabel, isLight && styles.inputLabelLight]}
            >
              Monthly Limit ({currency.symbol})
            </Text>
            <TextInput
              style={[styles.amountInput, isLight && styles.amountInputLight]}
              placeholder="e.g. 15000"
              placeholderTextColor={isLight ? "#94A3B8" : COLORS.grayDark}
              keyboardType="decimal-pad"
              value={limitAmount}
              onChangeText={setLimitAmount}
            />

            <Pressable
              style={[
                styles.saveBtn,
                !selectedCategory && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!selectedCategory}
            >
              <Check size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Budget</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 130,
  },
  headerRow: {
    maxWidth: 412,
    width: "100%",
    height: 56,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingTop: 0,
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  circleActionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateContainer: {
    alignItems: "center",
    marginVertical: 24,
    paddingHorizontal: 12,
  },
  emptyHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  emptyHeaderSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyIllustrationWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  budgetCircleAssetContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  budgtIconImage: {
    width: "100%",
    height: "100%",
  },
  floatingAddButton: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#012E4F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  budgetList: {
    gap: 12,
  },
  budgetItem: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  budgetItemLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
    flex: 1,
    minWidth: 0,
  },
  categoryNameLight: {
    color: "#0F172A",
  },
  itemAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 8,
  },
  spentAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
    flex: 1,
    minWidth: 0,
  },
  spentAmountLight: {
    color: "#0F172A",
  },
  limitAmount: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.grayDark,
  },
  limitAmountLight: {
    color: "#64748B",
  },
  percentBadge: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    flexShrink: 0,
  },
  percentBadgeLight: {
    color: "#059669",
  },
  itemProgressBg: {
    height: 6,
    backgroundColor: "#262626",
    borderRadius: 3,
    overflow: "hidden",
  },
  itemProgressBgLight: {
    backgroundColor: "#E2E8F0",
  },
  itemProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  modalContentLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  modalContentDark: {
    backgroundColor: "#161B22",
    borderColor: "#30363D",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  modalTitleLight: {
    color: "#0F172A",
  },
  closeIconBtn: {
    padding: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.gray,
    marginBottom: 8,
    marginTop: 8,
  },
  inputLabelLight: {
    color: "#475569",
  },
  categoryChooserScroll: {
    maxHeight: 250,
    width: "100%",
    marginBottom: 8,
  },
  categoryChooserContent: {
    paddingBottom: 8,
  },
  amountInput: {
    backgroundColor: "#141414",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  amountInputLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CBD5E1",
    color: "#0F172A",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#012E4F",
    height: 48,
    borderRadius: 12,
    gap: 8,
    width: "100%",
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default BudgetsScreen;
