import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import MyCommunitiesView from "@/components/MyCommunitiesView";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.student.myCommunitiesTitle, robots: { index: false } };
}

export default async function MyCommunitiesPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">{dict.student.myCommunitiesTitle}</h1>
        <p className="mt-1.5 text-sm text-ink/65">{dict.student.myCommunitiesSubtitle}</p>
      </div>
      <MyCommunitiesView locale={locale} dict={dict} />
    </div>
  );
}
