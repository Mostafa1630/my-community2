import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { getCourseDetails } from "@/lib/api-content";
import LessonsManagerView from "@/components/LessonsManagerView";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string; id: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const course = await getCourseDetails(params.id, locale);
  const title = course ? t(dict.creatorDash.lessonsOf, { title: course.title }) : dict.creatorDash.lessons;
  return { title, robots: { index: false } };
}

export default async function CourseLessonsPage(props: { params: Promise<{ locale: string; id: string }> }) {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return <LessonsManagerView courseId={params.id} locale={locale} dict={dict} />;
}
