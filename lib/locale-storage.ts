import { type Locale, isLocale } from "./i18n/config";

const STORAGE_KEY = "mujtamaaty.locale.v1";
const COOKIE_KEY = "NEXT_LOCALE";

// Client-only read of the user's last-picked language, independent of
// whatever locale the current URL happens to be on.
export function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value && isLocale(value) ? value : null;
}

// Written to both localStorage (for any client code that wants it) and a
// cookie — middleware.ts runs at the edge before any HTML is sent, so a
// cookie is the only one of the two it can actually read. The cookie is
// what makes "land back on my last language" work without a visible
// flash-then-redirect; localStorage alone can't be seen server-side.
export function setStoredLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, locale);
  document.cookie = `${COOKIE_KEY}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}
