import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import MyCommunitiesView from "@/components/MyCommunitiesView";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.student.myCommunitiesTitle, robots: { index: false } };
}

export default function MyCommunitiesPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">{dict.student.myCommunitiesTitle}</h1>
        <p className="mt-1.5 text-sm text-ink/60">{dict.student.myCommunitiesSubtitle}</p>
      </div>
      <MyCommunitiesView locale={locale} dict={dict} />
    </div>
  );
}
