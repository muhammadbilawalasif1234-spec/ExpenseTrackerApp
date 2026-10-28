export interface PastelTheme {
  bg: string;
  color: string;
  label: string;
}

export const PASTEL_THEMES: PastelTheme[] = [
  { bg: "#FEF3D6", color: "#D97706", label: "Warm Amber" },
  { bg: "#E0F2FE", color: "#0284C7", label: "Sky Blue" },
  { bg: "#E0F7FA", color: "#06B6D4", label: "Ice Cyan" },
  { bg: "#E8FDF0", color: "#10B981", label: "Mint Green" },
  { bg: "#FCE7F3", color: "#D946EF", label: "Pastel Pink" },
  { bg: "#FFEDD5", color: "#F97316", label: "Soft Peach" },
  { bg: "#EDE9FE", color: "#7C3AED", label: "Lavender" },
  { bg: "#FEE2E2", color: "#EF4444", label: "Soft Rose" },
];

export const getPastelForColor = (
  color: string,
): { bg: string; iconColor: string } => {
  if (!color) {
    return { bg: "#FEF3D6", iconColor: "#D97706" };
  }

  const c = color.toLowerCase();
  if (
    c.includes("f59e0b") ||
    c.includes("ff5722") ||
    c.includes("amber") ||
    c.includes("yellow")
  ) {
    return { bg: "#FEF3D6", iconColor: "#D97706" };
  }
  if (
    c.includes("0284c7") ||
    c.includes("2196f3") ||
    c.includes("3b82f6") ||
    c.includes("blue")
  ) {
    return { bg: "#E0F2FE", iconColor: "#0284C7" };
  }
  if (c.includes("06b6d4") || c.includes("00bcd4") || c.includes("cyan")) {
    return { bg: "#E0F7FA", iconColor: "#06B6D4" };
  }
  if (
    c.includes("10b981") ||
    c.includes("4caf50") ||
    c.includes("00c853") ||
    c.includes("green")
  ) {
    return { bg: "#E8FDF0", iconColor: "#10B981" };
  }
  if (
    c.includes("d946ef") ||
    c.includes("ec4899") ||
    c.includes("e91e63") ||
    c.includes("pink")
  ) {
    return { bg: "#FCE7F3", iconColor: "#D946EF" };
  }
  if (
    c.includes("f97316") ||
    c.includes("ff9800") ||
    c.includes("orange") ||
    c.includes("peach")
  ) {
    return { bg: "#FFEDD5", iconColor: "#F97316" };
  }
  if (c.includes("7c3aed") || c.includes("9c27b0") || c.includes("purple")) {
    return { bg: "#EDE9FE", iconColor: "#7C3AED" };
  }
  if (c.includes("ef4444") || c.includes("e53935") || c.includes("red")) {
    return { bg: "#FEE2E2", iconColor: "#EF4444" };
  }

  // If color is hex, create a subtle pastel background
  return { bg: "#F1F5F9", iconColor: color };
};

export const getCategoryColor = (categoryName: string): string => {
  if (!categoryName) return "#F59E0B";
  const name = categoryName.toLowerCase().trim();

  if (
    name.includes("food") ||
    name.includes("eat") ||
    name.includes("dining") ||
    name.includes("utensil") ||
    name.includes("cafe") ||
    name.includes("coffee") ||
    name.includes("restaurant")
  ) {
    return "#B91C1C";
  }
  if (
    name.includes("transp") ||
    name.includes("car") ||
    name.includes("bus") ||
    name.includes("fuel") ||
    name.includes("taxi") ||
    name.includes("travel") ||
    name.includes("uber")
  ) {
    return "#0EA5E9";
  }
  if (
    name.includes("shop") ||
    name.includes("cloth") ||
    name.includes("grocer") ||
    name.includes("cart") ||
    name.includes("store") ||
    name.includes("apparel")
  ) {
    return "#E5A000";
  }
  if (
    name.includes("salary") ||
    name.includes("income") ||
    name.includes("earn") ||
    name.includes("bonus") ||
    name.includes("paycheck") ||
    name.includes("deposit")
  ) {
    return "#00C466";
  }
  if (
    name.includes("entertain") ||
    name.includes("movie") ||
    name.includes("film") ||
    name.includes("game") ||
    name.includes("fun") ||
    name.includes("stream") ||
    name.includes("netflix")
  ) {
    return "#0066FF";
  }
  if (
    name.includes("vacat") ||
    name.includes("flight") ||
    name.includes("hotel") ||
    name.includes("trip")
  ) {
    return "#F27A54";
  }
  if (
    name.includes("life") ||
    name.includes("personal") ||
    name.includes("beauty") ||
    name.includes("fashion") ||
    name.includes("salon")
  ) {
    return "#F59E0B";
  }
  if (
    name.includes("health") ||
    name.includes("med") ||
    name.includes("doctor") ||
    name.includes("gym") ||
    name.includes("fit") ||
    name.includes("pharmacy")
  ) {
    return "#EF4444";
  }
  if (
    name.includes("bill") ||
    name.includes("rent") ||
    name.includes("utilit") ||
    name.includes("house") ||
    name.includes("home") ||
    name.includes("electric") ||
    name.includes("water")
  ) {
    return "#F97316";
  }
  if (
    name.includes("edu") ||
    name.includes("book") ||
    name.includes("school") ||
    name.includes("course") ||
    name.includes("tuition")
  ) {
    return "#06B6D4";
  }
  if (
    name.includes("gift") ||
    name.includes("donat") ||
    name.includes("charity")
  ) {
    return "#D946EF";
  }
  if (
    name.includes("transfer") ||
    name.includes("send") ||
    name.includes("account")
  ) {
    return "#3B82F6";
  }

  const VIBRANT_PALETTE = [
    "#0EA5E9",
    "#F59E0B",
    "#10B981",
    "#EC4899",
    "#8B5CF6",
    "#F97316",
    "#06B6D4",
    "#EF4444",
    "#3B82F6",
    "#14B8A6",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % VIBRANT_PALETTE.length;
  return VIBRANT_PALETTE[index];
};
