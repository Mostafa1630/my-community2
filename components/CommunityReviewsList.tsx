"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { CommunityReview } from "@/lib/api-types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { initials } from "@/lib/accents";

const PAGE_SIZE = 5;

export default function CommunityReviewsList({
  reviews,
  dict,
  embedded = false,
}: {
  reviews: CommunityReview[];
  locale: Locale;
  dict: Dictionary;
  embedded?: boolean;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  return (
    <div className={embedded ? "space-y-3" : "mt-4 space-y-3"}>
      {reviews.slice(0, visibleCount).map((review) => (
        <div
          key={review.id}
          className={`flex gap-3 p-4 ${
            embedded
              ? "rounded-xl bg-paper/70"
              : "rounded-xl border border-line bg-surface"
          }`}
        >
          <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-ink/10">
            {review.user.profileImage ? (
              <img
                src={review.user.profileImage}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs font-bold text-ink/65">
                {initials(review.user.name)}
              </span>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink">
                {review.user.name}
              </p>
              <span className="shrink-0 text-[11px] text-ink/65">
                {review.createdAt}
              </span>
            </div>
            <div className="mt-0.5 flex gap-0.5" dir="ltr">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={12}
                  className={
                    n <= review.rating
                      ? "fill-accent-400 text-accent-400"
                      : "text-ink/20"
                  }
                />
              ))}
            </div>
            {review.comment && (
              <p className="pl-3 pr-3 mt-1.5 text-sm leading-6 text-ink/70">
                {review.comment}
              </p>
            )}
          </div>
        </div>
      ))}
      {visibleCount < reviews.length && (
        <button
          onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
          className="rounded-full border border-dashed border-line px-3.5 py-1.5 text-xs font-medium text-primary-700 hover:border-primary-300"
        >
          {dict.common.loadMore}
        </button>
      )}
    </div>
  );
}
