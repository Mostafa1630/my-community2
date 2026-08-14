import Link from "next/link";
import { ArrowLeft, ArrowRight, Users2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { dir } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { CommunitySummary } from "@/lib/api-types";
import { getAccent, initials } from "@/lib/accents";

export const FEED_COLUMN_CLASS = "mx-auto w-full max-w-4xl";

export default function CommunityFeedHeader({
  community,
  locale,
  dict,
  feedSubtitle,
}: {
  community: CommunitySummary;
  locale: Locale;
  dict: Dictionary;
  feedSubtitle: string;
}) {
  const BackIcon = dir(locale) === "rtl" ? ArrowRight : ArrowLeft;
  const accent = getAccent(community.accent);

  return (
    <header className={FEED_COLUMN_CLASS}>
      <Link
        href={`/${locale}/communities/${community.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
      >
        <BackIcon size={16} />
        {dict.communityDetails.backToCommunity}
      </Link>

      <div className="mt-5 flex items-start gap-4 sm:mt-6 sm:gap-5">
        <div className="h-[4.25rem] w-[4.25rem] shrink-0 overflow-hidden rounded-2xl border border-line bg-paper sm:h-[5rem] sm:w-[5rem]">
          {community.coverImage ? (
            <img src={community.coverImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${accent.solid}`}>
              <span className="text-sm font-bold text-white">{initials(community.name)}</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 text-start">
          <h1 className="text-xl font-bold leading-snug text-ink sm:text-2xl">{community.name}</h1>
          <p className="mt-1.5 text-sm leading-6 text-ink/65">{feedSubtitle}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink/55">
            <span>{community.categoryName}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Users2 size={12} />
              {community.subscriptionsCount} {dict.communities.subscribersLabel}
            </span>
            <span aria-hidden>·</span>
            <Link
              href={`/${locale}/creators/${community.creator.id}`}
              className="font-medium text-ink/70 hover:text-primary-700"
            >
              {community.creator.name}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
