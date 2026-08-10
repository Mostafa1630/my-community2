import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import LessonWatchView from "@/components/LessonWatchView";

// No lesson data fetched here on purpose — this page stays a thin shell with
// no server-rendered lesson content at all, so the real video url (only
// available via the authenticated GET /lessons/{id}) never ends up in this
// page's static HTML. LessonWatchView fetches it client-side after mount.
export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.courseDetails.curriculum, robots: { index: false } };
}

export default function LessonWatchPage({
  params
}: {
  params: { locale: string; id: string; lessonId: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return <LessonWatchView lessonId={params.lessonId} courseId={params.id} locale={locale} dict={dict} />;
}
