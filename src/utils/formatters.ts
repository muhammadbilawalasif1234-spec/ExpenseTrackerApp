import { Currency } from "../types";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const formatNumberWithCommas = (
  num: number | string | null | undefined,
  decimals = 2,
): string => {
  const n = typeof num === "string" ? parseFloat(num.replace(/,/g, "")) : num;
  const safeNum = typeof n === "number" && !isNaN(n) && isFinite(n) ? n : 0;
  const fixed = safeNum.toFixed(decimals);
  const parts = fixed.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

export const formatCurrency = (
  amount: number | null | undefined,
  currency?: Currency,
): string => {
  const safeAmount =
    typeof amount === "number" && !isNaN(amount) && isFinite(amount)
      ? amount
      : 0;
  const isNegative = safeAmount < 0;
  const absAmount = Math.abs(safeAmount);

  const formattedNumber = formatNumberWithCommas(absAmount, 2);

  const sign = isNegative ? "-" : "";
  const curr = currency || {
    code: "PKR",
    symbol: "PKR ",
    name: "Pakistani Rupee",
    position: "prefix",
  };

  let symbol = curr.symbol || "PKR ";
  // Always normalize PKR currency or any legacy "Rs." to "PKR "
  if (curr.code === "PKR" || symbol.trim().toLowerCase().startsWith("rs")) {
    symbol = "PKR ";
  } else if (curr.position === "prefix" && !symbol.endsWith(" ")) {
    symbol = `${symbol} `;
  }

  if (curr.position === "suffix") {
    return `${sign}${formattedNumber} ${symbol.trim()}`;
  } else {
    return `${sign}${symbol}${formattedNumber}`;
  }
};

export const formatDateDisplay = (dateString: string): string => {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString || "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = MONTHS_SHORT[d.getMonth()] || "";
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
  } catch {
    return dateString || "";
  }
};

export const formatTimeDisplay = (dateString: string): string => {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, "0");
    return `${strHours}:${minutes} ${ampm}`;
  } catch {
    return "";
  }
};

export const getRelativeDateGroup = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Older";
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) return "Today";

    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return "Yesterday";

    const dayName = DAYS_SHORT[date.getDay()] || "";
    const month = MONTHS_SHORT[date.getMonth()] || "";
    const dayNum = date.getDate();
    return `${dayName}, ${month} ${dayNum}`;
  } catch {
    return "Older";
  }
};
