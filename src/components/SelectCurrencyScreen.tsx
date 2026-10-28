import React, { useState, useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Coins,
  Search,
  X,
  Check,
  Globe,
  ArrowRight,
} from "lucide-react-native";
import { Currency } from "../types";

export const WORLD_CURRENCIES: (Currency & {
  country: string;
  flagEmoji: string;
})[] = [
  {
    code: "PKR",
    symbol: "Rs ",
    name: "Pakistani Rupees",
    country: "Pakistan",
    position: "prefix",
    flagEmoji: "🇵🇰",
  },
  {
    code: "USD",
    symbol: "$",
    name: "United States Dollar",
    country: "United States",
    position: "prefix",
    flagEmoji: "🇺🇸",
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    country: "European Union",
    position: "prefix",
    flagEmoji: "🇪🇺",
  },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound Sterling",
    country: "United Kingdom",
    position: "prefix",
    flagEmoji: "🇬🇧",
  },
  {
    code: "AED",
    symbol: "AED ",
    name: "UAE Dirham",
    country: "United Arab Emirates",
    position: "prefix",
    flagEmoji: "🇦🇪",
  },
  {
    code: "SAR",
    symbol: "SAR ",
    name: "Saudi Riyal",
    country: "Saudi Arabia",
    position: "prefix",
    flagEmoji: "🇸🇦",
  },
  {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    country: "India",
    position: "prefix",
    flagEmoji: "🇮🇳",
  },
  {
    code: "CAD",
    symbol: "CA$",
    name: "Canadian Dollar",
    country: "Canada",
    position: "prefix",
    flagEmoji: "🇨🇦",
  },
  {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    country: "Australia",
    position: "prefix",
    flagEmoji: "🇦🇺",
  },
  {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen (日本語)",
    country: "Japan",
    position: "prefix",
    flagEmoji: "🇯🇵",
  },
  {
    code: "CNY",
    symbol: "¥",
    name: "Chinese Yuan",
    country: "China",
    position: "prefix",
    flagEmoji: "🇨🇳",
  },
  {
    code: "SGD",
    symbol: "S$",
    name: "Singapore Dollar",
    country: "Singapore",
    position: "prefix",
    flagEmoji: "🇸🇬",
  },
  {
    code: "QAR",
    symbol: "QR ",
    name: "Qatari Riyal",
    country: "Qatar",
    position: "prefix",
    flagEmoji: "🇶🇦",
  },
  {
    code: "KWD",
    symbol: "KD ",
    name: "Kuwaiti Dinar",
    country: "Kuwait",
    position: "prefix",
    flagEmoji: "🇰🇼",
  },
  {
    code: "OMR",
    symbol: "OMR ",
    name: "Omani Rial",
    country: "Oman",
    position: "prefix",
    flagEmoji: "🇴🇲",
  },
  {
    code: "BHD",
    symbol: "BD ",
    name: "Bahraini Dinar",
    country: "Bahrain",
    position: "prefix",
    flagEmoji: "🇧🇭",
  },
  {
    code: "MYR",
    symbol: "RM ",
    name: "Malaysian Ringgit",
    country: "Malaysia",
    position: "prefix",
    flagEmoji: "🇲🇾",
  },
  {
    code: "TRY",
    symbol: "₺",
    name: "Turkish Lira",
    country: "Turkey",
    position: "prefix",
    flagEmoji: "🇹🇷",
  },
  {
    code: "CHF",
    symbol: "CHF ",
    name: "Swiss Franc",
    country: "Switzerland",
    position: "prefix",
    flagEmoji: "🇨🇭",
  },
  {
    code: "BRL",
    symbol: "R$ ",
    name: "Brazilian Real",
    country: "Brazil",
    position: "prefix",
    flagEmoji: "🇧🇷",
  },
  {
    code: "IDR",
    symbol: "Rp ",
    name: "Indonesian Rupiah",
    country: "Indonesia",
    position: "prefix",
    flagEmoji: "🇮🇩",
  },
  {
    code: "ZAR",
    symbol: "R ",
    name: "South African Rand",
    country: "South Africa",
    position: "prefix",
    flagEmoji: "🇿🇦",
  },
  {
    code: "BDT",
    symbol: "৳",
    name: "Bangladeshi Taka",
    country: "Bangladesh",
    position: "prefix",
    flagEmoji: "🇧🇩",
  },
  {
    code: "PHP",
    symbol: "₱",
    name: "Philippine Peso",
    country: "Philippines",
    position: "prefix",
    flagEmoji: "🇵🇭",
  },
  {
    code: "THB",
    symbol: "฿",
    name: "Thai Baht",
    country: "Thailand",
    position: "prefix",
    flagEmoji: "🇹🇭",
  },
  {
    code: "KRW",
    symbol: "₩",
    name: "South Korean Won",
    country: "South Korea",
    position: "prefix",
    flagEmoji: "🇰🇷",
  },
  {
    code: "NZD",
    symbol: "NZ$",
    name: "New Zealand Dollar",
    country: "New Zealand",
    position: "prefix",
    flagEmoji: "🇳🇿",
  },
  {
    code: "EGP",
    symbol: "E£ ",
    name: "Egyptian Pound",
    country: "Egypt",
    position: "prefix",
    flagEmoji: "🇪🇬",
  },
  {
    code: "NGN",
    symbol: "₦",
    name: "Nigerian Naira",
    country: "Nigeria",
    position: "prefix",
    flagEmoji: "🇳🇬",
  },
];

interface SelectCurrencyScreenProps {
  visible: boolean;
  onSelectCurrency: (currency: Currency) => void;
  currentCurrency?: Currency;
  isLight?: boolean;
}

export const SelectCurrencyScreen: React.FC<SelectCurrencyScreenProps> = ({
  visible,
  onSelectCurrency,
  currentCurrency,
  isLight = true,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(() => {
    if (currentCurrency) return currentCurrency;
    return WORLD_CURRENCIES[0];
  });

  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return WORLD_CURRENCIES;
    return WORLD_CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  if (!visible) return null;

  const bg = isLight ? "#FFFFFF" : "#0B1118";
  const cardBg = isLight ? "#FFFFFF" : "#161B22";
  const borderColor = isLight ? "#E2E8F0" : "#30363D";
  const textColor = isLight ? "#0F2C4C" : "#F8FAFC";
  const subtextColor = isLight ? "#64748B" : "#94A3B8";
  const primaryColor = isLight ? "#012E4F" : "#38BDF8";
  const primaryButtonText = isLight ? "#FFFFFF" : "#0B1118";

  const handleConfirm = () => {
    onSelectCurrency(selectedCurrency);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
    >
      <View style={[styles.container, { backgroundColor: bg }]}>
        <StatusBar
          barStyle={isLight ? "dark-content" : "light-content"}
          backgroundColor="transparent"
          translucent
        />

        {/* Top Header Section with separator line between title and search bar */}
        <View
          style={[
            styles.headerSection,
            {
              paddingTop: Math.max(insets.top, 34),
              backgroundColor: bg,
            },
          ]}
        >
          <View style={styles.headerTitleRow}>
            <Text style={[styles.mainTitle, { color: textColor }]}>
              Select Primary Currency
            </Text>
          </View>

          {/* Separator line between title and search bar */}
          <View
            style={[styles.headerSeparator, { backgroundColor: borderColor }]}
          />

          {/* Search Bar */}
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: isLight ? "#F1F5F9" : "#1A2230",
                borderColor: borderColor,
              },
            ]}
          >
            <Search size={16} color={subtextColor} style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search currency, code or country..."
              placeholderTextColor={subtextColor}
              style={[styles.searchInput, { color: textColor }]}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.clearBtn}
              >
                <X size={15} color={subtextColor} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Currency List */}
        <FlatList
          data={filteredCurrencies}
          keyExtractor={(item) => item.code + item.name}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: Math.max(insets.bottom, 24) + 110 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selectedCurrency.code === item.code;
            return (
              <Pressable
                onPress={() => setSelectedCurrency(item)}
                style={({ pressed }) => [
                  styles.currencyCard,
                  {
                    backgroundColor: cardBg,
                    borderColor: isSelected
                      ? isLight
                        ? "#012E4F"
                        : "#38BDF8"
                      : borderColor,
                    opacity: pressed ? 0.94 : 1,
                  },
                ]}
              >
                {/* Left: Flag / Emblem Container */}
                <View
                  style={[
                    styles.flagContainer,
                    {
                      borderColor: isLight ? "#E2E8F0" : "#30363D",
                      backgroundColor: isLight ? "#F8FAFC" : "#1E293B",
                    },
                  ]}
                >
                  <Text style={styles.flagEmojiText}>
                    {item.flagEmoji || "🌐"}
                  </Text>
                </View>

                {/* Center: Currency info */}
                <View style={styles.currencyDetails}>
                  <Text
                    style={[styles.currencyName, { color: textColor }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[styles.currencySubInfo, { color: subtextColor }]}
                    numberOfLines={1}
                  >
                    {item.code} • {item.symbol.trim()}
                  </Text>
                </View>

                {/* Right: Radio / Checkmark */}
                <View
                  style={[
                    styles.radioCircle,
                    {
                      borderColor: isSelected
                        ? isLight
                          ? "#012E4F"
                          : "#38BDF8"
                        : isLight
                          ? "#CBD5E1"
                          : "#475569",
                      backgroundColor: isSelected
                        ? isLight
                          ? "#012E4F"
                          : "#38BDF8"
                        : "transparent",
                    },
                  ]}
                >
                  {isSelected && (
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  )}
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Coins size={40} color={subtextColor} strokeWidth={1.5} />
              <Text style={[styles.emptyText, { color: textColor }]}>
                No currencies found
              </Text>
              <Text style={[styles.emptySubtext, { color: subtextColor }]}>
                Try searching for another currency code or country name
              </Text>
            </View>
          }
        />

        {/* Bottom Floating Confirm Bar */}
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: isLight
                ? "rgba(255, 255, 255, 0.96)"
                : "rgba(18, 24, 36, 0.96)",
              borderTopColor: borderColor,
              paddingBottom: Math.max(insets.bottom, 16) + 12,
            },
          ]}
        >
          <Pressable
            onPress={handleConfirm}
            style={({ pressed }) => [
              styles.confirmButton,
              {
                backgroundColor: isLight ? "#012E4F" : "#38BDF8",
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text
              style={[styles.confirmButtonText, { color: primaryButtonText }]}
            >
              Confirm & continue with {selectedCurrency.code}
            </Text>
            <ArrowRight size={18} color={primaryButtonText} strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    width: "100%",
    maxWidth: 412,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerTitleRow: {
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Poppins" : "sans-serif",
  },
  headerSeparator: {
    width: "100%",
    height: 1,
    marginBottom: 12,
  },
  searchBar: {
    width: "100%",
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    height: "100%",
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  listContainer: {
    width: "100%",
    maxWidth: 412,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  currencyCard: {
    width: "100%",
    maxWidth: 380,
    height: 60,
    borderRadius: 16,
    borderWidth: 1, // Reduced border thickness from 2 to 1 for a cleaner look
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  flagContainer: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  flagEmojiText: {
    fontSize: 18,
    textAlign: "center",
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: "center",
      },
    }),
  },
  currencyDetails: {
    flex: 1,
    justifyContent: "center",
  },
  currencyName: {
    fontSize: 14.5,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 1,
  },
  currencySubInfo: {
    fontSize: 12,
    fontWeight: "500",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5, // Refined border width for radio circle
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: "center",
    maxWidth: 240,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
    alignItems: "center",
  },
  confirmButton: {
    width: "100%",
    maxWidth: 380,
    height: 52,
    borderRadius: 14,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmButtonText: {
    fontSize: 15.5,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});

export default SelectCurrencyScreen;
