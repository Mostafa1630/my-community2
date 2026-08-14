import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import LessonWatchView from "@/components/LessonWatchView";

// No lesson data fetched here on purpose — this page stays a thin shell with
// no server-rendered lesson content at all, so the real video url (only
// available via the authenticated GET /lessons/{id}) never ends up in this
// page's static HTML. LessonWatchView fetches it client-side after mount.
export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.courseDetails.curriculum, robots: { index: false } };
}

export default async function LessonWatchPage(
  props: {
    params: Promise<{ locale: string; id: string; lessonId: string }>;
  }
) {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return (
    <LessonWatchView courseId={params.id} lessonId={params.lessonId} locale={locale} dict={dict} />
  );
}
