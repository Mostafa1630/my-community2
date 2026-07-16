"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page,
  totalPages,
  onChange
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-10 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink/60 disabled:opacity-30 rtl:rotate-180"
        aria-label="previous"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`flex h-9 w-9 items-center justify-center rounded-full font-mono text-sm ${
            p === page ? "bg-primary-500 text-white" : "text-ink/60 hover:bg-primary-50"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink/60 disabled:opacity-30 rtl:rotate-180"
        aria-label="next"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
