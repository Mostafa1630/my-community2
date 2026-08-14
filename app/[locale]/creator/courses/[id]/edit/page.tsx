import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getCategories } from "@/lib/api-content";
import EditCourseView from "@/components/EditCourseView";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.creatorDash.editCourseTitle, robots: { index: false } };
}

export default async function EditCoursePage(props: { params: Promise<{ locale: string; id: string }> }) {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const categories = await getCategories(locale);
  return <EditCourseView courseId={params.id} locale={locale} dict={dict} categories={categories} />;
}
