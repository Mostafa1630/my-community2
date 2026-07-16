import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getCourseBySlug } from "@/lib/data";
import WatchCourseView from "@/components/WatchCourseView";

export async function generateMetadata({
  params
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const course = getCourseBySlug(params.slug);
  if (!course) return {};
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  return { title: locale === "ar" ? course.titleAr : course.titleEn, robots: { index: false } };
}

export default function LearnPage({ params }: { params: { locale: string; slug: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const course = getCourseBySlug(params.slug);
  if (!course) notFound();
  return <WatchCourseView course={course} locale={locale} dict={dict} />;
}
