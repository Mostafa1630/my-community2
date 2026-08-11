import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Users2 } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { localizedAlternates, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getCourseDetails } from "@/lib/api-content";
import { withDecryptedIntroVideo } from "@/lib/video";
import { getAccent, initials } from "@/lib/accents";
import RealCourseAccess from "@/components/RealCourseAccess";
import FavoriteButton from "@/components/FavoriteButton";

// No generateStaticParams — real course ids can't be enumerated at build
// time without hitting the live API, same reasoning as creators/communities.
// Flat /courses/{id} rather than nested under a community: the course itself
// carries its own community reference (used for the breadcrumb link below),
// and other real entry points — favorites in particular — only ever have a
// bare course id with no community id alongside it, so the route can't
// depend on one being present in the URL.

export async function generateMetadata({
  params
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const course = await getCourseDetails(params.id, locale);
  if (!course) return {};
  const image = course.image || DEFAULT_OG_IMAGE;
  return {
    title: course.title,
    description: course.description,
    alternates: localizedAlternates(locale, `/courses/${course.id}`),
    openGraph: { title: course.title, description: course.description, images: [image] },
    twitter: { title: course.title, description: course.description, images: [image] }
  };
}

export default async function CourseDetailsPage({ params }: { params: { locale: string; id: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const rawCourse = await getCourseDetails(params.id, locale);
  if (!rawCourse) notFound();
  const course = await withDecryptedIntroVideo(rawCourse);

  const accent = getAccent(course.accent);

  return (
    <div>
      <div className={`relative bg-gradient-to-b ${accent.gradient}`}>
        <div className="absolute end-4 top-4">
          <FavoriteButton favoritableType="course" favoritableId={course.id} locale={locale} />
        </div>
        <div className="container-page grid gap-8 py-10 text-white lg:grid-cols-[1.6fr,1fr] lg:py-14">
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs text-white/70">
              <Link href={`/${locale}/communities/${course.community.id}`} className="link-underline">
                {course.community.name}
              </Link>
            </div>
            <h1 className="max-w-2xl text-2xl font-bold leading-snug sm:text-3xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">{course.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/85">
              <span className="flex items-center gap-1.5">
                <Users2 size={14} />
                {course.studentsCount} {dict.common.students}
              </span>
              <span>{t(dict.communityDetails.lessonsCount, { count: course.lessonsCount })}</span>
              {course.ratingAvg > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star size={13} className="fill-accent-300 text-accent-300" />
                  {course.ratingAvg.toFixed(1)}
                </span>
              )}
            </div>

            <Link
              href={`/${locale}/communities/${course.community.id}`}
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-white/10 py-1.5 ps-1.5 pe-4 backdrop-blur hover:bg-white/15"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${accent.gradient}`}
              >
                {initials(course.community.name)}
              </span>
              <span className="text-sm font-medium">
                {t(dict.courseDetails.partOfCommunity, { name: course.community.name })}
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        <h2 className="mb-3 text-lg font-bold text-ink">{dict.courseDetails.about}</h2>
        <p className="max-w-2xl text-sm leading-7 text-ink/70">{course.description}</p>

        <div className="mt-10">
          <RealCourseAccess course={course} locale={locale} dict={dict} />
        </div>
      </div>
    </div>
  );
}
