"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { getUserById } from "@/lib/data";
import { getAccent, initials } from "@/lib/accents";
import { formatDate } from "@/lib/format";

export default function CommunityReviews({
  communityId,
  locale,
  dict
}: {
  communityId: string;
  locale: Locale;
  dict: Dictionary;
}) {
  const { user, role, isSubscribed } = useAuth();
  const store = usePlatformStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reviews = store.reviews.all
    .filter((r) => r.reviewableType === "community" && r.reviewableId === communityId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const alreadyReviewed = !!user && reviews.some((r) => r.studentId === user.id);
  const canReview = role === "student" && !!user && isSubscribed(communityId) && !alreadyReviewed;

  function submit() {
    if (!user || !comment.trim()) return;
    store.reviews.add({
      id: `review-local-${Date.now()}`,
      studentId: user.id,
      reviewableType: "community",
      reviewableId: communityId,
      rating: rating as 1 | 2 | 3 | 4 | 5,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    });
    setComment("");
    setSubmitted(true);
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} size={16} className={n <= Math.round(average) ? "fill-accent-500 text-accent-500" : "text-ink/20"} />
          ))}
        </div>
        <span className="font-mono text-sm font-semibold text-ink">{average.toFixed(1)}</span>
        <span className="text-xs text-ink/50">{t(dict.communityDetails.reviewsCount, { count: reviews.length })}</span>
      </div>

      {(canReview || submitted) && (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
          {submitted ? (
            <p className="text-sm text-success">{dict.communityDetails.reviewSubmitted}</p>
          ) : (
            <>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                    <Star size={20} className={n <= rating ? "fill-accent-500 text-accent-500" : "text-ink/20"} />
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder={dict.communityDetails.reviewPlaceholder}
                className="mt-2 w-full resize-none rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
              <button
                onClick={submit}
                disabled={!comment.trim()}
                className="mt-2 rounded-full bg-primary-500 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40"
              >
                {dict.communityDetails.submitReview}
              </button>
            </>
          )}
        </div>
      )}

      {reviews.length > 0 && (
        <div className="mt-5 space-y-4">
          {reviews.slice(0, 6).map((review) => {
            const author = getUserById(review.studentId);
            const accent = getAccent(author?.avatarAccent ?? "ink");
            return (
              <div key={review.id} className="flex items-start gap-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white ${accent.gradient}`}>
                  {initials(author?.name ?? "")}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{author?.name}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={11} className={n <= review.rating ? "fill-accent-500 text-accent-500" : "text-ink/20"} />
                      ))}
                    </div>
                    <span className="text-[11px] text-ink/40">{formatDate(review.createdAt, locale)}</span>
                  </div>
                  {review.comment && <p className="mt-1 text-sm leading-6 text-ink/70">{review.comment}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
