"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import type { Category } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { getCommunities, type CommunitiesPage } from "@/lib/api-content";
import RealCommunityCard from "./RealCommunityCard";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import Reveal from "./motion/Reveal";
import Slider from "./motion/Slider";

// "newest" leaves the API's own order alone (there's no created_at on the
// community summary to re-sort by client-side); price-asc/desc genuinely
// re-sort whichever page is currently loaded.
type SortKey = "newest" | "price-asc" | "price-desc";

export default function CommunitiesExplorer({
  initialCommunities,
  categories,
  locale,
  dict
}: {
  initialCommunities: CommunitiesPage;
  categories: Category[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [category, setCategory] = useState("all");
  const [communitiesPage, setCommunitiesPage] = useState(initialCommunities);
  const [page, setPage] = useState(initialCommunities.currentPage);
  const [loading, setLoading] = useState(false);

  // GET /communities takes `page` and an optional `category_id` — both are
  // real, server-side filters, unlike creators (which had neither). Search
  // and price-sort stay client-side over whichever page is loaded, since
  // there's no search/sort query param documented.
  useEffect(() => {
    if (page === initialCommunities.currentPage && category === "all") {
      setCommunitiesPage(initialCommunities);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCommunities(locale, { page, categoryId: category === "all" ? undefined : category }).then((result) => {
      if (!cancelled) {
        setCommunitiesPage(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category, locale]);

  function updateFilter(fn: () => void) {
    fn();
    setPage(1);
  }

  const filtered = useMemo(() => {
    let list = communitiesPage.items;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((c) => [c.name, c.creator.name, c.categoryName].some((field) => field.toLowerCase().includes(q)));
    }

    if (sort !== "newest") {
      list = [...list].sort((a, b) => (sort === "price-asc" ? a.finalPrice - b.finalPrice : b.finalPrice - a.finalPrice));
    }

    return list;
  }, [communitiesPage.items, query, sort]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 text-ink/35 start-3.5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.common.searchPlaceholder}
            className="w-full rounded-full border border-line bg-surface py-3 text-sm outline-none focus:border-primary-400 ps-10 pe-4"
          />
        </div>
        <div className="relative flex items-center">
          <SlidersHorizontal size={15} className="pointer-events-none absolute text-primary-600 start-4" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="appearance-none rounded-full border border-line bg-surface py-3 text-sm font-medium text-ink shadow-card outline-none transition hover:border-primary-300 focus:border-primary-400 ps-10 pe-9"
          >
            <option value="newest">{dict.communities.sortNewest}</option>
            <option value="price-asc">{dict.communities.sortPriceAsc}</option>
            <option value="price-desc">{dict.communities.sortPriceDesc}</option>
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute text-ink/40 end-3.5" />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => updateFilter(() => setCategory("all"))}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
            category === "all"
              ? "border-primary-500 bg-primary-500 text-white"
              : "border-line text-ink/60 hover:border-primary-300"
          }`}
        >
          {dict.common.all}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => updateFilter(() => setCategory(c.id))}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              category === c.id
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-line text-ink/60 hover:border-primary-300"
            }`}
          >
            {locale === "ar" ? c.nameAr : c.nameEn}
          </button>
        ))}
      </div>

      <p className="mb-5 text-sm text-ink/50">{t(dict.communities.resultsCount, { count: communitiesPage.total })}</p>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title={dict.communities.noResults} />
      ) : (
        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
          <div className="sm:hidden">
            <Slider
              items={filtered.map((community) => (
                <RealCommunityCard key={community.id} community={community} locale={locale} dict={dict} />
              ))}
              itemClassName="w-[calc((100%_-_1rem)/1.5)]"
            />
          </div>
          <div className="hidden sm:grid sm:grid-cols-2 gap-5 lg:grid-cols-4">
            {filtered.map((community, i) => (
              <Reveal key={community.id} index={i}>
                <RealCommunityCard community={community} locale={locale} dict={dict} />
              </Reveal>
            ))}
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={communitiesPage.lastPage} onChange={setPage} dict={dict} />
    </div>
  );
}
