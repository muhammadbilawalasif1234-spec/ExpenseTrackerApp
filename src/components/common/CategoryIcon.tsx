import React from "react";
import {
  Wallet,
  PiggyBank,
  Landmark,
  CreditCard,
  Coins,
  TrendingUp,
  Briefcase,
  Building2,
  Shield,
  Gift,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react-native";

interface CategoryIconProps {
  iconName?: string;
  size?: number;
  customColor?: string;
  containerSize?: number;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  wallet: Wallet,
  cash: Wallet,
  bank: Landmark,
  account: Landmark,
  credit: CreditCard,
  debit: CreditCard,
  savings: PiggyBank,
  investment: TrendingUp,
  loan: Briefcase,
  insurance: Shield,
  business: Building2,
  gift: Gift,
  card: CreditCard,
  coins: Coins,
  more: MoreHorizontal,
  transfer: ArrowUpRight,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName = "Wallet",
  size = 16,
  customColor = "#00C896",
  containerSize,
}) => {
  const normalized = (iconName || "").toLowerCase();
  const Icon = iconMap[normalized] || iconMap.wallet;

  return <Icon size={size} color={customColor} strokeWidth={2} />;
};
