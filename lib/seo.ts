import type { Locale } from "@/lib/i18n/config";

// Drop the real photo at public/images/og-default.jpg (1200x630 recommended) — every
// page that doesn't have its own cover/avatar image falls back to this for social
// share previews (Open Graph / Twitter cards).
export const DEFAULT_OG_IMAGE = "/images/og-default.jpg";

// Metadata.alternates is replaced wholesale (not deep-merged) by any page that sets
// its own value, which silently drops the root layout's hreflang `languages` map.
// Every page with a dynamic canonical must build both canonical + languages together
// through this helper instead of setting `alternates: { canonical: ... }` directly.
export function localizedAlternates(locale: Locale, path: string) {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ar: `/ar${path}`,
      en: `/en${path}`
    }
  };
}
