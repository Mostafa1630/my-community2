"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/getDictionary";

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
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

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
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-medium transition ${
              p === page ? "bg-primary-500 text-white shadow-raised" : "text-ink/60 hover:bg-primary-50 hover:text-primary-700"
            }`}
          >
            {p}
          </button>
        ))}
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
