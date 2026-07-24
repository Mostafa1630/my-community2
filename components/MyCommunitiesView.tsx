"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ChevronDown, Users2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { categories, getCommunityById, getCategoryById } from "@/lib/data";
import { formatDate } from "@/lib/format";
import Badge from "./Badge";
import CommunityCard from "./CommunityCard";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";

const PAGE_SIZE = 6;

export default function MyCommunitiesView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user, role, subscribeToCommunity } = useAuth();
  const store = usePlatformStore();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  const subscriptions = useMemo(() => {
    if (role !== "student") return [];
    const latestByCommunity = Array.from(
      store.communitySubscriptions.all
        .filter((s) => s.studentId === user?.id)
        .reduce((map, s) => {
          const prev = map.get(s.communityId);
          if (!prev || new Date(s.endsAt).getTime() > new Date(prev.endsAt).getTime()) {
            map.set(s.communityId, s);
          }
          return map;
        }, new Map<string, (typeof store.communitySubscriptions.all)[number]>())
        .values()
    );
    return latestByCommunity
      .map((subscription) => {
        const community =
          store.communities.all.find((c) => c.id === subscription.communityId) ??
          getCommunityById(subscription.communityId);
        return community ? { subscription, community } : null;
      })
      .filter((entry): entry is { subscription: (typeof latestByCommunity)[number]; community: NonNullable<ReturnType<typeof getCommunityById>> } => entry !== null);
  }, [role, store.communitySubscriptions.all, store.communities.all, user?.id]);

  function updateFilter(fn: () => void) {
    fn();
    setPage(1);
  }

  const filtered = useMemo(() => {
    let list = subscriptions;

    if (category !== "all") {
      list = list.filter((e) => getCategoryById(e.community.categoryId)?.slug === category);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((e) =>
        [e.community.nameEn, e.community.nameAr, e.community.descriptionEn ?? "", e.community.descriptionAr ?? ""].some(
          (field) => field.toLowerCase().includes(q)
        )
      );
    }

    return list;
  }, [subscriptions, category, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (role !== "student" || subscriptions.length === 0) {
    return (
      <EmptyState
        icon={Users2}
        title={dict.student.noCommunities}
        action={
          <Link
            href={`/${locale}`}
            className="rounded-full bg-primary-500 px-4 py-2 text-sm font-medium text-white"
          >
            {dict.student.browseCommunities}
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 text-ink/35 start-3.5" />
          <input
            value={query}
            onChange={(e) => updateFilter(() => setQuery(e.target.value))}
            placeholder={dict.common.searchPlaceholder}
            className="w-full rounded-full border border-line bg-surface py-3 text-sm outline-none focus:border-primary-400 ps-10 pe-4"
          />
        </div>
        <div className="relative flex items-center">
          <SlidersHorizontal size={15} className="pointer-events-none absolute text-primary-600 start-4" />
          <select
            value={category}
            onChange={(e) => updateFilter(() => setCategory(e.target.value))}
            className="appearance-none rounded-full border border-line bg-surface py-3 text-sm font-medium text-ink shadow-card outline-none transition hover:border-primary-300 focus:border-primary-400 ps-10 pe-9"
          >
            <option value="all">{dict.common.all}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {locale === "ar" ? c.nameAr : c.nameEn}
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute text-ink/40 end-3.5" />
        </div>
      </div>

      <p className="mb-5 text-sm text-ink/50">{t(dict.communities.resultsCount, { count: filtered.length })}</p>

      {paged.length === 0 ? (
        <EmptyState icon={Search} title={dict.communities.noResults} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map(({ community, subscription }) => {
            const expired = subscription.status !== "active" || new Date(subscription.endsAt).getTime() <= Date.now();
            return (
              <div key={community.id} className="flex flex-col gap-3">
                <CommunityCard community={community} locale={locale} dict={dict} />
                <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3">
                  <Badge tone={expired ? "danger" : "success"}>
                    {expired ? dict.communityDetails.subscriptionExpired : dict.common.active}
                  </Badge>
                  <span className="text-xs text-ink/45">
                    {t(dict.communityDetails.expiresOn, { date: formatDate(subscription.endsAt, locale) })}
                  </span>
                </div>
                {expired ? (
                  <button
                    onClick={() => subscribeToCommunity(community.id)}
                    className="flex w-full items-center justify-center rounded-full bg-primary-500 py-2 text-sm font-semibold text-white hover:bg-primary-600"
                  >
                    {dict.communityDetails.renewSubscription}
                  </button>
                ) : (
                  <Link
                    href={`/${locale}/communities/${community.slug}/feed`}
                    className="flex w-full items-center justify-center rounded-full border border-line py-2 text-sm font-medium text-ink/70 hover:border-primary-300 hover:text-primary-700"
                  >
                    {dict.communityDetails.enterCommunity}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} dict={dict} />
    </div>
  );
}
