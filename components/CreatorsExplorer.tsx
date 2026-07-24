"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import type { Creator, Category } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { getCommunityByCreatorId, getCategoryById } from "@/lib/data";
import CreatorCard from "./CreatorCard";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import Reveal from "./motion/Reveal";
import Slider from "./motion/Slider";

const PAGE_SIZE = 8;

export default function CreatorsExplorer({
  creators,
  categories,
  locale,
  dict
}: {
  creators: Creator[];
  categories: Category[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  // The seed catalog is too small to ever fill a second page — repeated here (display
  // only, not the underlying data) purely so pagination has something to paginate
  // through. Drop this once there are enough real creators.
  const displayEntries = useMemo(() => {
    const reps = creators.length > PAGE_SIZE ? [0] : [0, 1, 2];
    return reps.flatMap((rep) => creators.map((creator) => ({ creator, key: `${creator.id}-${rep}` })));
  }, [creators]);

  const filtered = useMemo(() => {
    let list = displayEntries.filter((e) => e.creator.status === "active");

    if (category !== "all") {
      list = list.filter((e) => {
        const community = getCommunityByCreatorId(e.creator.id);
        return community ? getCategoryById(community.categoryId)?.slug === category : false;
      });
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((e) =>
        [e.creator.name, e.creator.bioEn, e.creator.bioAr].some((field) => field.toLowerCase().includes(q))
      );
    }

    return list;
  }, [displayEntries, category, query]);

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

      <p className="mb-5 text-sm text-ink/50">{t(dict.creatorsPage.resultsCount, { count: filtered.length })}</p>

      {paged.length === 0 ? (
        <EmptyState icon={Search} title={dict.creatorsPage.noResults} />
      ) : (
        <>
          <div className="sm:hidden">
            <Slider
              items={paged.map(({ creator, key }) => (
                <CreatorCard key={key} creator={creator} locale={locale} dict={dict} />
              ))}
              itemClassName="w-[calc((100%_-_1rem)/1.5)]"
            />
          </div>
          <div className="hidden sm:grid sm:grid-cols-2 gap-5 lg:grid-cols-4">
            {paged.map(({ creator, key }, i) => (
              <Reveal key={key} index={i}>
                <CreatorCard creator={creator} locale={locale} dict={dict} />
              </Reveal>
            ))}
          </div>
        </>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} dict={dict} />
    </div>
  );
}
