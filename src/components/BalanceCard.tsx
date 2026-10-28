import { ArrowRight } from "lucide-react-native";
import React from "react";
import {
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Currency } from "../types";
import { formatNumberWithCommas } from "../utils/formatters";

const BalanceImage = require("../assets/Balance.png");

export interface BalanceCardProps {
  totalBalance: number;
  currency: Currency;
  onReportsPress?: () => void;
  onTransferPress?: () => void;
  periodLabel?: string;
  isLight?: boolean;
  title?: string;
  onBalancePress?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalBalance = 0,
  currency,
  onReportsPress,
  onTransferPress,
  title,
  onBalancePress,
}) => {
  const handlePress = onTransferPress || onReportsPress;
  const currCode = (currency?.code || currency?.symbol || "PKR").trim();
  const displayTitle = title
    ? title.includes("(")
      ? title
      : `${title} (${currCode})`
    : `Total Balance (${currCode})`;
  const isNegative = totalBalance < 0;
  const formattedBalance = `${isNegative ? "-" : ""}${formatNumberWithCommas(Math.abs(totalBalance), 2)}`;

  return (
    <View style={styles.cardWrapper}>
      <ImageBackground
        source={BalanceImage}
        style={styles.cardBackground}
        imageStyle={styles.cardImage}
        resizeMode="stretch"
      >
        <Pressable
          style={styles.topInfo}
          onPress={onBalancePress || onReportsPress}
          accessibilityRole="button"
          accessibilityLabel={displayTitle}
        >
          <Text style={styles.balanceLabel} numberOfLines={1}>
            {displayTitle}
          </Text>
          <Text
            style={styles.balanceAmount}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.7}
          >
            {formattedBalance}
          </Text>
        </Pressable>

        <Pressable
          style={styles.transfersButton}
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel="Transfers"
        >
          <Text style={styles.transfersText} numberOfLines={1}>
            Transfers
          </Text>
          <View style={styles.arrowCircle}>
            <ArrowRight size={16} color="#002F52" strokeWidth={2.5} />
          </View>
        </Pressable>
      </ImageBackground>
    </View>
  );
};

export default BalanceCard;

const styles = StyleSheet.create({
  cardWrapper: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    overflow: "hidden",
  },
  cardBackground: {
    width: "100%",
    height: 160,
    padding: 0,
    margin: 0,
  },
  cardImage: {
    width: "100%",
    height: 160,
    borderRadius: 10,
  },
  topInfo: {
    position: "absolute",
    left: 20,
    top: 18,
    right: 20,
    maxWidth: "85%",
  },
  balanceLabel: {
    fontFamily: Platform.OS === "ios" ? "Poppins" : "sans-serif",
    fontWeight: "400",
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 20.3,
  },
  balanceAmount: {
    fontFamily: Platform.OS === "ios" ? "Poppins" : "sans-serif",
    fontWeight: "700",
    fontSize: 32,
    color: "#FFFFFF",
    lineHeight: 40,
  },
  transfersButton: {
    position: "absolute",
    right: 8,
    top: 114,
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  transfersText: {
    minWidth: 55,
    height: 18,
    fontFamily: "Poppins",
    fontWeight: "300",
    fontSize: 12,
    lineHeight: 18,
    color: "#FFFFFF",
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
