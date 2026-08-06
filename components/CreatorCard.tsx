import Link from "next/link";
import { UserRound } from "lucide-react";
import type { CreatorSummary } from "@/lib/api-types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { getAccent, initials } from "@/lib/accents";

export default function CreatorCard({
  creator,
  locale,
  dict
}: {
  creator: CreatorSummary;
  locale: Locale;
  dict: Dictionary;
}) {
  const accent = getAccent(creator.accent);

  return (
    <Link
      href={`/${locale}/creators/${creator.id}`}
      className="hover-lift group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card hover:border-primary-200"
    >
      <div className="relative h-16 w-full overflow-hidden">
        {creator.coverImage ? (
          <img src={creator.coverImage} alt="" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${accent.gradient}`} />
        )}
      </div>

      <div className="flex flex-1 flex-col items-center px-5 pb-6 text-center">
        <span className="relative z-10 -mt-8 mb-3 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-surface shadow-card transition-transform duration-300 group-hover:scale-105">
          {creator.profileImage ? (
            <img src={creator.profileImage} alt={creator.name} decoding="async" className="h-full w-full object-cover" />
          ) : (
            <span className={`flex h-full w-full items-center justify-center bg-gradient-to-br text-lg font-bold text-white ${accent.gradient}`}>
              {initials(creator.name)}
            </span>
          )}
        </span>
        <h2 className="text-base font-semibold text-ink transition-colors group-hover:text-primary-700">{creator.name}</h2>
        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-ink/70">{creator.bio}</p>
        <span className="mt-4 flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
          <UserRound size={13} />
          {dict.creator.viewProfile}
        </span>
      </div>
    </Link>
  );
}
