"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n/t";
import FavoriteButton from "./FavoriteButton";
import EmptyState from "./EmptyState";
import Reveal from "./motion/Reveal";

type Tab = "communities" | "courses";

export default function FavoritesView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user, favorites, favoritesLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("communities");

  if (!user) {
    return <EmptyState icon={Heart} title={dict.common.empty} />;
  }

  const communityFavorites = favorites.filter((f) => f.type === "community");
  const courseFavorites = favorites.filter((f) => f.type === "course");
  const active = tab === "communities" ? communityFavorites : courseFavorites;

  return (
    <div>
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTab("communities")}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            tab === "communities" ? "border-primary-500 bg-primary-500 text-white" : "border-line text-ink/65"
          }`}
        >
          {dict.favorites.tabCommunities} ({communityFavorites.length})
        </button>
        <button
          onClick={() => setTab("courses")}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            tab === "courses" ? "border-primary-500 bg-primary-500 text-white" : "border-line text-ink/65"
          }`}
        >
          {dict.favorites.tabCourses} ({courseFavorites.length})
        </button>
      </div>

      {favoritesLoading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-ink/65">
          <Loader2 size={16} className="animate-spin" />
          {dict.common.empty}
        </div>
      ) : active.length === 0 ? (
        <EmptyState icon={Heart} title={dict.favorites.empty} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {active.map((fav, i) => (
            <Reveal key={fav.favoriteId} index={i}>
              {fav.type === "community" ? (
                <Link
                  href={`/${locale}/communities/${fav.id}`}
                  className="hover-lift group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card hover:border-primary-200"
                >
                  <div className="relative h-32 overflow-hidden bg-ink/5">
                    {fav.coverImage && (
                      <img
                        src={fav.coverImage}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                    <span className="absolute top-3 start-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                      {fav.categoryName}
                    </span>
                    <div className="absolute top-3 end-3">
                      <FavoriteButton favoritableType="community" favoritableId={fav.id} locale={locale} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-primary-700">
                      {fav.name}
                    </h3>
                    <p className="mt-1.5 text-sm text-ink/65">{fav.creator.name}</p>
                    <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-3.5">
                      <span className="whitespace-nowrap font-mono text-[11px] font-bold tracking-wide text-accent-700 sm:text-xs">
                        {fav.isFree ? dict.common.free : formatPrice(fav.finalPrice, locale)}
                      </span>
                      <span className="shrink-0 rounded-full border border-primary-200 px-2.5 py-1 text-[11px] font-medium text-primary-800 sm:text-xs">
                        {dict.common.viewDetails}
                      </span>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  href={`/${locale}/courses/${fav.id}`}
                  className="hover-lift group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card hover:border-primary-200"
                >
                  <div className="relative h-32 overflow-hidden bg-ink/5">
                    {fav.image && (
                      <img
                        src={fav.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute top-3 end-3">
                      <FavoriteButton favoritableType="course" favoritableId={fav.id} locale={locale} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 p-4">
                    <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-primary-700">
                      {fav.title}
                    </h3>
                    <p className="line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-ink/70">{fav.description}</p>
                    <p className="mt-auto pt-2 text-sm font-medium text-primary-700">
                      {t(dict.communityDetails.lessonsCount, { count: fav.lessonsCount })}
                    </p>
                  </div>
                </Link>
              )}
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
