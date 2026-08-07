import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import StudentProfileView from "@/components/StudentProfileView";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.student.profileEditCta, robots: { index: false } };
}

export default function ProfileEditPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl">
        <StudentProfileView locale={locale} dict={dict} />
      </div>
    </div>
  );
}
