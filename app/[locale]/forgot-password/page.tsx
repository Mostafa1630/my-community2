import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.auth.forgotPasswordTitle, robots: { index: false } };
}

export default function ForgotPasswordPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return <ForgotPasswordForm locale={locale} dict={dict} />;
}
