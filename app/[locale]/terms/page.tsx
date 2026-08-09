import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { localizedAlternates } from "@/lib/seo";
import TermsSection from "@/components/TermsSection";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return {
    title: dict.legal.termsTitle,
    description: dict.legal.termsSubtitle,
    alternates: localizedAlternates(locale, "/terms")
  };
}

export default function TermsPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return <TermsSection locale={locale} dict={dict} />;
}
