import type { Locale } from "./i18n/config";

export function formatPrice(amount: number, locale: Locale, currency = "EGP") {
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    maximumFractionDigits: 0
  }).format(amount);
  const label = currency === "EGP" ? (locale === "ar" ? "ج.م" : "EGP") : currency;
  return locale === "ar" ? `${formatted} ${label}` : `${label} ${formatted}`;
}

export function formatNumber(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(amount);
}

export function formatDate(dateInput: string, locale: Locale) {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

export function formatRelative(dateInput: string, locale: Locale) {
  const date = new Date(dateInput);
  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    numeric: "auto"
  });
  const absMin = Math.abs(diffMinutes);
  if (absMin < 60) return rtf.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
}
