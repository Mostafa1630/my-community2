import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getSettings } from "@/lib/api-content";
import { localizedAlternates } from "@/lib/seo";
import { brandWithSiteName } from "@/lib/platform-branding";
import TermsSection from "@/components/TermsSection";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const settings = await getSettings(locale);
  return {
    title: dict.legal.termsTitle,
    description: brandWithSiteName(dict.legal.termsSubtitle, settings, dict),
    alternates: localizedAlternates(locale, "/terms")
  };
}

export default async function TermsPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return <TermsSection locale={locale} dict={dict} />;
}
