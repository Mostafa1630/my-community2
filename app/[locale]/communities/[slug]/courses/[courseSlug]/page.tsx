import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Users, Clock } from "lucide-react";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { courses, getCourseBySlug, getCommunityById, getAverageRating } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { getAccent, initials } from "@/lib/accents";
import VideoPlayer from "@/components/VideoPlayer";
import CourseCommunityAccess from "@/components/CourseCommunityAccess";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    courses
      .filter((c) => c.communityId)
      .map((course) => {
        const community = getCommunityById(course.communityId as string);
        return { locale, slug: community?.slug ?? "", courseSlug: course.slug };
      })
  );
}

export async function generateMetadata({
  params
}: {
  params: { locale: string; slug: string; courseSlug: string };
}): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const course = getCourseBySlug(params.courseSlug);
  if (!course) return {};
  const title = locale === "ar" ? course.titleAr : course.titleEn;
  const description = locale === "ar" ? course.descAr : course.descEn;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/communities/${params.slug}/courses/${course.slug}` }
  };
}

export default function CourseInCommunityPage({
  params
}: {
  params: { locale: string; slug: string; courseSlug: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const course = getCourseBySlug(params.courseSlug);
  if (!course || !course.communityId) notFound();

  const community = getCommunityById(course.communityId);
  if (!community || community.slug !== params.slug) notFound();

  const accent = getAccent(course.accent);
  const title = locale === "ar" ? course.titleAr : course.titleEn;
  const description = locale === "ar" ? course.descAr : course.descEn;
  const communityName = locale === "ar" ? community.nameAr : community.nameEn;
  const totalMinutes = course.lessons.reduce((sum, l) => sum + l.durationMinutes, 0);
  const rating = getAverageRating(course.id);

  return (
    <div>
      <div className={`bg-gradient-to-b ${accent.gradient}`}>
        <div className="container-page grid gap-8 py-10 text-white lg:grid-cols-[1.6fr,1fr] lg:py-14">
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs text-white/70">
              <Link href={`/${locale}/communities/${community.slug}`} className="link-underline">{communityName}</Link>
            </div>
            <h1 className="max-w-2xl text-2xl font-bold leading-snug sm:text-3xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">{description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/85">
              <span className="flex items-center gap-1.5">
                <Users size={14} />
                {formatNumber(course.studentsCount, locale)} {dict.common.students}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {formatNumber(totalMinutes, locale)}m · {course.lessons.length} {dict.common.lessons}
              </span>
              {rating > 0 && <span>★ {rating.toFixed(1)}</span>}
            </div>

            <Link
              href={`/${locale}/communities/${community.slug}`}
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-white/10 py-1.5 ps-1.5 pe-4 backdrop-blur hover:bg-white/15"
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${accent.gradient}`}>
                {initials(communityName)}
              </span>
              <span className="text-sm font-medium">{t(dict.courseDetails.partOfCommunity, { name: communityName })}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        <h2 className="mb-3 text-lg font-bold text-ink">{dict.courseDetails.introVideo}</h2>
        <VideoPlayer url={course.introVideoUrl} title={title} />

        <h2 className="mb-3 mt-10 text-lg font-bold text-ink">{dict.courseDetails.about}</h2>
        <p className="max-w-2xl text-sm leading-7 text-ink/70">{description}</p>

        <div className="mt-10">
          <CourseCommunityAccess course={course} community={community} locale={locale} dict={dict} />
        </div>
      </div>
    </div>
  );
}
