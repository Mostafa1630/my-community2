import type { Metadata } from "next";
import { Suspense } from "react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import AuthForm from "@/components/AuthForm";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.auth.loginTitle };
}

export default function LoginPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return (
    <Suspense>
      <AuthForm mode="login" locale={locale} dict={dict} />
    </Suspense>
  );
}
