import type { PlatformSettings } from "@/lib/api-types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";

type DescriptionFallback = "footer" | "meta" | "about";

export function getSiteName(
  settings: PlatformSettings | null | undefined,
  dict: Dictionary
): string {
  return settings?.siteName?.trim() || dict.meta.siteName;
}

export function brandWithSiteName(
  template: string,
  settings: PlatformSettings | null | undefined,
  dict: Dictionary
): string {
  return t(template, { name: getSiteName(settings, dict) });
}

export function getSiteDescription(
  settings: PlatformSettings | null | undefined,
  locale: Locale,
  dict: Dictionary,
  fallback: DescriptionFallback = "meta"
): string {
  const fromSettings =
    locale === "ar" ? settings?.descriptionAr : settings?.descriptionEn;
  if (fromSettings?.trim()) return fromSettings.trim();

  switch (fallback) {
    case "footer":
      return brandWithSiteName(dict.footer.about, settings, dict);
    case "about":
      return brandWithSiteName(dict.about.fallbackDescription, settings, dict);
    default:
      return brandWithSiteName(dict.meta.defaultDescription, settings, dict);
  }
}