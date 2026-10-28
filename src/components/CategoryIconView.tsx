import React from "react";
import { View, StyleSheet } from "react-native";
import {
  UtensilsCrossed,
  ShoppingBag,
  HeartPulse,
  Bus,
  Car,
  Coins,
  Smile,
  Coffee,
  Wine,
  Tag,
  Receipt,
  GraduationCap,
  Film,
  ShoppingCart,
  Plane,
  Banknote,
  Briefcase,
  Gift,
  TrendingUp,
  Sparkles,
  Laptop,
  CreditCard,
  Activity,
  Heart,
  Calendar,
  Home,
  Dumbbell,
  Fuel,
  PartyPopper,
  MoreHorizontal,
} from "lucide-react-native";
import { getPastelForColor, getCategoryColor } from "../utils/categoryColors";

interface CategoryIconViewProps {
  iconName: string;
  color?: string;
  size?: number;
  containerSize?: number;
  borderRadius?: number;
  customBg?: string;
  customColor?: string;
  isLight?: boolean;
}

export const renderIconComponent = (
  name: string,
  size: number,
  color: string,
) => {
  const iconProps = { size, color, strokeWidth: 2 };
  const lower = (name || "").toLowerCase();

  if (
    lower.includes("utensil") ||
    lower.includes("food") ||
    lower.includes("fork") ||
    lower.includes("eat")
  ) {
    return <UtensilsCrossed {...iconProps} />;
  }
  if (lower.includes("coffee") || lower.includes("cafe")) {
    return <Coffee {...iconProps} />;
  }
  if (
    lower.includes("wine") ||
    lower.includes("drink") ||
    lower.includes("bar")
  ) {
    return <Wine {...iconProps} />;
  }
  if (
    lower.includes("shop") ||
    lower.includes("bag") ||
    lower.includes("cloth")
  ) {
    return <ShoppingBag {...iconProps} />;
  }
  if (lower.includes("cart") || lower.includes("grocer")) {
    return <ShoppingCart {...iconProps} />;
  }
  if (
    lower.includes("heart") ||
    lower.includes("health") ||
    lower.includes("pulse") ||
    lower.includes("med")
  ) {
    return <HeartPulse {...iconProps} />;
  }
  if (lower.includes("bus")) {
    return <Bus {...iconProps} />;
  }
  if (
    lower.includes("car") ||
    lower.includes("taxi") ||
    lower.includes("transport") ||
    lower.includes("fuel")
  ) {
    return <Car {...iconProps} />;
  }
  if (
    lower.includes("coin") ||
    lower.includes("interest") ||
    lower.includes("money") ||
    lower.includes("dollar")
  ) {
    return <Coins {...iconProps} />;
  }
  if (
    lower.includes("smile") ||
    lower.includes("life") ||
    lower.includes("event") ||
    lower.includes("happy")
  ) {
    return <Smile {...iconProps} />;
  }
  if (
    lower.includes("party") ||
    lower.includes("birth") ||
    lower.includes("celebrat")
  ) {
    return <PartyPopper {...iconProps} />;
  }
  if (
    lower.includes("gym") ||
    lower.includes("fitness") ||
    lower.includes("dumb")
  ) {
    return <Dumbbell {...iconProps} />;
  }
  if (lower.includes("home") || lower.includes("house")) {
    return <Home {...iconProps} />;
  }
  if (lower.includes("bill") || lower.includes("receipt")) {
    return <Receipt {...iconProps} />;
  }
  if (
    lower.includes("film") ||
    lower.includes("movie") ||
    lower.includes("entertain")
  ) {
    return <Film {...iconProps} />;
  }
  if (lower.includes("graduat") || lower.includes("edu")) {
    return <GraduationCap {...iconProps} />;
  }
  if (
    lower.includes("plane") ||
    lower.includes("travel") ||
    lower.includes("trip")
  ) {
    return <Plane {...iconProps} />;
  }
  if (
    lower.includes("salary") ||
    lower.includes("cash") ||
    lower.includes("note") ||
    lower.includes("income")
  ) {
    return <Banknote {...iconProps} />;
  }
  if (
    lower.includes("business") ||
    lower.includes("work") ||
    lower.includes("brief")
  ) {
    return <Briefcase {...iconProps} />;
  }
  if (lower.includes("laptop") || lower.includes("tech")) {
    return <Laptop {...iconProps} />;
  }
  if (lower.includes("gift")) {
    return <Gift {...iconProps} />;
  }
  if (lower.includes("trend") || lower.includes("invest")) {
    return <TrendingUp {...iconProps} />;
  }
  if (lower.includes("credit") || lower.includes("card")) {
    return <CreditCard {...iconProps} />;
  }
  if (
    lower.includes("sparkle") ||
    lower.includes("star") ||
    lower.includes("magic")
  ) {
    return <Sparkles {...iconProps} />;
  }
  if (
    lower.includes("fuel") ||
    lower.includes("gas") ||
    lower.includes("petrol")
  ) {
    return <Fuel {...iconProps} />;
  }
  if (
    lower.includes("other") ||
    lower.includes("more") ||
    lower.includes("horizontal") ||
    lower.includes("dots")
  ) {
    return <MoreHorizontal {...iconProps} />;
  }

  return <Tag {...iconProps} />;
};

export const CategoryIconView: React.FC<CategoryIconViewProps> = ({
  iconName,
  color,
  size = 22,
  containerSize = 44,
  borderRadius,
  customBg,
  customColor,
  isLight = true,
}) => {
  const effectiveColor = color || getCategoryColor(iconName) || "#0284C7";

  let bgColor: string;
  let iconCol: string;

  if (isLight) {
    const pastel = getPastelForColor(effectiveColor);
    // Guarantee fallback creates a valid pastel tint if getPastelForColor returns a neutral
    bgColor =
      customBg || (pastel.bg !== "#F1F5F9" ? pastel.bg : effectiveColor + "22");
    iconCol = customColor || pastel.iconColor || effectiveColor;
  } else {
    bgColor =
      customBg ||
      (effectiveColor.startsWith("#")
        ? effectiveColor + "30"
        : "rgba(56, 189, 248, 0.2)");
    iconCol = customColor || effectiveColor;
  }

  const radius = borderRadius !== undefined ? borderRadius : containerSize / 2;

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: radius,
          backgroundColor: bgColor,
        },
      ]}
    >
      {renderIconComponent(iconName, size, iconCol)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CategoryIconView;
