import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { localizedAlternates } from "@/lib/seo";
import PrivacyPolicySection from "@/components/PrivacyPolicySection";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return {
    title: dict.legal.privacyTitle,
    description: dict.legal.privacySubtitle,
    alternates: localizedAlternates(locale, "/privacy")
  };
}

export default function PrivacyPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return <PrivacyPolicySection locale={locale} dict={dict} />;
}
