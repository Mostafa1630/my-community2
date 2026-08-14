import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import ChangePasswordPageView from "@/components/ChangePasswordPageView";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.changePassword.title, robots: { index: false } };
}

export default async function ChangePasswordPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return (
    <div className="container-page py-12">
      <ChangePasswordPageView locale={locale} dict={dict} />
    </div>
  );
}
