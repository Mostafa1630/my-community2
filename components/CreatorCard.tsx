import Link from "next/link";
import { BadgeCheck, BookOpen } from "lucide-react";
import type { Creator } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { getAccent, initials } from "@/lib/accents";
import { getCoursesByCreator } from "@/lib/data";

export default function CreatorCard({
  creator,
  locale,
  dict
}: {
  creator: Creator;
  locale: Locale;
  dict: Dictionary;
}) {
  const accent = getAccent(creator.avatarAccent);
  const courseCount = getCoursesByCreator(creator.id).filter((c) => c.status === "published").length;
  const bio = locale === "ar" ? creator.bioAr : creator.bioEn;

  return (
    <Link
      href={`/${locale}/creators/${creator.slug}`}
      className="hover-lift group flex h-full flex-col items-center rounded-2xl border border-line bg-surface p-6 text-center shadow-card hover:border-primary-200"
    >
      <span
        className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white transition-transform duration-300 group-hover:scale-105 ${accent.gradient}`}
      >
        {initials(creator.name)}
      </span>
      <div className="mt-3 flex items-center gap-1.5">
        <h3 className="text-base font-semibold text-ink transition-colors group-hover:text-primary-700">{creator.name}</h3>
        {creator.verified && <BadgeCheck size={16} className="text-primary-500" />}
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-5 text-ink/70">{bio}</p>
      <span className="mt-4 flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
        <BookOpen size={13} />
        {courseCount} {dict.common.courses}
      </span>
    </Link>
  );
}
