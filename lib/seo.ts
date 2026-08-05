import type { Locale } from "@/lib/i18n/config";

// No dedicated 1200x630 social-share photo exists yet, so this falls back to the
// real logo (the only brand image actually shipped) rather than a path with no
// file behind it — swap in a proper og-default.jpg here once one is designed.
export const DEFAULT_OG_IMAGE = "/images/nadi-logo.png";

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
