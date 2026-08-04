import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getCategories } from "@/lib/api-content";
import NewCourseView from "@/components/NewCourseView";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.creatorDash.addCourseTitle, robots: { index: false } };
}

export default async function NewCoursePage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const categories = await getCategories(locale);
  return <NewCourseView locale={locale} dict={dict} categories={categories} />;
}
