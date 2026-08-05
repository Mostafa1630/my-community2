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
// community summary to re-sort by client-side); every other key genuinely
// re-sorts whichever page is currently loaded, over fields the list
// response already carries (price, ratingAvg, coursesCount,
// subscriptionsCount) — no server-side sort param is documented.
type SortKey =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "rating-asc"
  | "courses-desc"
  | "courses-asc"
  | "students-desc"
  | "students-asc";

const CATEGORY_PAGE_SIZE = 5;

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
  const [visibleCategoryCount, setVisibleCategoryCount] = useState(CATEGORY_PAGE_SIZE);

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
      const comparators: Record<Exclude<SortKey, "newest">, (a: (typeof list)[number], b: (typeof list)[number]) => number> = {
        "price-asc": (a, b) => a.finalPrice - b.finalPrice,
        "price-desc": (a, b) => b.finalPrice - a.finalPrice,
        "rating-desc": (a, b) => b.ratingAvg - a.ratingAvg,
        "rating-asc": (a, b) => a.ratingAvg - b.ratingAvg,
        "courses-desc": (a, b) => b.coursesCount - a.coursesCount,
        "courses-asc": (a, b) => a.coursesCount - b.coursesCount,
        "students-desc": (a, b) => b.subscriptionsCount - a.subscriptionsCount,
        "students-asc": (a, b) => a.subscriptionsCount - b.subscriptionsCount
      };
      list = [...list].sort(comparators[sort]);
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
            aria-label={dict.communities.sortLabel}
            className="appearance-none rounded-full border border-line bg-surface py-3 text-sm font-medium text-ink shadow-card outline-none transition hover:border-primary-300 focus:border-primary-400 ps-10 pe-9"
          >
            <option value="newest">{dict.communities.sortNewest}</option>
            <option value="price-asc">{dict.communities.sortPriceAsc}</option>
            <option value="price-desc">{dict.communities.sortPriceDesc}</option>
            <option value="rating-desc">{dict.communities.sortRatingDesc}</option>
            <option value="rating-asc">{dict.communities.sortRatingAsc}</option>
            <option value="courses-desc">{dict.communities.sortCoursesDesc}</option>
            <option value="courses-asc">{dict.communities.sortCoursesAsc}</option>
            <option value="students-desc">{dict.communities.sortStudentsDesc}</option>
            <option value="students-asc">{dict.communities.sortStudentsAsc}</option>
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute text-ink/65 end-3.5" />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => updateFilter(() => setCategory("all"))}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
            category === "all"
              ? "border-primary-500 bg-primary-500 text-white"
              : "border-line text-ink/65 hover:border-primary-300"
          }`}
        >
          {dict.common.all}
        </button>
        {categories.slice(0, visibleCategoryCount).map((c) => (
          <button
            key={c.id}
            onClick={() => updateFilter(() => setCategory(c.id))}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              category === c.id
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-line text-ink/65 hover:border-primary-300"
            }`}
          >
            {locale === "ar" ? c.nameAr : c.nameEn}
          </button>
        ))}
        {visibleCategoryCount < categories.length && (
          <button
            onClick={() => setVisibleCategoryCount((n) => n + CATEGORY_PAGE_SIZE)}
            className="rounded-full border border-dashed border-line px-3.5 py-1.5 text-xs font-medium text-primary-700 hover:border-primary-300"
          >
            {dict.common.loadMore}
          </button>
        )}
      </div>

      <p className="mb-5 text-sm text-ink/65">{t(dict.communities.resultsCount, { count: communitiesPage.total })}</p>

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
