"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Community, Category } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import CommunityCard from "./CommunityCard";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import Reveal from "./motion/Reveal";

const PAGE_SIZE = 8;
type SortKey = "newest" | "price-asc" | "price-desc";

export default function CommunitiesExplorer({
  communities,
  categories,
  locale,
  dict,
  initialCategory
}: {
  communities: Community[];
  categories: Category[];
  locale: Locale;
  dict: Dictionary;
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory ?? "all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const filtered = useMemo(() => {
    let list = communities.filter((c) => c.status === "active");

    if (category !== "all") {
      list = list.filter((c) => categoryMap.get(c.categoryId)?.slug === category);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((c) =>
        [c.nameEn, c.nameAr, c.descriptionEn ?? "", c.descriptionAr ?? ""].some((field) =>
          field.toLowerCase().includes(q)
        )
      );
    }

    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return a.subscriptionPrice - b.subscriptionPrice;
      if (sort === "price-desc") return b.subscriptionPrice - a.subscriptionPrice;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [communities, category, query, sort, categoryMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function updateFilter(fn: () => void) {
    fn();
    setPage(1);
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
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-ink/40" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border border-line bg-surface px-3 py-3 text-sm text-ink/70 outline-none focus:border-primary-400"
          >
            <option value="newest">{dict.communities.sortNewest}</option>
            <option value="price-asc">{dict.communities.sortPriceAsc}</option>
            <option value="price-desc">{dict.communities.sortPriceDesc}</option>
          </select>
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
            onClick={() => updateFilter(() => setCategory(c.slug))}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              category === c.slug
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-line text-ink/60 hover:border-primary-300"
            }`}
          >
            {locale === "ar" ? c.nameAr : c.nameEn}
          </button>
        ))}
      </div>

      <p className="mb-5 text-sm text-ink/50">{t(dict.communities.resultsCount, { count: filtered.length })}</p>

      {paged.length === 0 ? (
        <EmptyState icon={Search} title={dict.communities.noResults} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {paged.map((community, i) => (
            <Reveal key={community.id} index={i}>
              <CommunityCard community={community} locale={locale} dict={dict} />
            </Reveal>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
