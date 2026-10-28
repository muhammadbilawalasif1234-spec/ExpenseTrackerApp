import {
  ChevronLeft,
  Edit2,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DEFAULT_CATEGORIES } from "../constants/theme";
import { Category, Subcategory } from "../types";
import { CategoryIconView } from "./CategoryIconView";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { IconColorPickerModal } from "./IconColorPickerModal";

const AVAILABLE_ICONS = [
  "UtensilsCrossed",
  "Coffee",
  "Wine",
  "ShoppingBag",
  "ShoppingCart",
  "HeartPulse",
  "Bus",
  "Car",
  "Coins",
  "Smile",
  "PartyPopper",
  "Home",
  "Dumbbell",
  "Receipt",
  "Film",
  "GraduationCap",
  "Plane",
  "Banknote",
  "Briefcase",
  "Laptop",
  "Gift",
  "TrendingUp",
  "CreditCard",
];

export type CategoryScreenView =
  "list" | "add_category" | "edit_category" | "add_subcategory";

interface CategoryScreensProps {
  categories?: Category[];
  isLight: boolean;
  onBackToProfile: () => void;
  onAddCategory: (cat: Omit<Category, "id">) => Category;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
  onAddSubcategory: (categoryId: string, sub: Omit<Subcategory, "id">) => void;
  onDeleteSubcategory: (categoryId: string, subId: string) => void;
}

export const CategoryScreens: React.FC<CategoryScreensProps> = ({
  categories = DEFAULT_CATEGORIES,
  isLight,
  onBackToProfile,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddSubcategory,
  onDeleteSubcategory,
}) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get("window");
  const insets = useSafeAreaInsets();
  const [currentView, setCurrentView] = useState<CategoryScreenView>("list");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Ensure we always fallback to default categories if list is empty
  const activeCategories =
    categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  // Add Category form state
  const [newCatName, setNewCatName] = useState("Food & Drink");
  const [newCatIcon, setNewCatIcon] = useState("UtensilsCrossed");
  const [newCatColor, setNewCatColor] = useState("#F59E0B");
  const [newCatType, setNewCatType] = useState<"expense" | "income">("expense");
  const [newCatSubcategories, setNewCatSubcategories] = useState<Subcategory[]>(
    [],
  );

  // Edit Category form state
  const [editCatName, setEditCatName] = useState("");
  const [editCatIcon, setEditCatIcon] = useState("UtensilsCrossed");
  const [editCatColor, setEditCatColor] = useState("#F59E0B");
  const [editCatSubcategories, setEditCatSubcategories] = useState<
    Subcategory[]
  >([]);

  // Add Subcategory form state
  const [subName, setSubName] = useState("");
  const [subIcon, setSubIcon] = useState("UtensilsCrossed");
  const [subColor, setSubColor] = useState("#F59E0B");
  const [parentContext, setParentContext] = useState<"add" | "edit">("edit");

  // Icon & Color Picker modal state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<
    "add_cat" | "edit_cat" | "sub"
  >("add_cat");

  // Theme colors
  const bg = isLight ? "#FFFFFF" : "#0B1118";
  const textColor = isLight ? "#0F172A" : "#F8FAFC";
  const subtextColor = isLight ? "#64748B" : "#94A3B8";
  const dividerColor = isLight ? "#E2E8F0" : "#1E293B";
  const primaryButtonBg = "#2E5675";
  const deleteButtonBg = isLight ? "#FDEDED" : "rgba(239, 68, 68, 0.15)";
  const deleteButtonText = "#D9534F";

  // Sort categories so default/other categories stay at the bottom and newly added ones appear at the top
  const sortedCategories = [...activeCategories].sort((a, b) => {
    const nameA = (a.name || "").toLowerCase();
    const nameB = (b.name || "").toLowerCase();
    const isOtherA = nameA.includes("other") || nameA.includes("general");
    const isOtherB = nameB.includes("other") || nameB.includes("general");

    if (isOtherA && !isOtherB) return 1;
    if (!isOtherA && isOtherB) return -1;
    return 0;
  });

  // Navigation handlers
  const handleOpenEditCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setEditCatName(cat.name);
    setEditCatIcon(cat.icon);
    setEditCatColor(cat.color || "#F59E0B");
    setEditCatSubcategories(cat.subcategories || []);
    setErrorMessage(null);
    setCurrentView("edit_category");
  };

  const handleOpenAddCategory = () => {
    setNewCatName("");
    setNewCatIcon("UtensilsCrossed");
    setNewCatColor("#F59E0B");
    setNewCatType("expense");
    setNewCatSubcategories([]);
    setErrorMessage(null);
    setCurrentView("add_category");
  };

  const handleOpenAddSubcategory = (context: "add" | "edit") => {
    setParentContext(context);
    const parentIcon = context === "add" ? newCatIcon : editCatIcon;
    const parentCol = context === "add" ? newCatColor : editCatColor;
    setSubName("");
    setSubIcon(parentIcon);
    setSubColor(parentCol);
    setErrorMessage(null);
    setCurrentView("add_subcategory");
  };

  const handleSaveAddCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a name for the category.");
      return;
    }
    setErrorMessage(null);
    onAddCategory({
      name: trimmed,
      icon: newCatIcon,
      color: newCatColor,
      type: newCatType,
      subcategories: newCatSubcategories,
    });
    setCurrentView("list");
  };

  const handleSaveEditCategory = () => {
    if (!selectedCategory) return;
    const trimmed = editCatName.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a category name.");
      return;
    }
    setErrorMessage(null);
    onUpdateCategory(selectedCategory.id, {
      name: trimmed,
      icon: editCatIcon,
      color: editCatColor,
      subcategories: editCatSubcategories,
    });
    setCurrentView("list");
  };

  const handleDeleteCategoryPrompt = () => {
    if (!selectedCategory) return;
    setIsDeleteModalOpen(true);
  };

  const handleSaveSubcategory = () => {
    const trimmed = subName.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a name for the subcategory.");
      return;
    }
    setErrorMessage(null);

    const newSub: Subcategory = {
      id: `sub-${Date.now()}`,
      name: trimmed,
      icon: subIcon,
      color: subColor,
    };

    if (parentContext === "add") {
      setNewCatSubcategories((prev) => [...prev, newSub]);
      setCurrentView("add_category");
    } else {
      if (selectedCategory) {
        onAddSubcategory(selectedCategory.id, newSub);
        setEditCatSubcategories((prev) => [...prev, newSub]);
      }
      setCurrentView("edit_category");
    }
  };

  const handleDeleteSubcategory = (subId: string) => {
    if (parentContext === "add") {
      setNewCatSubcategories((prev) => prev.filter((s) => s.id !== subId));
    } else if (selectedCategory) {
      onDeleteSubcategory(selectedCategory.id, subId);
      setEditCatSubcategories((prev) => prev.filter((s) => s.id !== subId));
    }
  };

  const openPicker = (target: "add_cat" | "edit_cat" | "sub") => {
    setPickerTarget(target);
    setIsPickerOpen(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* 1. CATEGORIES LIST VIEW */}
      {currentView === "list" && (
        <View style={styles.contentFlex}>
          <View style={styles.categoriesHeader}>
            <Pressable
              onPress={onBackToProfile}
              style={styles.backButtonTouch}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ChevronLeft size={24} color={textColor} strokeWidth={2} />
            </Pressable>
            <Text style={[styles.mainTitle, { color: textColor }]}>
              Categories
            </Text>
          </View>
          <View
            style={[styles.headerDivider, { backgroundColor: dividerColor }]}
          />

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {sortedCategories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => handleOpenEditCategory(cat)}
                style={styles.categoryItemRow}
              >
                <CategoryIconView
                  iconName={cat.icon}
                  color={cat.color || "#F59E0B"}
                  size={22}
                  containerSize={48}
                  isLight={isLight}
                />
                <Text style={[styles.categoryItemName, { color: textColor }]}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}

            <Pressable
              onPress={handleOpenAddCategory}
              style={styles.addCategoryRow}
            >
              <View style={styles.addPlusIconBox}>
                <Plus size={22} color={textColor} strokeWidth={2} />
              </View>
              <Text style={[styles.addCategoryRowText, { color: textColor }]}>
                Add New Category
              </Text>
            </Pressable>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      )}

      {/* 2. ADD CATEGORY VIEW */}
      {currentView === "add_category" && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          style={styles.contentFlex}
        >
          <View style={styles.categoriesHeader}>
            <Pressable
              onPress={() => setCurrentView("list")}
              style={styles.backButtonTouch}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ChevronLeft size={24} color={textColor} strokeWidth={2} />
            </Pressable>
            <Text style={[styles.mainTitle, { color: textColor }]}>
              Add Category
            </Text>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[
              styles.formContentContainer,
              { paddingBottom: 30 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {errorMessage && (
              <View style={styles.errorBox}>
                <ShieldAlert size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.formRow}>
              <Text style={[styles.formRowLabel, { color: textColor }]}>
                Type
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 6,
                  backgroundColor: isLight ? "#F1F5F9" : "#1E293B",
                  borderRadius: 10,
                  padding: 3,
                }}
              >
                <Pressable
                  onPress={() => setNewCatType("expense")}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor:
                      newCatType === "expense"
                        ? isLight
                          ? "#FFFFFF"
                          : "#0F172A"
                        : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: newCatType === "expense" ? "700" : "500",
                      color:
                        newCatType === "expense" ? "#EF4444" : subtextColor,
                    }}
                  >
                    Expense
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setNewCatType("income")}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor:
                      newCatType === "income"
                        ? isLight
                          ? "#FFFFFF"
                          : "#0F172A"
                        : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: newCatType === "income" ? "700" : "500",
                      color: newCatType === "income" ? "#10B981" : subtextColor,
                    }}
                  >
                    Income
                  </Text>
                </Pressable>
              </View>
            </View>

            <View
              style={[styles.rowDivider, { backgroundColor: dividerColor }]}
            />

            <Pressable
              onPress={() => openPicker("add_cat")}
              style={styles.formRow}
            >
              <Text style={[styles.formRowLabel, { color: textColor }]}>
                Icon
              </Text>
              <View style={styles.iconWithBadgeWrapper}>
                <CategoryIconView
                  iconName={newCatIcon}
                  color={newCatColor}
                  size={22}
                  containerSize={44}
                  isLight={isLight}
                />
                <View
                  style={[
                    styles.pencilBadge,
                    { backgroundColor: isLight ? "#E2E8F0" : "#334155" },
                  ]}
                >
                  <Edit2
                    size={10}
                    color={isLight ? "#475569" : "#CBD5E1"}
                    strokeWidth={2.2}
                  />
                </View>
              </View>
            </Pressable>

            <View style={styles.formRow}>
              <Text style={[styles.formRowLabel, { color: textColor }]}>
                Name
              </Text>
              <View style={styles.editableNameWrapper}>
                <TextInput
                  value={newCatName}
                  onChangeText={setNewCatName}
                  placeholder="Category Name"
                  placeholderTextColor={subtextColor}
                  style={[styles.editableTextInput, { color: textColor }]}
                />
                <Edit2
                  size={14}
                  color={subtextColor}
                  strokeWidth={2}
                  style={{ marginLeft: 6 }}
                />
              </View>
            </View>

            <View
              style={[styles.rowDivider, { backgroundColor: dividerColor }]}
            />

            {newCatSubcategories.map((sub) => (
              <View key={sub.id} style={styles.subItemRow}>
                <View style={styles.subItemLeft}>
                  <CategoryIconView
                    iconName={sub.icon || newCatIcon}
                    color={newCatColor}
                    size={20}
                    containerSize={42}
                    isLight={isLight}
                  />
                  <Text style={[styles.subItemName, { color: textColor }]}>
                    {sub.name}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDeleteSubcategory(sub.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={16} color="#EF4444" strokeWidth={1.8} />
                </Pressable>
              </View>
            ))}

            <Pressable
              onPress={() => handleOpenAddSubcategory("add")}
              style={styles.addSubRow}
            >
              <View
                style={[
                  styles.softGreyPlusCircle,
                  {
                    backgroundColor: isLight ? "#FFFFFF" : "#1E293B",
                    borderWidth: isLight ? 1 : 0,
                    borderColor: "#E2E8F0",
                  },
                ]}
              >
                <Plus size={18} color={textColor} strokeWidth={2} />
              </View>
              <Text style={[styles.addSubRowText, { color: textColor }]}>
                Add New Subcategory
              </Text>
            </Pressable>
          </ScrollView>

          <View
            style={[
              styles.bottomButtonContainer,
              { paddingBottom: Math.max(insets.bottom, 24) + 20 },
            ]}
          >
            <Pressable
              onPress={handleSaveAddCategory}
              style={[
                styles.primaryActionBtn,
                { backgroundColor: primaryButtonBg },
              ]}
            >
              <Text style={styles.primaryActionBtnText}>Add Category</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* 3. EDIT CATEGORY VIEW */}
      {currentView === "edit_category" && selectedCategory && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          style={styles.contentFlex}
        >
          <View style={styles.categoriesHeader}>
            <Pressable
              onPress={() => setCurrentView("list")}
              style={styles.backButtonTouch}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ChevronLeft size={24} color={textColor} strokeWidth={2} />
            </Pressable>
            <Text style={[styles.mainTitle, { color: textColor }]}>
              Edit Category
            </Text>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[
              styles.formContentContainer,
              { paddingBottom: 30 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {errorMessage && (
              <View style={styles.errorBox}>
                <ShieldAlert size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <Pressable
              onPress={() => openPicker("edit_cat")}
              style={styles.formRow}
            >
              <Text style={[styles.formRowLabel, { color: textColor }]}>
                Icon
              </Text>
              <View style={styles.iconWithBadgeWrapper}>
                <CategoryIconView
                  iconName={editCatIcon}
                  color={editCatColor}
                  size={22}
                  containerSize={44}
                  isLight={isLight}
                />
                <View
                  style={[
                    styles.pencilBadge,
                    { backgroundColor: isLight ? "#E2E8F0" : "#334155" },
                  ]}
                >
                  <Edit2
                    size={10}
                    color={isLight ? "#475569" : "#CBD5E1"}
                    strokeWidth={2.2}
                  />
                </View>
              </View>
            </Pressable>

            <View style={styles.formRow}>
              <Text style={[styles.formRowLabel, { color: textColor }]}>
                Name
              </Text>
              <View style={styles.editableNameWrapper}>
                <TextInput
                  value={editCatName}
                  onChangeText={setEditCatName}
                  placeholder="Category Name"
                  placeholderTextColor={subtextColor}
                  style={[styles.editableTextInput, { color: textColor }]}
                />
                <Edit2
                  size={14}
                  color={subtextColor}
                  strokeWidth={2}
                  style={{ marginLeft: 6 }}
                />
              </View>
            </View>

            <View
              style={[styles.rowDivider, { backgroundColor: dividerColor }]}
            />

            {editCatSubcategories.map((sub) => (
              <View key={sub.id} style={styles.subItemRow}>
                <View style={styles.subItemLeft}>
                  <CategoryIconView
                    iconName={sub.icon || editCatIcon}
                    color={editCatColor}
                    size={20}
                    containerSize={42}
                    isLight={isLight}
                  />
                  <Text style={[styles.subItemName, { color: textColor }]}>
                    {sub.name}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDeleteSubcategory(sub.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={16} color="#EF4444" strokeWidth={1.8} />
                </Pressable>
              </View>
            ))}

            <Pressable
              onPress={() => handleOpenAddSubcategory("edit")}
              style={styles.addSubRow}
            >
              <View
                style={[
                  styles.softGreyPlusCircle,
                  {
                    backgroundColor: isLight ? "#FFFFFF" : "#1E293B",
                    borderWidth: isLight ? 1 : 0,
                    borderColor: "#E2E8F0",
                  },
                ]}
              >
                <Plus size={18} color={textColor} strokeWidth={2} />
              </View>
              <Text style={[styles.addSubRowText, { color: textColor }]}>
                Add New Subcategory
              </Text>
            </Pressable>
          </ScrollView>

          <View
            style={[
              styles.bottomButtonsStack,
              { paddingBottom: Math.max(insets.bottom, 24) + 20 },
            ]}
          >
            <Pressable
              onPress={handleDeleteCategoryPrompt}
              style={[
                styles.deleteActionBtn,
                { backgroundColor: deleteButtonBg },
              ]}
            >
              <Text
                style={[
                  styles.deleteActionBtnText,
                  { color: deleteButtonText },
                ]}
              >
                Delete Category
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSaveEditCategory}
              style={[
                styles.primaryActionBtn,
                { backgroundColor: primaryButtonBg },
              ]}
            >
              <Text style={styles.primaryActionBtnText}>Save</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* 4. ADD SUBCATEGORY VIEW */}
      {currentView === "add_subcategory" && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          style={styles.contentFlex}
        >
          <View style={styles.categoriesHeader}>
            <Pressable
              onPress={() =>
                setCurrentView(
                  parentContext === "add" ? "add_category" : "edit_category",
                )
              }
              style={styles.backButtonTouch}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ChevronLeft size={24} color={textColor} strokeWidth={2} />
            </Pressable>
            <Text style={[styles.mainTitle, { color: textColor }]}>
              Add Subcategory
            </Text>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[
              styles.formContentContainer,
              { flexGrow: 1, paddingBottom: 120 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {errorMessage && (
              <View style={styles.errorBox}>
                <ShieldAlert size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <Pressable onPress={() => openPicker("sub")} style={styles.formRow}>
              <Text style={[styles.formRowLabel, { color: textColor }]}>
                Icon
              </Text>
              <View style={styles.iconWithBadgeWrapper}>
                <CategoryIconView
                  iconName={subIcon}
                  color={subColor}
                  size={22}
                  containerSize={44}
                  isLight={isLight}
                />
                <View
                  style={[
                    styles.pencilBadge,
                    { backgroundColor: isLight ? "#E2E8F0" : "#334155" },
                  ]}
                >
                  <Edit2
                    size={10}
                    color={isLight ? "#475569" : "#CBD5E1"}
                    strokeWidth={2.2}
                  />
                </View>
              </View>
            </Pressable>

            <View style={styles.formRow}>
              <Text style={[styles.formRowLabel, { color: textColor }]}>
                Name
              </Text>
              <View style={styles.editableNameWrapper}>
                <TextInput
                  value={subName}
                  onChangeText={setSubName}
                  placeholder="Subcategory Name"
                  placeholderTextColor={subtextColor}
                  style={[styles.editableTextInput, { color: textColor }]}
                  autoFocus
                />
                <Edit2
                  size={14}
                  color={subtextColor}
                  strokeWidth={2}
                  style={{ marginLeft: 6 }}
                />
              </View>
            </View>

            <View
              style={[styles.rowDivider, { backgroundColor: dividerColor }]}
            />
          </ScrollView>

          <View
            style={[
              styles.bottomButtonContainer,
              { paddingBottom: Math.max(insets.bottom, 24) + 20 },
            ]}
          >
            <Pressable
              onPress={handleSaveSubcategory}
              style={[
                styles.primaryActionBtn,
                { backgroundColor: primaryButtonBg },
              ]}
            >
              <Text style={styles.primaryActionBtnText}>Add Subcategory</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ICON & COLOR PICKER MODAL */}
      <IconColorPickerModal
        visible={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedIcon={
          pickerTarget === "add_cat"
            ? newCatIcon
            : pickerTarget === "edit_cat"
              ? editCatIcon
              : subIcon
        }
        selectedColor={
          pickerTarget === "add_cat"
            ? newCatColor
            : pickerTarget === "edit_cat"
              ? editCatColor
              : subColor
        }
        onSelectIcon={(icon) => {
          if (pickerTarget === "add_cat") setNewCatIcon(icon);
          else if (pickerTarget === "edit_cat") setEditCatIcon(icon);
          else setSubIcon(icon);
        }}
        onSelectColor={(color) => {
          if (pickerTarget === "add_cat") setNewCatColor(color);
          else if (pickerTarget === "edit_cat") setEditCatColor(color);
          else setSubColor(color);
        }}
        isLight={isLight}
        availableIcons={AVAILABLE_ICONS}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        visible={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (selectedCategory) {
            onDeleteCategory(selectedCategory.id);
            setIsDeleteModalOpen(false);
            setCurrentView("list");
          }
        }}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.name || ""}"? This action cannot be undone.`}
        isLight={isLight}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentFlex: { flex: 1 },
  scrollArea: { flex: 1 },
  categoriesHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  backButtonTouch: { padding: 4, marginLeft: -6 },
  mainTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    fontFamily: Platform.OS === "ios" ? "Poppins" : "sans-serif",
  },
  headerDivider: { height: 1, width: "100%" },
  listContentContainer: { paddingHorizontal: 22, paddingTop: 8 },
  categoryItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 16,
  },
  categoryItemName: { fontSize: 15, fontWeight: "400", letterSpacing: -0.1 },
  addCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 16,
  },
  addPlusIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  addCategoryRowText: { fontSize: 15, fontWeight: "500", letterSpacing: -0.1 },
  formContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  formRowLabel: { fontSize: 15, fontWeight: "400", letterSpacing: -0.1 },
  iconWithBadgeWrapper: { position: "relative" },
  pencilBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  editableNameWrapper: { flexDirection: "row", alignItems: "center" },
  editableTextInput: {
    fontSize: 15,
    fontWeight: "400",
    textAlign: "right",
    paddingVertical: 4,
    paddingHorizontal: 6,
    minWidth: 100,
  },
  rowDivider: { height: 1, marginVertical: 12 },
  subItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  subItemLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  subItemName: { fontSize: 15, fontWeight: "400" },
  addSubRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  softGreyPlusCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  addSubRowText: { fontSize: 15, fontWeight: "400" },
  bottomButtonContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  bottomButtonsStack: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 10,
  },
  primaryActionBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryActionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  deleteActionBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  deleteActionBtnText: { fontSize: 15, fontWeight: "700", letterSpacing: -0.1 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginBottom: 12,
  },
  errorText: { color: "#DC2626", fontSize: 13, fontWeight: "600", flex: 1 },
});

export default CategoryScreens;
