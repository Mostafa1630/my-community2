"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { getCreators, type CreatorsPage } from "@/lib/api-content";
import CreatorCard from "./CreatorCard";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import Reveal from "./motion/Reveal";
import Slider from "./motion/Slider";

// No `categories` prop here on purpose — GET /creators and /creators/top
// return name/bio/images only, with no category or community association at
// all, so a category filter has nothing to filter *by* client-side. Showing
// one anyway would just be a dropdown that silently does nothing when
// changed. If the backend later adds a category/community field to these
// responses (or a query param), that's the point to bring the filter back.
export default function CreatorsExplorer({
  initialCreators,
  locale,
  dict
}: {
  initialCreators: CreatorsPage;
  locale: Locale;
  dict: Dictionary;
}) {
  const [query, setQuery] = useState("");
  const [creatorsPage, setCreatorsPage] = useState(initialCreators);
  const [page, setPage] = useState(initialCreators.currentPage);
  const [loading, setLoading] = useState(false);

  // GET /creators only takes a `page` param (no documented search/category
  // query params) — page navigation hits the real API for that page's items;
  // search and category are refined client-side over whatever page is
  // currently loaded, not the full catalog. If the backend adds filter
  // params later, this is the one spot that needs to pass them through.
  useEffect(() => {
    if (page === initialCreators.currentPage) {
      setCreatorsPage(initialCreators);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCreators(locale, page).then((result) => {
      if (!cancelled) {
        setCreatorsPage(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, locale]);

  const filtered = useMemo(() => {
    let list = creatorsPage.items;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((c) => [c.name, c.bio].some((field) => field.toLowerCase().includes(q)));
    }

    return list;
  }, [creatorsPage.items, query]);

  return (
    <div>
      <div className="mb-8">
        <div className="relative">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 text-ink/35 start-3.5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.common.searchPlaceholder}
            className="w-full rounded-full border border-line bg-surface py-3 text-sm outline-none focus:border-primary-400 ps-10 pe-4"
          />
        </div>
      </div>

      <p className="mb-5 text-sm text-ink/50">{t(dict.creatorsPage.resultsCount, { count: creatorsPage.total })}</p>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title={dict.creatorsPage.noResults} />
      ) : (
        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
          <div className="sm:hidden">
            <Slider
              items={filtered.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} locale={locale} dict={dict} />
              ))}
              itemClassName="w-[calc((100%_-_1rem)/1.5)]"
            />
          </div>
          <div className="hidden sm:grid sm:grid-cols-2 gap-5 lg:grid-cols-4">
            {filtered.map((creator, i) => (
              <Reveal key={creator.id} index={i}>
                <CreatorCard creator={creator} locale={locale} dict={dict} />
              </Reveal>
            ))}
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={creatorsPage.lastPage} onChange={setPage} dict={dict} />
    </div>
  );
}
