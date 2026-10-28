import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import {
  Camera,
  Check,
  ChevronRight,
  Image as ImageIcon,
  Plus,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  Modal,
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
import {
  Category,
  Currency,
  Subcategory,
  ThemeMode,
  UserProfile,
} from "../types";
import { CategoryScreens } from "./CategoryScreens";
import { CurrencyLockedModal } from "./CurrencyLockedModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80",
];

interface ProfileScreenProps {
  profile: UserProfile;
  updateProfile: (partial: Partial<UserProfile>) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  resolvedTheme: "dark" | "light";
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  onNavigateAccounts: () => void;
  onOpenCategories?: () => void;
  onOpenSettings?: () => void;
  isLight?: boolean;
  categories?: Category[];
  onAddCategory?: (cat: Omit<Category, "id">) => Category;
  onUpdateCategory?: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory?: (id: string) => void;
  onAddSubcategory?: (categoryId: string, sub: Omit<Subcategory, "id">) => void;
  onDeleteSubcategory?: (categoryId: string, subId: string) => void;
  onClearAllData?: () => void;
  onReplayOnboarding?: () => void;
  showOnlySettings?: boolean;
  onBack?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  updateProfile,
  themeMode,
  setThemeMode,
  resolvedTheme,
  currency,
  setCurrency,
  onNavigateAccounts,
  onOpenCategories,
  onOpenSettings,
  isLight = true,
  categories = DEFAULT_CATEGORIES,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddSubcategory,
  onDeleteSubcategory,
  onClearAllData,
  onReplayOnboarding,
  showOnlySettings = false,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState(profile?.firstName || "");
  const [lastName, setLastName] = useState(profile?.lastName || "");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [errorBannerMsg, setErrorBannerMsg] = useState<string | null>(null);
  const [isDeleteNameModalOpen, setIsDeleteNameModalOpen] = useState(false);

  const firstNameInputRef = useRef<TextInput>(null);
  const lastNameInputRef = useRef<TextInput>(null);
  const [isCurrencyLockedModalOpen, setIsCurrencyLockedModalOpen] =
    useState(false);
  const [isImagePickerModalOpen, setIsImagePickerModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isViewingCategoriesFlow, setIsViewingCategoriesFlow] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "expense" | "income"
  >("all");
  const [customImageUrl, setCustomImageUrl] = useState("");

  useEffect(() => {
    async function checkPendingResult() {
      if (Platform.OS === "android") {
        try {
          const pendingResult = await ImagePicker.getPendingResultAsync();
          if (Array.isArray(pendingResult)) {
            // handle array result safely
          } else if (
            pendingResult &&
            !(pendingResult as any).canceled &&
            (pendingResult as any).assets?.[0]
          ) {
            await savePickedImage((pendingResult as any).assets[0]);
          }
        } catch (e) {
          console.log("Error checking pending image result:", e);
        }
      }
    }
    checkPendingResult();
  }, []);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
    }
  }, [profile?.firstName, profile?.lastName]);

  const hasSavedName = Boolean(
    (profile?.firstName || "").trim() || (profile?.lastName || "").trim(),
  );
  const hasChanges =
    firstName.trim() !== (profile?.firstName || "").trim() ||
    lastName.trim() !== (profile?.lastName || "").trim();
  const canSave =
    hasChanges && (firstName.trim().length > 0 || lastName.trim().length > 0);
  const isNameSaved = hasSavedName && !hasChanges;
  const savedNameTextColor = isLight ? "#475569" : "#CBD5E1";

  const handleSaveUserName = () => {
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    if (!cleanFirst && !cleanLast) return;

    firstNameInputRef.current?.blur();
    lastNameInputRef.current?.blur();
    Keyboard.dismiss();
    updateProfile({ firstName: cleanFirst, lastName: cleanLast });

    setSaveSuccessMsg("Name saved successfully!");
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  const handleClearSavedName = () => {
    setIsDeleteNameModalOpen(true);
  };

  const savePickedImage = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!asset.uri)
      throw new Error("The selected image does not have a valid file URI.");
    if (Platform.OS === "web" && asset.base64) {
      updateProfile({
        avatarUrl: `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`,
      });
      setIsImagePickerModalOpen(false);
      return;
    }
    updateProfile({ avatarUrl: asset.uri });
    setIsImagePickerModalOpen(false);
  };

  const handlePickLocalImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const permission = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          const requestedPermission = permission.canAskAgain
            ? await ImagePicker.requestMediaLibraryPermissionsAsync()
            : permission;
          if (!requestedPermission.granted) {
            setErrorBannerMsg(
              "Allow Spendly to access photos in device settings.",
            );
            return;
          }
        }
      }
      setErrorBannerMsg(null);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: Platform.OS === "web",
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await savePickedImage(result.assets[0]);
      }
    } catch (error) {
      setErrorBannerMsg(
        error instanceof Error
          ? error.message
          : "Could not open the photo gallery.",
      );
    }
  };

  const handleTakePhoto = async () => {
    try {
      if (Platform.OS !== "web") {
        const currentPermission = await ImagePicker.getCameraPermissionsAsync();
        const permissionResult =
          currentPermission.granted || !currentPermission.canAskAgain
            ? currentPermission
            : await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          setErrorBannerMsg(
            "Allow Spendly to access your camera in device Settings.",
          );
          return;
        }
      }
      setErrorBannerMsg(null);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: Platform.OS === "web",
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await savePickedImage(result.assets[0]);
      }
    } catch (error) {
      setErrorBannerMsg(
        error instanceof Error ? error.message : "Could not open the camera.",
      );
    }
  };

  const handleSelectPresetAvatar = (url: string) => {
    updateProfile({ avatarUrl: url });
    setIsImagePickerModalOpen(false);
  };

  const handleApplyCustomUrl = () => {
    if (customImageUrl.trim()) {
      updateProfile({ avatarUrl: customImageUrl.trim() });
      setCustomImageUrl("");
      setIsImagePickerModalOpen(false);
    }
  };

  const handleRemoveAvatar = () => {
    updateProfile({ avatarUrl: null });
    setIsImagePickerModalOpen(false);
  };

  const bgScreen = isLight ? "#FFFFFF" : "#0B1118";
  const cardBg = isLight ? "rgba(237, 237, 237, 0.4)" : "#161B22";
  const cardBorder = isLight ? "#E2E8F0" : "#30363D";
  const inputBg = isLight ? "#FFFFFF" : "#0D1520";
  const inputBorder = isLight ? "#E2E8F0" : "#2D3A4B";
  const titleColor = isLight ? "#012E4F" : "#F1F5F9";
  const labelColor = isLight ? "#475569" : "#94A3B8";
  const textColor = isLight ? "#1E293B" : "#E2E8F0";
  const placeholderColor = isLight ? "#475569" : "#94A3B8";

  if (isViewingCategoriesFlow) {
    return (
      <CategoryScreens
        categories={categories}
        isLight={isLight}
        onBackToProfile={() => setIsViewingCategoriesFlow(false)}
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
    <View style={[styles.container, { backgroundColor: bgScreen }]}>
      <View style={[styles.fixedTopContainer, { backgroundColor: bgScreen }]}>
        <View
          style={[
            styles.titleSection,
            {
              borderBottomColor: isLight ? "#E2E8F0" : "#30363D",
              backgroundColor: bgScreen,
            },
          ]}
        >
          <View style={{ height: 38, justifyContent: "center", paddingTop: 8 }}>
            <Text style={[styles.screenTitle, { color: titleColor }]}>
              {showOnlySettings ? "Settings" : "Profile"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: bgScreen }]}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {!showOnlySettings && (
          <>
            <View style={styles.profilePictureBox}>
              <View
                style={{
                  position: "relative",
                  alignSelf: "center",
                  width: 120,
                  height: 120,
                }}
              >
                <Pressable
                  onPress={() => setIsImagePickerModalOpen(true)}
                  style={[
                    styles.profilePictureShape,
                    {
                      backgroundColor: isLight ? "#F0F4FA" : "#1E293B",
                      borderColor: isLight ? "#E2E8F0" : "#334155",
                    },
                  ]}
                >
                  {profile?.avatarUrl ? (
                    <Image
                      source={{ uri: profile.avatarUrl }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <UserIcon size={52} color="#94A3B8" strokeWidth={1.3} />
                  )}
                </Pressable>
                <Pressable
                  onPress={() => setIsImagePickerModalOpen(true)}
                  style={styles.addAvatarButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <LinearGradient
                    colors={["#012E4F", "#2E6B8A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Plus size={23} color="#FFFFFF" strokeWidth={2.2} />
                </Pressable>
              </View>
            </View>

            <View
              style={[
                styles.card,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === "ios" ? "Poppins" : "sans-serif",
                    fontWeight: "600",
                    fontSize: 20,
                    color: titleColor,
                  }}
                >
                  Change user name
                </Text>
                {hasSavedName && (
                  <Pressable
                    onPress={handleClearSavedName}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: isLight
                        ? "#FEE2E2"
                        : "rgba(239, 68, 68, 0.15)",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: isLight
                        ? "#FCA5A5"
                        : "rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    <Trash2 size={14} color="#EF4444" strokeWidth={2.2} />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: "#EF4444",
                      }}
                    >
                      Delete
                    </Text>
                  </Pressable>
                )}
              </View>

              <View style={{ gap: 12, marginBottom: 16 }}>
                <View>
                  <Text
                    style={[
                      styles.inputLabel,
                      {
                        color: labelColor,
                        fontSize: 12.5,
                        fontWeight: "600",
                        marginBottom: 6,
                      },
                    ]}
                  >
                    First Name
                  </Text>
                  <TextInput
                    ref={firstNameInputRef}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder={profile?.firstName || "Enter First Name"}
                    placeholderTextColor={placeholderColor}
                    style={[
                      styles.input,
                      {
                        backgroundColor: isNameSaved
                          ? isLight
                            ? "#F0FDF4"
                            : "rgba(16, 185, 129, 0.12)"
                          : inputBg,
                        borderColor: isNameSaved ? "#10B981" : inputBorder,
                        color: isNameSaved ? savedNameTextColor : textColor,
                        fontSize: 14.5,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 11,
                      },
                    ]}
                  />
                </View>
                <View>
                  <Text
                    style={[
                      styles.inputLabel,
                      {
                        color: labelColor,
                        fontSize: 12.5,
                        fontWeight: "600",
                        marginBottom: 6,
                      },
                    ]}
                  >
                    Last Name
                  </Text>
                  <TextInput
                    ref={lastNameInputRef}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder={profile?.lastName || "Enter Last Name"}
                    placeholderTextColor={placeholderColor}
                    style={[
                      styles.input,
                      {
                        backgroundColor: isNameSaved
                          ? isLight
                            ? "#F0FDF4"
                            : "rgba(16, 185, 129, 0.12)"
                          : inputBg,
                        borderColor: isNameSaved ? "#10B981" : inputBorder,
                        color: isNameSaved ? savedNameTextColor : textColor,
                        fontSize: 14.5,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 11,
                      },
                    ]}
                  />
                </View>
              </View>

              {hasChanges && (
                <View style={{ gap: 10, marginTop: 4 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Pressable
                      onPress={handleSaveUserName}
                      disabled={!canSave}
                      style={{
                        backgroundColor: canSave
                          ? isLight
                            ? "#012E4F"
                            : "#4A6984"
                          : isLight
                            ? "#CBD5E1"
                            : "#334155",
                        paddingHorizontal: 18,
                        paddingVertical: 10,
                        borderRadius: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Check
                        size={15}
                        color={canSave ? "#FFFFFF" : "#94A3B8"}
                        strokeWidth={2.4}
                      />
                      <Text
                        style={{
                          fontSize: 13.5,
                          fontWeight: "700",
                          color: canSave ? "#FFFFFF" : "#94A3B8",
                        }}
                      >
                        Save Changes
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setFirstName(profile?.firstName || "");
                        setLastName(profile?.lastName || "");
                      }}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: isLight ? "#E2E8F0" : "#334155",
                        backgroundColor: isLight ? "#F8FAFC" : "#1E293B",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: labelColor,
                        }}
                      >
                        Cancel
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {saveSuccessMsg ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: isLight
                      ? "#ECFDF5"
                      : "rgba(16, 185, 129, 0.15)",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: isLight
                      ? "#A7F3D0"
                      : "rgba(16, 185, 129, 0.3)",
                    width: "100%",
                    marginTop: 10,
                  }}
                >
                  <Check size={13} color="#10B981" strokeWidth={2.5} />
                  <Text
                    style={{
                      fontSize: 12.5,
                      color: "#10B981",
                      fontWeight: "600",
                      flex: 1,
                    }}
                  >
                    {saveSuccessMsg}
                  </Text>
                </View>
              ) : null}
            </View>
          </>
        )}

        <View
          style={[
            styles.themeCard,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <View style={styles.themeTitleContainer}>
            <Text style={[styles.themeTitleText, { color: titleColor }]}>
              Theme
            </Text>
          </View>
          <View style={styles.themeTabsRow}>
            <Pressable
              onPress={() => setThemeMode("default")}
              style={[
                styles.singleTab,
                themeMode === "default"
                  ? styles.singleTabActive
                  : [
                      styles.singleTabInactive,
                      {
                        backgroundColor: isLight ? "#FFFFFF" : "#0D1117",
                        borderColor: isLight ? "#E2E8F0" : "#30363D",
                      },
                    ],
              ]}
            >
              <Text
                style={[
                  styles.singleTabText,
                  themeMode === "default"
                    ? styles.singleTabTextActive
                    : [styles.singleTabTextInactive, { color: textColor }],
                ]}
                numberOfLines={1}
              >
                System
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setThemeMode("light")}
              style={[
                styles.singleTab,
                themeMode === "light"
                  ? styles.singleTabActive
                  : [
                      styles.singleTabInactive,
                      {
                        backgroundColor: isLight ? "#FFFFFF" : "#0D1117",
                        borderColor: isLight ? "#E2E8F0" : "#30363D",
                      },
                    ],
              ]}
            >
              <Text
                style={[
                  styles.singleTabText,
                  themeMode === "light"
                    ? styles.singleTabTextActive
                    : [styles.singleTabTextInactive, { color: textColor }],
                ]}
                numberOfLines={1}
              >
                Light
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setThemeMode("dark")}
              style={[
                styles.singleTab,
                themeMode === "dark"
                  ? styles.singleTabActive
                  : [
                      styles.singleTabInactive,
                      {
                        backgroundColor: isLight ? "#FFFFFF" : "#0D1117",
                        borderColor: isLight ? "#E2E8F0" : "#30363D",
                      },
                    ],
              ]}
            >
              <Text
                style={[
                  styles.singleTabText,
                  themeMode === "dark"
                    ? styles.singleTabTextActive
                    : [styles.singleTabTextInactive, { color: textColor }],
                ]}
                numberOfLines={1}
              >
                Dark
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={() => {
            if (onOpenSettings) {
              onOpenSettings();
            }
          }}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: cardBg,
              borderColor: cardBorder,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 18,
              opacity: pressed ? 0.92 : 1,
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              flex: 1,
              minWidth: 0,
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: isLight ? "#012E4F" : "#38BDF8",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SlidersHorizontal
                size={18}
                color={isLight ? "#FFFFFF" : "#0B1118"}
                strokeWidth={2}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontSize: 15.5,
                  fontWeight: "700",
                  color: titleColor,
                  marginBottom: 2,
                  fontFamily: Platform.OS === "ios" ? "Poppins" : "sans-serif",
                }}
                numberOfLines={1}
              >
                App Settings & Preferences
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: labelColor,
                  fontWeight: "500",
                }}
                numberOfLines={1}
              >
                Currency, categories, theme, and data controls
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={isLight ? "#94A3B8" : "#64748B"} />
        </Pressable>
      </ScrollView>

      <CurrencyLockedModal
        visible={isCurrencyLockedModalOpen}
        currency={currency}
        onClose={() => setIsCurrencyLockedModalOpen(false)}
        isLight={isLight}
      />

      <DeleteConfirmModal
        visible={isDeleteNameModalOpen}
        onClose={() => setIsDeleteNameModalOpen(false)}
        onConfirm={() => {
          updateProfile({ firstName: "", lastName: "" });
          setFirstName("");
          setLastName("");
          setSaveSuccessMsg("Profile name removed");
          setTimeout(() => setSaveSuccessMsg(""), 2500);
          setIsDeleteNameModalOpen(false);
        }}
        title="Remove Saved Name"
        message="Are you sure you want to remove your saved profile name?"
        isLight={isLight}
      />

      <Modal
        visible={isImagePickerModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsImagePickerModalOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsImagePickerModalOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            onStartShouldSetResponder={() => true}
            style={[
              styles.modalCard,
              {
                backgroundColor: isLight ? "#FFFFFF" : "#1E293B",
                borderColor: isLight ? "#F1F5F9" : "#334155",
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: isLight ? "#0F172A" : "#F8FAFC" },
                ]}
              >
                Profile Picture
              </Text>
              <Pressable
                onPress={() => setIsImagePickerModalOpen(false)}
                style={styles.closeBtn}
              >
                <X size={18} color={isLight ? "#64748B" : "#94A3B8"} />
              </Pressable>
            </View>

            {errorBannerMsg && (
              <View style={styles.errorBox}>
                <ShieldAlert size={15} color="#EF4444" />
                <Text style={styles.errorText}>{errorBannerMsg}</Text>
              </View>
            )}

            <Text
              style={{
                fontSize: 13,
                color: isLight ? "#64748B" : "#94A3B8",
                marginBottom: 12,
              }}
            >
              Choose a photo for your profile:
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
              <Pressable
                onPress={handlePickLocalImage}
                style={{
                  flex: 1,
                  backgroundColor: isLight ? "#012E4F" : "#4A6984",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <ImageIcon size={16} color="#FFFFFF" />
                <Text
                  style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "600" }}
                >
                  Local Gallery
                </Text>
              </Pressable>
              <Pressable
                onPress={handleTakePhoto}
                style={{
                  flex: 1,
                  backgroundColor: isLight ? "#0284C7" : "#0369A1",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Camera size={16} color="#FFFFFF" />
                <Text
                  style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "600" }}
                >
                  Take Photo
                </Text>
              </Pressable>
            </View>

            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: isLight ? "#475569" : "#94A3B8",
                marginBottom: 8,
              }}
            >
              Or choose from preset avatars:
            </Text>
            <View style={styles.presetsGrid}>
              {PRESET_AVATARS.map((url, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleSelectPresetAvatar(url)}
                  style={[
                    styles.presetItem,
                    profile.avatarUrl === url && {
                      borderColor: "#012E4F",
                      borderWidth: 2.5,
                    },
                  ]}
                >
                  <Image source={{ uri: url }} style={styles.presetImage} />
                </Pressable>
              ))}
            </View>

            <View style={{ marginTop: 14 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: isLight ? "#64748B" : "#94A3B8",
                  marginBottom: 6,
                }}
              >
                Or enter image URL:
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                  value={customImageUrl}
                  onChangeText={setCustomImageUrl}
                  placeholder="https://example.com/avatar.jpg"
                  placeholderTextColor={placeholderColor}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[
                    styles.input,
                    {
                      flex: 1,
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: textColor,
                      paddingVertical: 8,
                      fontSize: 13,
                    },
                  ]}
                />
                <Pressable
                  onPress={handleApplyCustomUrl}
                  disabled={!customImageUrl.trim()}
                  style={{
                    backgroundColor: customImageUrl.trim()
                      ? isLight
                        ? "#012E4F"
                        : "#4A6984"
                      : isLight
                        ? "#CBD5E1"
                        : "#334155",
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    Apply
                  </Text>
                </Pressable>
              </View>

              {profile.avatarUrl && (
                <Pressable
                  onPress={handleRemoveAvatar}
                  style={{
                    marginTop: 12,
                    paddingVertical: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 6,
                  }}
                >
                  <Trash2 size={14} color="#EF4444" />
                  <Text
                    style={{
                      color: "#EF4444",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    Remove Current Photo
                  </Text>
                </Pressable>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  contentContainer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 28 },
  fixedTopContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingTop: 0,
    zIndex: 10,
    marginBottom: 16,
  },
  titleSection: {
    maxWidth: 412,
    width: "100%",
    height: 56,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    gap: 10,
  },
  screenTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  profilePictureBox: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 16,
    position: "relative",
  },
  profilePictureShape: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: "100%", height: "100%" },
  addAvatarButton: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: 412,
    alignSelf: "center",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginTop: 14,
  },
  themeCard: {
    width: "100%",
    maxWidth: 412,
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    paddingRight: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    gap: 10,
    alignSelf: "center",
    justifyContent: "flex-start",
    marginTop: 14,
  },
  themeTitleContainer: {
    width: "100%",
    height: 53,
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: "center",
  },
  themeTitleText: { fontSize: 22, fontWeight: "600", letterSpacing: -0.4 },
  themeTabsRow: {
    width: "100%",
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  singleTab: {
    flex: 1,
    height: 42,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  singleTabActive: { backgroundColor: "#537287" },
  singleTabInactive: { borderWidth: 1 },
  singleTabText: { fontSize: 14, textAlign: "center" },
  singleTabTextActive: { color: "#FFFFFF", fontWeight: "500" },
  singleTabTextInactive: { fontWeight: "400" },
  inputLabel: { fontSize: 13, fontWeight: "400", marginBottom: 6 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "400",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalTitle: { fontSize: 16, fontWeight: "500" },
  closeBtn: { padding: 4 },
  presetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginVertical: 8,
  },
  presetItem: {
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#CBD5E1",
  },
  presetImage: { width: 50, height: 50 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginBottom: 10,
  },
  errorText: { color: "#DC2626", fontSize: 12, fontWeight: "600", flex: 1 },
});

export default ProfileScreen;
