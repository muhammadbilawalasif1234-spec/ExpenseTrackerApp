import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

interface SmallNativeAdCardProps {
  isLight?: boolean;
}

export const SmallNativeAdCard: React.FC<SmallNativeAdCardProps> = ({
  isLight = true,
}) => {
  return (
    <View
      style={[
        styles.cardContainer,
        isLight ? styles.cardLight : styles.cardDark,
      ]}
    >
      {/* Header Badge & Ad Label */}
      <View style={styles.topRow}>
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>Ad</Text>
        </View>
        <Text
          style={[
            styles.sponsoredText,
            { color: isLight ? "#64748B" : "#94A3B8" },
          ]}
        >
          Sponsored Content
        </Text>
      </View>

      {/* Main Banner Ad Container */}
      <View style={styles.adWrapper}>
        <BannerAd
          unitId={TestIds.BANNER}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLight: {
    backgroundColor: "#FAFAFA",
    borderTopColor: "#E2E8F0",
  },
  cardDark: {
    backgroundColor: "#0F172A",
    borderTopColor: "#1E293B",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  adBadge: {
    backgroundColor: "#FFE082",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    marginRight: 6,
  },
  adBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#5D4037",
  },
  sponsoredText: {
    fontSize: 11,
    fontWeight: "500",
  },
  adWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 8,
  },
});
