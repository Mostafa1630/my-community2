import Link from "next/link";
import { BookOpen, Users2 } from "lucide-react";
import type { CourseSummary } from "@/lib/api-types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { getAccent, initials } from "@/lib/accents";
import { formatPrice } from "@/lib/format";

// Same visual system as RealCommunityCard — the two are meant to read as
// one family of "content" cards across the site, just one links to a
// community and this one links to a single course.
export default function RealCourseCard({
  course,
  locale,
  dict,
  priority = false
}: {
  course: CourseSummary;
  locale: Locale;
  dict: Dictionary;
  priority?: boolean;
}) {
  const accent = getAccent(course.accent);

  return (
    <Link
      href={`/${locale}/courses/${course.id}`}
      className="hover-lift group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card hover:border-primary-200"
    >
      <div className="relative h-52 overflow-hidden">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${accent.gradient}`}>
            <span className="seal-ring h-14 w-14 bg-white/15 text-lg font-bold text-white">{initials(course.title)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-primary-700 sm:min-h-[2.75rem] sm:text-base">
          {course.title}
        </h3>

        {course.creator && (
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ${accent.solid}`}
            >
              {initials(course.creator.name)}
            </span>
            <span className="text-sm text-ink/65">{course.creator.name}</span>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3 text-[11px] text-ink/65 sm:text-xs">
          <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
            <BookOpen size={12} className="shrink-0" />
            {course.lessonsCount} {dict.common.lessons}
          </span>
          <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
            <Users2 size={12} className="shrink-0" />
            {course.studentsCount} {dict.common.students}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-3.5">
          <span className="whitespace-nowrap font-mono text-[11px] font-bold tracking-wide text-accent-700 sm:text-xs">
            {course.isFree ? dict.communities.freeBadge : formatPrice(course.finalPrice, locale)}
          </span>
          <span className="shrink-0 whitespace-nowrap rounded-full border border-primary-200 px-2.5 py-1 text-center text-[11px] font-medium text-primary-800 transition-colors duration-200 group-hover:border-primary-300 group-hover:bg-primary-50 sm:px-3 sm:text-xs">
            {dict.common.viewDetails}
          </span>
        </div>
      </div>
    </Link>
  );
}
