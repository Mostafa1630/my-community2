import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getCategories } from "@/lib/api-content";
import EditCourseView from "@/components/EditCourseView";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.creatorDash.editCourseTitle, robots: { index: false } };
}

export default async function EditCoursePage({ params }: { params: { locale: string; id: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const categories = await getCategories(locale);
  return <EditCourseView courseId={params.id} locale={locale} dict={dict} categories={categories} />;
}
