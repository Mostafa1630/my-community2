import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { localizedAlternates } from "@/lib/seo";
import { getSettings } from "@/lib/api-content";
import { getSiteDescription } from "@/lib/platform-branding";
import PrivacyPolicySection from "@/components/PrivacyPolicySection";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const settings = await getSettings(locale);
  return {
    title: dict.legal.privacyTitle,
    description: getSiteDescription(settings, locale, dict),
    alternates: localizedAlternates(locale, "/privacy")
  };
}

export default async function PrivacyPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return <PrivacyPolicySection locale={locale} dict={dict} />;
}
