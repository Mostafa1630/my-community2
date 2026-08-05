"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/getDictionary";

// Compact page list: page 1, page 2, an ellipsis, the current page (if it
// isn't already 1/2/last), another ellipsis, then the last page — instead of
// a button per page, which stops being usable once there are dozens of
// pages (communities/creators/coupons lists can all get there).
function getCompactPages(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pageSet = new Set<number>([1, 2, totalPages]);
  if (page > 2 && page < totalPages) pageSet.add(page);
  const sorted = Array.from(pageSet).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("ellipsis");
    result.push(sorted[i]);
  }
  return result;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
  dict
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  dict: Dictionary;
}) {
  if (totalPages <= 1) return null;
  const pages = getCompactPages(page, totalPages);

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink/70 shadow-card transition hover:border-primary-300 hover:text-primary-700 disabled:pointer-events-none disabled:opacity-30"
        aria-label="previous"
      >
        <ChevronLeft size={16} className="rtl:rotate-180" />
        <span className="hidden sm:inline">{dict.common.previous}</span>
      </button>

      <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-card">
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-ink/65">
              <MoreHorizontal size={15} />
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-medium transition ${
                p === page ? "bg-primary-500 text-white shadow-raised" : "text-ink/65 hover:bg-primary-50 hover:text-primary-700"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink/70 shadow-card transition hover:border-primary-300 hover:text-primary-700 disabled:pointer-events-none disabled:opacity-30"
        aria-label="next"
      >
        <span className="hidden sm:inline">{dict.common.next}</span>
        <ChevronRight size={16} className="rtl:rotate-180" />
      </button>
    </div>
  );
}
