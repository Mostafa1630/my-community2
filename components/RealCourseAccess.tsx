"use client";

import Link from "next/link";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import type { CourseDetails } from "@/lib/api-types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/format";
import VideoPlayer from "./VideoPlayer";

// Real per-lesson access control lives entirely on the frontend for the
// lock/unlock display here — GET /courses/details/{id} is a public endpoint
// that only tells us each lesson's title/order/is_free, never its real video
// url. The real url only ever comes from the authenticated GET /lessons/{id},
// fetched by the dedicated per-lesson watch page this list links out to
// (never inline here) — see LessonWatchView for why.
export default function RealCourseAccess({
  course,
  locale,
  dict
}: {
  course: CourseDetails;
  locale: Locale;
  dict: Dictionary;
}) {
  const { hydrated, role, user, ownsCourseStandalone, myAccessLoaded, settings } = useAuth();

  // Confirmed live: a community subscription does NOT unlock a course's
  // locked lessons on its own — GET /lessons/{id} for a non-free lesson
  // still 403s for a student who's subscribed to the course's community but
  // never enrolled in the course itself (POST /courses/{id}/enroll). Each
  // course has its own independent access, gated by ownsCourseStandalone —
  // community membership and course ownership are two separate things.
  const unlocked =
    (role === "creator" && user?.id === course.creator.id) ||
    role === "admin" ||
    (role === "student" && ownsCourseStandalone(course.id));

  // Same flicker as the subscribe card: ownsCourseStandalone reads a cached
  // set that's still empty for a moment after hydration, while it loads —
  // showing "locked" until that resolves rather than flashing unlocked/locked.
  const accessLoading = !hydrated || (role === "student" && !myAccessLoaded);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr,1fr]">
      <div>
        <h2 className="mb-3 text-lg font-bold text-ink">{dict.courseDetails.curriculum}</h2>
        {course.introVideo ? (
          <VideoPlayer url={course.introVideo} title={course.title} />
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-2xl border border-line bg-ink/5 text-sm text-ink/65">
            {dict.common.empty}
          </div>
        )}

        <div className="mt-5 divide-y divide-line rounded-2xl border border-line bg-surface shadow-card">
          {course.lessons.map((lesson, i) => {
            const open = (unlocked && !accessLoading) || lesson.isFree;
            const row = (
              <>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 font-mono text-xs font-semibold text-primary-700">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{lesson.title}</span>
                  {!open && <span className="block text-xs text-ink/65">{dict.courseDetails.lessonLocked}</span>}
                </span>
                {open ? (
                  <PlayCircle size={18} className="text-primary-500" />
                ) : (
                  <Lock size={16} className="text-ink/65" />
                )}
              </>
            );
            return open ? (
              <Link
                key={lesson.id}
                href={`/${locale}/courses/${course.id}/lessons/${lesson.id}`}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-start transition hover:bg-primary-50/60"
              >
                {row}
              </Link>
            ) : (
              <span
                key={lesson.id}
                className="flex w-full cursor-not-allowed items-center gap-3 px-4 py-3.5 text-start opacity-70"
              >
                {row}
              </span>
            );
          })}
        </div>
      </div>

      <div>
        <div className="sticky top-24 rounded-2xl border border-line bg-surface p-5 shadow-card">
          {accessLoading ? (
            <div className="h-[46px] w-full animate-pulse rounded-full bg-line/60" />
          ) : unlocked ? (
            <p className="flex items-center gap-1.5 text-sm font-medium text-success">
              <CheckCircle2 size={16} />
              {dict.courseDetails.alreadyOwned}
            </p>
          ) : (
            <>
              <p className="flex items-center gap-1.5 text-sm text-ink/65">
                <Lock size={15} />
                {dict.courseDetails.lessonLocked}
              </p>
              {/* Enrolling in this course specifically (not subscribing to its
                  community) is the only thing that unlocks it — confirmed live,
                  a community subscription alone doesn't unlock a locked lesson. */}
              {role === "student" && (
                <Link
                  href={`/${locale}/courses/${course.id}/checkout`}
                  className="mt-4 flex w-full items-center justify-center rounded-full bg-accent-500 py-3 text-sm font-semibold text-ink transition hover:bg-accent-400"
                >
                  {course.isFree
                    ? dict.communityDetails.freeSubscribe
                    : t(dict.courseDetails.buyThisCourseFor, { price: formatPrice(course.finalPrice, locale, settings?.currency) })}
                </Link>
              )}
              <p className="mt-3 text-center text-xs text-ink/50">
                {t(dict.courseDetails.partOfCommunity, { name: course.community.name })}
              </p>
              <Link
                href={`/${locale}/communities/${course.community.id}`}
                className="mt-2 flex w-full items-center justify-center rounded-full border border-line py-3 text-sm font-semibold text-ink/70 transition hover:border-primary-300 hover:text-primary-700"
              >
                {dict.communityDetails.backToCommunity}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
