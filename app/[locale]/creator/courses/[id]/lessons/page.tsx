import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { getCourseById } from "@/lib/data";
import LessonsManagerView from "@/components/LessonsManagerView";

export async function generateMetadata({
  params
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const course = getCourseById(params.id);
  const title = course
    ? t(dict.creatorDash.lessonsOf, { title: locale === "ar" ? course.titleAr : course.titleEn })
    : dict.creatorDash.lessons;
  return { title, robots: { index: false } };
}

export default function CourseLessonsPage({ params }: { params: { locale: string; id: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return <LessonsManagerView courseId={params.id} locale={locale} dict={dict} />;
}
