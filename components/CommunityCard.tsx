import Link from "next/link";
import { Users2, BookOpen } from "lucide-react";
import type { Community } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { getAccent, initials } from "@/lib/accents";
import { getCreatorById, getCategoryById, getCoursesByCommunity, communitySubscriptions } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import Badge from "./Badge";
import FavoriteButton from "./FavoriteButton";

export default function CommunityCard({
  community,
  locale,
  dict
}: {
  community: Community;
  locale: Locale;
  dict: Dictionary;
}) {
  const creator = getCreatorById(community.creatorId);
  const category = getCategoryById(community.categoryId);
  const accent = getAccent(creator?.avatarAccent ?? "ink");
  const name = locale === "ar" ? community.nameAr : community.nameEn;
  const categoryName = category ? (locale === "ar" ? category.nameAr : category.nameEn) : "";
  const courseCount = getCoursesByCommunity(community.id).filter((c) => c.status === "published").length;
  const subscribersCount = communitySubscriptions.filter(
    (s) => s.communityId === community.id && s.status === "active" && new Date(s.endsAt).getTime() > Date.now()
  ).length;

  return (
    <Link
      href={`/${locale}/communities/${community.slug}`}
      className="hover-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card hover:border-primary-200"
    >
      <div className="relative h-52 overflow-hidden">
        {community.coverImage ? (
          <img
            src={community.coverImage}
            alt={name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${accent.gradient}`}>
            <span className="seal-ring h-14 w-14 border-white/50 text-white text-lg font-bold">{initials(name)}</span>
          </div>
        )}
        {category && (
          <span className="absolute top-3 start-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
            {categoryName}
          </span>
        )}
        <div className="absolute top-3 end-3 flex flex-col items-end gap-1.5">
          <FavoriteButton favoritableType="community" favoritableId={community.id} />
          {community.status === "inactive" && <Badge tone="pending">{dict.common.inactive}</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-ink transition-colors group-hover:text-primary-700">
          {name}
        </h3>

        {creator && (
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ${accent.solid}`}
            >
              {initials(creator.name)}
            </span>
            <span className="text-sm text-ink/60">{creator.name}</span>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-1.5 text-xs text-ink/60 sm:flex-row sm:items-center sm:gap-3">
          <span className="flex items-center gap-1">
            <BookOpen size={13} />
            {courseCount} {dict.common.courses}
          </span>
          <span className="flex items-center gap-1">
            <Users2 size={13} />
            {subscribersCount} {dict.communities.subscribersLabel}
          </span>
        </div>

        <div className="mt-5 flex flex-col items-stretch gap-2 border-t border-line pt-3.5 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-xs font-bold tracking-wide text-accent-600">
            {community.isFree ? dict.communities.freeBadge : formatPrice(community.subscriptionPrice, locale)}
          </span>
          <span className="rounded-full border border-primary-200 px-3 py-1 text-center text-xs font-medium text-primary-800 transition-colors duration-200 group-hover:border-primary-300 group-hover:bg-primary-50">
            {dict.common.viewDetails}
          </span>
        </div>
      </div>
    </Link>
  );
}
