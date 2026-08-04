import type { Metadata } from "next";
import { Suspense } from "react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.auth.resetPasswordTitle, robots: { index: false } };
}

export default function ResetPasswordPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return (
    <Suspense>
      <ResetPasswordForm locale={locale} dict={dict} />
    </Suspense>
  );
}
