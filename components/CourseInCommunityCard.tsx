import Link from "next/link";
import { PlayCircle } from "lucide-react";
import type { Community, Course } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { getAccent } from "@/lib/accents";
import FavoriteButton from "./FavoriteButton";

export default function CourseInCommunityCard({
  course,
  community,
  locale,
  dict
}: {
  course: Course;
  community?: Community;
  locale: Locale;
  dict: Dictionary;
}) {
  const accent = getAccent(course.accent);
  const title = locale === "ar" ? course.titleAr : course.titleEn;
  const description = locale === "ar" ? course.descAr : course.descEn;
  const href = community
    ? `/${locale}/communities/${community.slug}/courses/${course.slug}`
    : `/${locale}/communities`;

  return (
    <Link
      href={href}
      className="hover-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card hover:border-primary-200"
    >
      <div className="relative h-36 overflow-hidden">
        {course.image ? (
          <img
            src={course.image}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${accent.gradient}`}>
            <span className="seal-ring h-12 w-12 border-white/50 text-white transition-transform duration-300 group-hover:scale-110">
              <PlayCircle size={22} className="text-white" />
            </span>
          </div>
        )}
        <div className="absolute top-3 end-3">
          <FavoriteButton favoritableType="course" favoritableId={course.id} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-primary-700">
          {title}
        </h3>
        {description && <p className="line-clamp-2 text-xs leading-5 text-ink/70">{description}</p>}
        <p className="mt-auto pt-2 text-sm font-medium text-primary-700">
          {t(dict.communityDetails.lessonsCount, { count: course.lessons.length })}
        </p>
      </div>
    </Link>
  );
}
