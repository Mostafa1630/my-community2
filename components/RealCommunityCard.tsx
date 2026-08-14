"use client";

import Link from "next/link";
import { Users2, BookOpen, Lock, Unlock } from "lucide-react";
import type { CommunitySummary } from "@/lib/api-types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { getAccent, initials } from "@/lib/accents";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import FavoriteButton from "./FavoriteButton";
import SubscriptionCountdown from "./SubscriptionCountdown";

export default function RealCommunityCard({
  community,
  locale,
  dict,
  priority = false,
  subscribed = false,
}: {
  community: CommunitySummary;
  locale: Locale;
  dict: Dictionary;

  priority?: boolean;

  subscribed?: boolean;
}) {
  const { settings } = useAuth();
  const accent = getAccent(community.accent);
  const hasDiscount = !community.isFree && community.discountPercentage > 0;

  return (
    <Link
      href={`/${locale}/communities/${community.id}`}
      className="hover-lift group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card hover:border-primary-200"
    >
      <div className="relative h-52 overflow-hidden">
        {community.coverImage ? (
          <img
            src={community.coverImage}
            alt={community.name}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${accent.gradient}`}
          >
            <span className="seal-ring h-14 w-14 bg-white/15 text-white text-lg font-bold">
              {initials(community.name)}
            </span>
          </div>
        )}
        {community.categoryName && (
          <span className="absolute top-3 start-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
            {community.categoryName}
          </span>
        )}
        <div className="absolute top-3 end-3 flex flex-col items-end gap-1.5">
          <FavoriteButton
            favoritableType="community"
            favoritableId={community.id}
            locale={locale}
            initialIsFavorite={community.isFavorite}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-primary-700 sm:min-h-[2.75rem] sm:text-base">
          {community.name}
        </h3>

        <div className="mt-1.5 flex items-center gap-2">
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ${accent.solid}`}
          >
            {initials(community.creator.name)}
          </span>
          <span className="text-sm text-ink/65">{community.creator.name}</span>
        </div>

        <div className="mt-4 flex items-center gap-3 text-[11px] text-ink/65 sm:text-xs">
          <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
            <BookOpen size={12} className="shrink-0" />
            {community.coursesCount} {dict.common.courses}
          </span>
          <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
            <Users2 size={12} className="shrink-0" />
            {community.subscriptionsCount} {dict.communities.subscribersLabel}
          </span>
        </div>

        <div className="mt-2.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              community.type === "private"
                ? "bg-danger/10 text-danger"
                : "bg-primary-500/10 text-primary-700"
            }`}
          >
            {community.type === "private" ? (
              <Lock size={11} />
            ) : (
              <Unlock size={11} />
            )}

            {community.type === "private"
              ? dict.communities.privateBadge
              : dict.communities.publicBadge}
          </span>
        </div>

        {subscribed && community.subscriptionStartAt && community.subscriptionEndAt ? (
          <div className="mt-5 border-t border-line pt-3.5">
            <SubscriptionCountdown
              startAt={community.subscriptionStartAt}
              endAt={community.subscriptionEndAt}
              dict={dict}
            />
          </div>
        ) : (
          <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-3.5">
            <div className="flex min-w-0 flex-wrap items-baseline gap-1.5">
              <span className="whitespace-nowrap font-mono text-sm font-black tracking-tight text-accent-700 sm:text-base">
                {community.isFree
                  ? dict.communities.freeBadge
                  : formatPrice(community.finalPrice, locale, settings?.currency)}
              </span>
              {hasDiscount && (
                <>
                  <span className="font-mono text-xs text-ink/55 line-through">
                    {formatPrice(community.subscriptionPrice, locale, settings?.currency)}
                  </span>
                  <span className="rounded-full bg-danger/10 px-1.5 py-0.5 text-[10px] font-bold text-danger">
                    -{community.discountPercentage}%
                  </span>
                </>
              )}
            </div>
            <span className="shrink-0 whitespace-nowrap rounded-full border border-primary-200 px-2.5 py-1 text-center text-[11px] font-medium text-primary-800 transition-colors duration-200 group-hover:border-primary-300 group-hover:bg-primary-50 sm:px-3 sm:text-xs">
              {dict.common.viewDetails}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
