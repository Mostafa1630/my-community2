import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import MyCoursesView from "@/components/MyCoursesView";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.student.myCoursesTitle, robots: { index: false } };
}

export default async function MyCoursesPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">{dict.student.myCoursesTitle}</h1>
        <p className="mt-1.5 text-sm text-ink/65">{dict.student.myCoursesSubtitle}</p>
      </div>
      <MyCoursesView locale={locale} dict={dict} />
    </div>
  );
}
