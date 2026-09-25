import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY_LOCALES: Record<string, { locale: string; symbol: string }> = {
  INR: { locale: "en-IN", symbol: "₹" },
  USD: { locale: "en-US", symbol: "$" },
  EUR: { locale: "de-DE", symbol: "€" },
  GBP: { locale: "en-GB", symbol: "£" },
  AED: { locale: "en-AE", symbol: "AED" },
  CAD: { locale: "en-CA", symbol: "CA$" },
  AUD: { locale: "en-AU", symbol: "A$" },
};

export function formatCurrency(
  amount: number | string | any,
  currencyCode?: string,
  currencySymbol?: string
): string {
  const numeric = typeof amount === "number" ? amount : parseFloat(amount) || 0;
  let code = currencyCode;
  let symbol = currencySymbol;

  if (!code && typeof window !== "undefined") {
    code = document.documentElement.getAttribute("data-currency") || "INR";
    if (!symbol) {
      symbol = document.documentElement.getAttribute("data-currency-symbol") || undefined;
    }
  }

  const normalizedCode = (code || "INR").toUpperCase();
  const config = CURRENCY_LOCALES[normalizedCode] || { locale: "en-IN", symbol: symbol || "₹" };

  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: normalizedCode,
      maximumFractionDigits: normalizedCode === "INR" ? 0 : 2,
    }).format(numeric);
  } catch {
    return `${config.symbol}${numeric.toLocaleString()}`;
  }
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export function extractRejectionReason(notes?: string | null): string | null {
  if (!notes) return null;
  const match = notes.match(/\[REJECTED:\s*([^\]]+)\]/i);
  if (match) {
    return match[1].replace(/\s+on\s+\d{4}-\d{2}-\d{2}.*$/, "").trim();
  }
  return null;
}

